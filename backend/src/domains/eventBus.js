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
    
    // Estado del modo degradado
    this.degradedMode = false;
    this.degradedReason = null;
    this.degradedSince = null;
    
    // Configuración de comportamiento en fallos
    this.strictMode = process.env.EVENTBUS_STRICT_MODE === 'true'; // Si es true, lanza error en fallo de persistencia
    
    // Métricas de fallos
    this.outboxFailures = 0;
    this.lastFailureTime = null;
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
   * @param {boolean} requirePersistence - Si es true, lanza error si falla la persistencia (default: false)
   * @returns {Promise<object>} El registro del evento publicado
   * @throws {Error} Si requirePersistence es true y falla la persistencia, o en strictMode
   */
  async publish(event, payload, sourceDomain, transaction = null, requirePersistence = false) {
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
        
        // Si estábamos en modo degradado, recuperar estado normal
        if (this.degradedMode) {
          this._exitDegradedMode('Persistencia restaurada exitosamente');
        }
      } catch (error) {
        this._handleOutboxFailure(error, event, payload, sourceDomain, requirePersistence);
      }
    }

    // Emitir el evento a los listeners en memoria
    this.emit(event, eventRecord);

    // También emitir con prefijo de dominio para listeners específicos
    this.emit(`${sourceDomain}:${event}`, eventRecord);

    console.log(`[EventBus] Publicado: ${event} desde ${sourceDomain}${this.degradedMode ? ' (MODO DEGRADADO)' : ''}`);
    
    return eventRecord;
  }

  /**
   * Maneja fallos de persistencia en el outbox
   * @private
   */
  _handleOutboxFailure(error, eventType, payload, sourceDomain, requirePersistence) {
    this.outboxFailures++;
    this.lastFailureTime = new Date();

    // Determinar tipo de error
    const isCriticalError = this._isCriticalDatabaseError(error);
    
    // Entrar en modo degradado si es error crítico
    if (isCriticalError && !this.degradedMode) {
      this._enterDegradedMode(error.message);
    }

    const errorMsg = `[EventBus] Error persistiendo evento ${eventType}: ${error.message}`;
    
    // En modo estricto o si se requiere persistencia, lanzar error
    if (this.strictMode || requirePersistence) {
      console.error(errorMsg);
      const publishError = new Error(`Outbox persistence failed for event ${eventType}`);
      publishError.code = 'OUTBOX_PERSISTENCE_FAILED';
      publishError.originalError = error;
      publishError.degradedMode = this.degradedMode;
      throw publishError;
    }

    // Modo degradado: loguear pero continuar
    console.warn(`${errorMsg} - Continuando en MODO DEGRADADO (evento NO persistido)`);
    console.warn(`[EventBus] DETECCIÓN TEMPRANA: La tabla domain_events puede no existir o la DB está caída`);
  }

  /**
   * Determina si un error de base de datos es crítico (tabla no existe, conexión caída, etc.)
   * @private
   */
  _isCriticalDatabaseError(error) {
    const criticalErrors = [
      'ER_NO_SUCH_TABLE',
      'TABLE_NOT_EXIST',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'CONNECTION_LOST',
      'POOL_TIMEOUT',
      'ER_DBACCESS_DENIED_ERROR',
      'ER_ACCESS_DENIED_ERROR'
    ];
    
    const errorCode = error.code || error.parent?.code || '';
    const errorMessage = (error.message || '').toLowerCase();
    
    return criticalErrors.some(code => 
      errorCode.includes(code) || 
      errorMessage.includes(code.toLowerCase()) ||
      errorMessage.includes('table') && errorMessage.includes('not exist')
    );
  }

  /**
   * Entra en modo degradado
   * @private
   */
  _enterDegradedMode(reason) {
    this.degradedMode = true;
    this.degradedReason = reason;
    this.degradedSince = new Date();
    
    console.error('='.repeat(80));
    console.error('[EventBus] ⚠️  ENTRANDO EN MODO DEGRADADO');
    console.error(`[EventBus] Razón: ${reason}`);
    console.error('[EventBus] Los eventos se emitirán en memoria SIN persistencia');
    console.error('[EventBus] ⚠️  ADVERTENCIA: Los eventos se PERDERÁN al reiniciar el proceso');
    console.error('='.repeat(80));
  }

  /**
   * Sale del modo degradado
   * @private
   */
  _exitDegradedMode(reason) {
    if (!this.degradedMode) return;
    
    const duration = Date.now() - this.degradedSince.getTime();
    const durationSecs = Math.round(duration / 1000);
    
    console.log('='.repeat(80));
    console.log('[EventBus] ✅ SALIENDO DE MODO DEGRADADO');
    console.log(`[EventBus] Razón: ${reason}`);
    console.log(`[EventBus] Duración del modo degradado: ${durationSecs}s`);
    console.log(`[EventBus] Fallos acumulados: ${this.outboxFailures}`);
    console.log('='.repeat(80));
    
    this.degradedMode = false;
    this.degradedReason = null;
    this.degradedSince = null;
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
   * Obtiene el estado actual del modo degradado
   * @returns {object} Estado del modo degradado
   */
  getDegradedStatus() {
    return {
      degradedMode: this.degradedMode,
      degradedReason: this.degradedReason,
      degradedSince: this.degradedSince,
      outboxFailures: this.outboxFailures,
      lastFailureTime: this.lastFailureTime,
      outboxEnabled: this.outboxEnabled,
      strictMode: this.strictMode
    };
  }

  /**
   * Habilita el modo estricto (lanza errores en fallos de persistencia)
   */
  enableStrictMode() {
    this.strictMode = true;
    console.log('[EventBus] Modo estricto habilitado - los fallos de persistencia lanzarán errores');
  }

  /**
   * Deshabilita el modo estricto (continúa en modo degradado)
   */
  disableStrictMode() {
    this.strictMode = false;
    console.log('[EventBus] Modo estricto deshabilitado - los fallos de persistencia entrarán en modo degradado');
  }

  /**
   * Resetea las métricas de fallos
   */
  resetFailureMetrics() {
    this.outboxFailures = 0;
    this.lastFailureTime = null;
    console.log('[EventBus] Métricas de fallos reseteadas');
  }

  /**
   * Fuerza la entrada en modo degradado manualmente
   * @param {string} reason - Razón del modo degradado
   */
  forceDegradedMode(reason) {
    this._enterDegradedMode(reason);
  }

  /**
   * Fuerza la salida del modo degradado manualmente
   */
  exitDegradedMode() {
    this._exitDegradedMode('Forzado manualmente');
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
  publish: (event, payload, sourceDomain, transaction, requirePersistence) => 
    eventBus.publish(event, payload, sourceDomain, transaction, requirePersistence),
  subscribe: (event, listener, subscriberDomain) => eventBus.subscribe(event, listener, subscriberDomain),
  // Funciones para Outbox Pattern
  processPendingEvents: (limit) => eventBus.processPendingEvents(limit),
  getFailedEvents: () => eventBus.getFailedEvents(),
  retryFailedEvent: (eventId) => eventBus.retryFailedEvent(eventId),
  cleanupOldEvents: (daysToKeep) => eventBus.cleanupOldEvents(daysToKeep),
  disableOutbox: () => eventBus.disableOutbox(),
  enableOutbox: () => eventBus.enableOutbox(),
  // Funciones para modo degradado
  getDegradedStatus: () => eventBus.getDegradedStatus(),
  enableStrictMode: () => eventBus.enableStrictMode(),
  disableStrictMode: () => eventBus.disableStrictMode(),
  resetFailureMetrics: () => eventBus.resetFailureMetrics(),
  forceDegradedMode: (reason) => eventBus.forceDegradedMode(reason),
  exitDegradedMode: () => eventBus.exitDegradedMode()
};
