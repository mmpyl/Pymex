/**
 * WebhookEventHandler - Manejador de eventos de webhooks
 * 
 * Este servicio procesa los eventos recibidos desde proveedores de pago,
 * aplicando idempotencia y disparando las acciones correspondientes.
 */

const eventBus = require('../../eventBus');
const logger = require('../../../utils/logger');

class WebhookEventHandler {
  constructor({ PaymentEvent }) {
    this.PaymentEvent = PaymentEvent;
  }

  /**
   * Procesa un evento de webhook con idempotencia
   * 
   * @param {Object} event - El evento recibido
   * @param {string} proveedor - El proveedor del evento (stripe, mock, etc.)
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<{processed: boolean, deduplicated: boolean, result?: any}>}
   */
  async processEvent(event, proveedor, options = {}) {
    const { tx } = options;
    
    if (!event?.id || !event?.type) {
      throw new Error('Evento inválido: falta id o type');
    }

    // Verificar idempotencia
    const existingEvent = await this.PaymentEvent.findOne({
      where: { event_id: event.id }
    });

    if (existingEvent) {
      logger.info(`[WebhookEventHandler] Evento duplicado detectado: ${event.id}`);
      return { processed: false, deduplicated: true };
    }

    // Persistir el evento
    await this.PaymentEvent.create({
      proveedor,
      event_id: event.id,
      tipo: event.type,
      payload: event
    }, { transaction: tx });

    logger.info(`[WebhookEventHandler] Evento persistido: ${event.id} (${event.type})`);

    // Procesar según el tipo de evento
    const result = await this._dispatchEvent(event);

    return { processed: true, deduplicated: false, result };
  }

  /**
   * Despacha el evento al handler correspondiente
   * 
   * @param {Object} event - El evento a procesar
   * @returns {Promise<any>}
   */
  async _dispatchEvent(event) {
    const eventType = event.type;

    switch (eventType) {
      case 'checkout.session.completed':
        return this._handleCheckoutSessionCompleted(event);
      
      case 'payment_intent.succeeded':
        return this._handlePaymentIntentSucceeded(event);
      
      case 'payment_intent.payment_failed':
        return this._handlePaymentIntentFailed(event);
      
      case 'customer.subscription.updated':
        return this._handleSubscriptionUpdated(event);
      
      case 'customer.subscription.deleted':
        return this._handleSubscriptionDeleted(event);
      
      default:
        logger.info(`[WebhookEventHandler] Evento sin handler específico: ${eventType}`);
        // Publicar evento genérico para que otros dominios puedan escuchar
        eventBus.publish('PAYMENT_WEBHOOK_RECEIVED', {
          event_id: event.id,
          tipo: eventType,
          proveedor: 'stripe'
        }, 'PAYMENTS');
        
        return { handled: false, eventType };
    }
  }

  /**
   * Maneja evento checkout.session.completed
   * 
   * @param {Object} event - Evento de Stripe
   * @returns {Promise<Object>}
   */
  async _handleCheckoutSessionCompleted(event) {
    logger.info(`[WebhookEventHandler] Procesando checkout.session.completed: ${event.id}`);
    
    const sessionId = event.data?.object?.id;
    const paymentId = Number(event.data?.object?.metadata?.pago_id);
    const empresaId = Number(event.data?.object?.metadata?.empresa_id);

    if (!paymentId) {
      logger.warn(`[WebhookEventHandler] checkout.session.completed sin pago_id en metadata: ${event.id}`);
      return { handled: true, skipped: true, reason: 'no_pago_id' };
    }

    // Publicar evento para que el dominio BILLING lo procese
    eventBus.publish('CHECKOUT_COMPLETED', {
      pago_id: paymentId,
      empresa_id: empresaId,
      stripe_session_id: sessionId,
      event_id: event.id
    }, 'PAYMENTS');

    logger.info(`[WebhookEventHandler] Evento CHECKOUT_COMPLETED publicado para pago_id=${paymentId}`);

    return { 
      handled: true, 
      pago_id: paymentId,
      empresa_id: empresaId,
      stripe_session_id: sessionId
    };
  }

  /**
   * Maneja evento payment_intent.succeeded
   * 
   * @param {Object} event - Evento de Stripe
   * @returns {Promise<Object>}
   */
  async _handlePaymentIntentSucceeded(event) {
    logger.info(`[WebhookEventHandler] Procesando payment_intent.succeeded: ${event.id}`);
    
    const paymentIntentId = event.data?.object?.id;
    const paymentId = Number(event.data?.object?.metadata?.pago_id);

    eventBus.publish('PAYMENT_INTENT_SUCCEEDED', {
      pago_id: paymentId,
      stripe_payment_intent_id: paymentIntentId,
      event_id: event.id,
      amount: event.data?.object?.amount,
      currency: event.data?.object?.currency
    }, 'PAYMENTS');

    return { 
      handled: true, 
      pago_id: paymentId,
      stripe_payment_intent_id: paymentIntentId
    };
  }

  /**
   * Maneja evento payment_intent.payment_failed
   * 
   * @param {Object} event - Evento de Stripe
   * @returns {Promise<Object>}
   */
  async _handlePaymentIntentFailed(event) {
    logger.warn(`[WebhookEventHandler] Procesando payment_intent.payment_failed: ${event.id}`);
    
    const paymentIntentId = event.data?.object?.id;
    const paymentId = Number(event.data?.object?.metadata?.pago_id);
    const failureReason = event.data?.object?.last_payment_error?.message;

    eventBus.publish('PAYMENT_INTENT_FAILED', {
      pago_id: paymentId,
      stripe_payment_intent_id: paymentIntentId,
      event_id: event.id,
      failure_reason: failureReason
    }, 'PAYMENTS');

    return { 
      handled: true, 
      pago_id: paymentId,
      stripe_payment_intent_id: paymentIntentId,
      failure_reason: failureReason
    };
  }

  /**
   * Maneja evento customer.subscription.updated
   * 
   * @param {Object} event - Evento de Stripe
   * @returns {Promise<Object>}
   */
  async _handleSubscriptionUpdated(event) {
    logger.info(`[WebhookEventHandler] Procesando customer.subscription.updated: ${event.id}`);
    
    const subscriptionId = event.data?.object?.id;
    const status = event.data?.object?.status;

    eventBus.publish('SUBSCRIPTION_UPDATED', {
      stripe_subscription_id: subscriptionId,
      status,
      event_id: event.id
    }, 'PAYMENTS');

    return { handled: true, stripe_subscription_id: subscriptionId, status };
  }

  /**
   * Maneja evento customer.subscription.deleted
   * 
   * @param {Object} event - Evento de Stripe
   * @returns {Promise<Object>}
   */
  async _handleSubscriptionDeleted(event) {
    logger.info(`[WebhookEventHandler] Procesando customer.subscription.deleted: ${event.id}`);
    
    const subscriptionId = event.data?.object?.id;

    eventBus.publish('SUBSCRIPTION_DELETED', {
      stripe_subscription_id: subscriptionId,
      event_id: event.id
    }, 'PAYMENTS');

    return { handled: true, stripe_subscription_id: subscriptionId };
  }
}

module.exports = WebhookEventHandler;
