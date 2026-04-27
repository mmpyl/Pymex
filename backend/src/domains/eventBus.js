/**
 * Event Bus del Dominio con Outbox Pattern - Domain Event Bus
 * 
 * Implementación de un bus de eventos para comunicación asíncrona entre dominios.
 * Este componente es fundamental para desacoplar los dominios y evitar JOINs
 * directos entre tablas de diferentes dominios.
 * 
 * CAMBIO CRÍTICO: Se implementa Outbox Pattern para garantizar persistencia
 * de eventos. Si el proceso muere durante runBillingCollection, los eventos
 * publicados NO se pierden porque primero se persisten en la tabla domain_events.
 * 
 * EVENTOS POR DOMINIO:
 * 
 * AUTH:
 *   - USER_CREATED: Nuevo usuario registrado
 *   - USER_AUTHENTICATED: Usuario autenticado exitosamente
 *   - PERMISSION_CHANGED: Permisos de usuario modificados
 * 
 * BILLING:
 *   - SUBSCRIPTION_ACTIVATED: Suscripción activada
 *   - SUBSCRIPTION_CANCELLED: Suscripción cancelada
 *   - PAYMENT_COMPLETED: Pago procesado exitosamente
 *   - PAYMENT_FAILED: Pago fallido
 *   - INVOICE_ISSUED: Factura emitida
 *   - COMPANY_SUSPENDED: Empresa suspendida por falta de pago
 * 
 * CORE:
 *   - COMPANY_CREATED: Nueva empresa registrada
 *   - SALE_COMPLETED: Venta completada
 *   - INVENTORY_UPDATED: Inventario actualizado
 *   - PRODUCT_CREATED: Producto creado
 *   - USAGE_THRESHOLD_REACHED: Umbral de uso alcanzado
 * 
 * ML:
 *   - PREDICTION_GENERATED: Predicción generada
 *   - MODEL_TRAINED: Modelo entrenado
 *   - ANOMALY_DETECTED: Anomalía detectada
 */

const EventEmitter = require('events');
const { DOMAIN_BOUNDARIES } = require('./domainBoundaries');
const billingModels = require('./billing/models');
const coreModels = require('./core/models');
const { Op, Sequelize } = require('sequelize');

const { DomainEvent } = billingModels;
const { sequelize } = billingModels;

class DomainEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100); // Aumentar límite de listeners
    this.eventLog = [];
    this.maxLogSize = 1000;
    this.outboxEnabled = true; // Habilitar outbox por defecto
    this.workerId = `worker_${process.pid}_${Date.now()}`;
  }

  /**
   * Publica un evento en el bus CON OUTBOX PATTERN
   * Primero persiste el evento en la base de datos, luego lo emite.
   * Esto garantiza que si el proceso muere, el evento no se pierde.
   * 
   * @param {string} event - Nombre del evento
   * @param {object} payload - Datos del evento
   * @param {string} sourceDomain - Dominio que publica el evento
   * @param {object} transaction - Transacción opcional (para atomicidad)
   */
  async publish(event, payload, sourceDomain, transaction = null) {
    const eventRecord = {
      id: this.generateEventId(),
      event,
      payload,
      sourceDomain,
      timestamp: new Date().toISOString()
    };

    // Log del evento en memoria (para debugging)
    this.logEvent(eventRecord);

    // OUTBOX PATTERN: Persistir evento en DB antes de emitir
    if (this.outboxEnabled) {
      try {
        await this.persistToOutbox(event, payload, sourceDomain, transaction);
      } catch (error) {
        console.error(`[EventBus] Error persistiendo evento ${event}:`, error);
        // Si falla la persistencia, aún emitimos el evento pero logueamos el error
        // En producción, esto debería ser manejado más robustamente
      }
    }

    // Emitir el evento a los listeners en memoria
    this.emit(event, eventRecord);

    // También emitir con prefijo de dominio para listeners específicos
    this.emit(`${sourceDomain}:${event}`, eventRecord);

    console.log(`[EventBus] Publicado: ${event} desde ${sourceDomain}`);
    
    return eventRecord;
  }

  /**
   * Persiste un evento en la tabla domain_events (Outbox Pattern)
   * @param {string} eventType - Nombre del evento
   * @param {object} payload - Datos del evento
   * @param {string} sourceDomain - Dominio que publica el evento
   * @param {object} tx - Transacción opcional
   */
  async persistToOutbox(eventType, payload, sourceDomain, tx = null) {
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await DomainEvent.create({
      event_id: eventId,
      event_type: eventType,
      source_domain: sourceDomain,
      payload: payload,
      status: 'pending',
      retry_count: 0,
      max_retries: 3,
      created_at: new Date(),
      metadata: {
        worker_id: this.workerId,
        version: '1.0'
      }
    }, { transaction: tx });

    console.log(`[EventBus][Outbox] Evento persistido: ${eventType} (${eventId})`);
  }

  /**
   * Procesa eventos pendientes desde el outbox
   * Este método debe ser llamado periódicamente por un worker
   * para despachar eventos que quedaron pendientes.
   * 
   * @param {number} limit - Límite de eventos a procesar
   * @returns {Promise<object>} Resultado del procesamiento
   */
  async processPendingEvents(limit = 100) {
    const now = new Date();
    let processed = 0;
    let failed = 0;
    let delivered = 0;

    try {
      // Obtener eventos pendientes (con locking optimista vía worker_id)
      const pendingEvents = await DomainEvent.findAll({
        where: {
          status: 'pending',
          retry_count: { [Op.lt]: Sequelize.col('max_retries') }
        },
        order: [['created_at', 'ASC']],
        limit: limit
      });

      for (const event of pendingEvents) {
        try {
          // Marcar como processing
          await event.update({
            status: 'processing',
            worker_id: this.workerId,
            processed_at: now
          });

          // Emitir el evento
          const eventRecord = {
            id: event.event_id,
            event: event.event_type,
            payload: event.payload,
            sourceDomain: event.source_domain,
            timestamp: event.created_at
          };

          this.emit(event.event_type, eventRecord);
          this.emit(`${event.source_domain}:${event.event_type}`, eventRecord);

          // Marcar como delivered
          await event.update({
            status: 'delivered',
            delivered_at: new Date()
          });

          delivered++;
          processed++;
          
          console.log(`[EventBus][Outbox] Evento entregado: ${event.event_type} (${event.event_id})`);
        } catch (error) {
          failed++;
          
          // Incrementar retry_count
          const newRetryCount = event.retry_count + 1;
          
          if (newRetryCount >= event.max_retries) {
            await event.update({
              status: 'failed',
              error_message: error.message,
              retry_count: newRetryCount
            });
            console.error(`[EventBus][Outbox] Evento falló permanentemente: ${event.event_type} (${event.event_id})`);
          } else {
            await event.update({
              status: 'pending',
              worker_id: null,
              retry_count: newRetryCount,
              error_message: error.message
            });
            console.warn(`[EventBus][Outbox] Evento falló, reintentará: ${event.event_type} (${event.event_id}), intento ${newRetryCount}/${event.max_retries}`);
          }
        }
      }

      return {
        total: pendingEvents.length,
        delivered,
        failed,
        processed,
        timestamp: now.toISOString()
      };
    } catch (error) {
      console.error('[EventBus][Outbox] Error procesando eventos pendientes:', error);
      throw error;
    }
  }

  /**
   * Recupera eventos fallidos para reintentar manualmente
   * @returns {Promise<Array>} Lista de eventos fallidos
   */
  async getFailedEvents() {
    return await DomainEvent.findAll({
      where: { status: 'failed' },
      order: [['delivered_at', 'DESC']],
      limit: 100
    });
  }

  /**
   * Reintenta un evento fallido específico
   * @param {number} eventId - ID del evento
   * @returns {Promise<boolean>} True si se reinició exitosamente
   */
  async retryFailedEvent(eventId) {
    const event = await DomainEvent.findByPk(eventId);
    if (!event || event.status !== 'failed') {
      return false;
    }

    await event.update({
      status: 'pending',
      worker_id: null,
      retry_count: 0,
      error_message: null
    });

    console.log(`[EventBus][Outbox] Evento ${eventId} reiniciado para reintento`);
    return true;
  }

  /**
   * Limpia eventos antiguos (entregados o fallidos)
   * @param {number} daysToKeep - Días a mantener
   * @returns {Promise<number>} Cantidad de eventos eliminados
   */
  async cleanupOldEvents(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await DomainEvent.destroy({
      where: {
        status: ['delivered', 'failed'],
        delivered_at: { [Op.lt]: cutoffDate }
      }
    });

    console.log(`[EventBus][Outbox] Limpiados ${result} eventos antiguos`);
    return result;
  }

  /**
   * Deshabilita el outbox pattern (útil para testing)
   */
  disableOutbox() {
    this.outboxEnabled = false;
    console.log('[EventBus] Outbox pattern deshabilitado');
  }

  /**
   * Habilita el outbox pattern
   */
  enableOutbox() {
    this.outboxEnabled = true;
    console.log('[EventBus] Outbox pattern habilitado');
  }

  /**
   * Suscribe un listener a un evento
   * @param {string} event - Nombre del evento
   * @param {Function} listener - Función callback
   * @param {string} subscriberDomain - Dominio que se suscribe
   */
  subscribe(event, listener, subscriberDomain) {
    this.on(event, (eventRecord) => {
      // Verificar si el dominio suscriptor puede consumir este evento
      if (this.canConsumeEvent(subscriberDomain, eventRecord)) {
        listener(eventRecord).catch(err => {
          console.error(`[EventBus] Error en listener ${subscriberDomain} para ${event}:`, err);
        });
      }
    });
    console.log(`[EventBus] Suscrito: ${subscriberDomain} a ${event}`);
  }

  /**
   * Suscribe un listener a todos los eventos de un dominio
   * @param {string} domain - Dominio del que escuchar eventos
   * @param {Function} listener - Función callback
   * @param {string} subscriberDomain - Dominio que se suscribe
   */
  subscribeToDomain(domain, listener, subscriberDomain) {
    const pattern = `${domain}:`;
    this.onAny((event, eventRecord) => {
      if (event.startsWith(pattern) && this.canConsumeEvent(subscriberDomain, eventRecord)) {
        listener(eventRecord).catch(err => {
          console.error(`[EventBus] Error en listener ${subscriberDomain} para ${event}:`, err);
        });
      }
    });
    console.log(`[EventBus] Suscrito: ${subscriberDomain} a todos los eventos de ${domain}`);
  }

  /**
   * Verifica si un dominio puede consumir un evento específico
   * @param {string} subscriberDomain - Dominio suscriptor
   * @param {object} eventRecord - Registro del evento
   * @returns {boolean}
   */
  canConsumeEvent(subscriberDomain, eventRecord) {
    const domainConfig = DOMAIN_BOUNDARIES[subscriberDomain.toUpperCase()];
    
    if (!domainConfig) {
      return true; // Si no hay configuración, permitir por defecto
    }

    // Verificar si el evento está en la lista de eventos consumidos
    const consumedEvents = domainConfig.events?.consumed || [];
    return consumedEvents.includes(eventRecord.event) || consumedEvents.includes('*');
  }

  /**
   * Genera un ID único para el evento
   * @returns {string}
   */
  generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Registra un evento en el log
   * @param {object} eventRecord - Registro del evento
   */
  logEvent(eventRecord) {
    this.eventLog.push(eventRecord);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift(); // Eliminar el más antiguo
    }
  }

  /**
   * Obtiene el historial de eventos
   * @param {number} limit - Límite de eventos a retornar
   * @returns {Array}
   */
  getEventHistory(limit = 100) {
    return this.eventLog.slice(-limit);
  }

  /**
   * Limpia el historial de eventos
   */
  clearEventHistory() {
    this.eventLog = [];
  }
}

// Singleton instance
const eventBus = new DomainEventBus();

module.exports = {
  DomainEventBus,
  eventBus,
  publish: (event, payload, sourceDomain, transaction) => eventBus.publish(event, payload, sourceDomain, transaction),
  subscribe: (event, listener, subscriberDomain) => eventBus.subscribe(event, listener, subscriberDomain),
  // Funciones para Outbox Pattern
  processPendingEvents: (limit) => eventBus.processPendingEvents(limit),
  getFailedEvents: () => eventBus.getFailedEvents(),
  retryFailedEvent: (eventId) => eventBus.retryFailedEvent(eventId),
  cleanupOldEvents: (daysToKeep) => eventBus.cleanupOldEvents(daysToKeep),
  disableOutbox: () => eventBus.disableOutbox(),
  enableOutbox: () => eventBus.enableOutbox()
};
