/**
 * Event Bus del Dominio - Domain Event Bus
 * 
 * Implementación de un bus de eventos para comunicación asíncrona entre dominios.
 * Este componente es fundamental para desacoplar los dominios y evitar JOINs
 * directos entre tablas de diferentes dominios.
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

class DomainEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100); // Aumentar límite de listeners
    this.eventLog = [];
    this.maxLogSize = 1000;
  }

  /**
   * Publica un evento en el bus
   * @param {string} event - Nombre del evento
   * @param {object} payload - Datos del evento
   * @param {string} sourceDomain - Dominio que publica el evento
   */
  publish(event, payload, sourceDomain) {
    const eventRecord = {
      id: this.generateEventId(),
      event,
      payload,
      sourceDomain,
      timestamp: new Date().toISOString()
    };

    // Log del evento (para debugging y auditoría)
    this.logEvent(eventRecord);

    // Emitir el evento
    this.emit(event, eventRecord);

    // También emitir con prefijo de dominio para listeners específicos
    this.emit(`${sourceDomain}:${event}`, eventRecord);

    console.log(`[EventBus] Publicado: ${event} desde ${sourceDomain}`);
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
    const { DOMAIN_BOUNDARIES } = require('../domainBoundaries');
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
  publish: (event, payload, sourceDomain) => eventBus.publish(event, payload, sourceDomain),
  subscribe: (event, listener, subscriberDomain) => eventBus.subscribe(event, listener, subscriberDomain)
};
