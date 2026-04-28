/**
 * Worker de Procesamiento de Eventos de Pagos
 * 
 * Este worker escucha eventos relacionados con pagos publicados por el
 * dominio PAYMENTS y ejecuta las acciones correspondientes en el dominio
 * BILLING para completar el flujo de pago.
 * 
 * EVENTOS QUE PROCESA:
 * - CHECKOUT_COMPLETED: Aplica el pago y reactiva la suscripción
 * - PAYMENT_INTENT_SUCCEEDED: Registra el éxito del payment intent
 * - PAYMENT_INTENT_FAILED: Notifica fallo del payment intent
 * 
 * USO:
 *   node src/workers/paymentEventProcessor.js
 */

const eventBus = require('../domains/eventBus');
const billingModels = require('../domains/billing/models');
const { applyPaymentAndReactivate } = require('../services/billingService');
const logger = require('../utils/logger');

const { Pago, Suscripcion } = billingModels;
const { sequelize } = billingModels;

let isRunning = false;

/**
 * Maneja evento CHECKOUT_COMPLETED
 * Aplica el pago y reactiva la suscripción/empresa
 */
async function handleCheckoutCompleted(event) {
  const { pago_id, empresa_id, stripe_session_id, event_id } = event.payload;
  
  if (!pago_id) {
    logger.warn('[PaymentEventWorker] CHECKOUT_COMPLETED sin pago_id', { event });
    return;
  }

  try {
    logger.info(`[PaymentEventWorker] Procesando CHECKOUT_COMPLETED para pago_id=${pago_id}`);
    
    // Aplicar pago y reactivar
    await applyPaymentAndReactivate(pago_id, stripe_session_id);
    
    logger.info(`[PaymentEventWorker] Pago ${pago_id} procesado exitosamente`);
    
    // Publicar evento de éxito
    eventBus.publish('PAYMENT_PROCESSED', {
      pago_id,
      empresa_id,
      stripe_session_id,
      processed_at: new Date().toISOString()
    }, 'PAYMENTS');
    
  } catch (error) {
    logger.error(`[PaymentEventWorker] Error procesando pago ${pago_id}:`, error.message, {
      stack: error.stack,
      event_id
    });
    
    // Publicar evento de fallo
    eventBus.publish('PAYMENT_PROCESSING_FAILED', {
      pago_id,
      empresa_id,
      error: error.message,
      failed_at: new Date().toISOString()
    }, 'PAYMENTS');
  }
}

/**
 * Maneja evento PAYMENT_INTENT_SUCCEEDED
 * Solo registra el éxito del payment intent (ya fue procesado por checkout)
 */
async function handlePaymentIntentSucceeded(event) {
  const { pago_id, stripe_payment_intent_id, amount, currency } = event.payload;
  
  logger.info(`[PaymentEventWorker] PAYMENT_INTENT_SUCCEEDED para pago_id=${pago_id || 'N/A'}`, {
    stripe_payment_intent_id,
    amount,
    currency
  });
  
  // Este evento es informativo, el pago ya se procesó en checkout.session.completed
  // Se puede usar para actualizar referencias o hacer logging adicional
}

/**
 * Maneja evento PAYMENT_INTENT_FAILED
 * Notifica el fallo del payment intent
 */
async function handlePaymentIntentFailed(event) {
  const { pago_id, stripe_payment_intent_id, failure_reason } = event.payload;
  
  logger.warn(`[PaymentEventWorker] PAYMENT_INTENT_FAILED para pago_id=${pago_id || 'N/A'}`, {
    stripe_payment_intent_id,
    failure_reason
  });
  
  if (pago_id) {
    try {
      // Actualizar estado del pago a fallido
      const tx = await sequelize.transaction();
      
      try {
        await Pago.update(
          { 
            estado: 'fallido',
            referencia: stripe_payment_intent_id
          },
          { 
            where: { id: pago_id },
            transaction: tx 
          }
        );
        
        await tx.commit();
        
        logger.info(`[PaymentEventWorker] Pago ${pago_id} marcado como fallido`);
      } catch (error) {
        await tx.rollback();
        throw error;
      }
    } catch (error) {
      logger.error(`[PaymentEventWorker] Error actualizando pago fallido ${pago_id}:`, error.message);
    }
  }
}

/**
 * Maneja evento SUBSCRIPTION_UPDATED desde Stripe
 */
async function handleSubscriptionUpdated(event) {
  const { stripe_subscription_id, status } = event.payload;
  
  logger.info(`[PaymentEventWorker] SUBSCRIPTION_UPDATED: ${stripe_subscription_id} -> ${status}`);
  
  // Aquí se podría sincronizar el estado de la suscripción en Stripe con la local
  // Por ahora solo logueamos el evento
}

/**
 * Maneja evento SUBSCRIPTION_DELETED desde Stripe
 */
async function handleSubscriptionDeleted(event) {
  const { stripe_subscription_id } = event.payload;
  
  logger.info(`[PaymentEventWorker] SUBSCRIPTION_DELETED: ${stripe_subscription_id}`);
  
  // Aquí se podría cancelar la suscripción localmente
  // Por ahora solo logueamos el evento
}

/**
 * Registra todos los listeners para eventos de pagos
 */
function registerListeners() {
  logger.info('[PaymentEventWorker] Registrando listeners para eventos de pagos...');
  
  // Listener para CHECKOUT_COMPLETED
  eventBus.on('CHECKOUT_COMPLETED', async (event) => {
    if (isRunning) {
      logger.warn('[PaymentEventWorker] Procesamiento anterior en curso, esperando...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    await handleCheckoutCompleted(event);
  });
  
  // Listener para PAYMENT_INTENT_SUCCEEDED
  eventBus.on('PAYMENT_INTENT_SUCCEEDED', handlePaymentIntentSucceeded);
  
  // Listener para PAYMENT_INTENT_FAILED
  eventBus.on('PAYMENT_INTENT_FAILED', handlePaymentIntentFailed);
  
  // Listener para SUBSCRIPTION_UPDATED
  eventBus.on('SUBSCRIPTION_UPDATED', handleSubscriptionUpdated);
  
  // Listener para SUBSCRIPTION_DELETED
  eventBus.on('SUBSCRIPTION_DELETED', handleSubscriptionDeleted);
  
  logger.info('[PaymentEventWorker] ✅ Listeners registrados exitosamente');
}

/**
 * Inicia el worker de procesamiento de eventos de pagos
 */
async function start() {
  logger.info('[PaymentEventWorker] Iniciando worker de procesamiento de eventos de pagos...');
  
  // Verificar conexión a DB
  try {
    await sequelize.authenticate();
    logger.info('[PaymentEventWorker] ✅ Conectado a PostgreSQL');
  } catch (error) {
    logger.error('[PaymentEventWorker] ❌ Error conectando a PostgreSQL:', error.message);
    process.exit(1);
  }
  
  // Registrar listeners
  registerListeners();
  
  logger.info('[PaymentEventWorker] Worker iniciado exitosamente');
  logger.info('[PaymentEventWorker] Escuchando eventos: CHECKOUT_COMPLETED, PAYMENT_INTENT_SUCCEEDED, PAYMENT_INTENT_FAILED, SUBSCRIPTION_UPDATED, SUBSCRIPTION_DELETED');
}

/**
 * Detiene el worker gracefulmente
 */
function stop() {
  logger.info('[PaymentEventWorker] Deteniendo worker...');
  isRunning = false;
  
  // Remover todos los listeners
  eventBus.removeAllListeners('CHECKOUT_COMPLETED');
  eventBus.removeAllListeners('PAYMENT_INTENT_SUCCEEDED');
  eventBus.removeAllListeners('PAYMENT_INTENT_FAILED');
  eventBus.removeAllListeners('SUBSCRIPTION_UPDATED');
  eventBus.removeAllListeners('SUBSCRIPTION_DELETED');
  
  logger.info('[PaymentEventWorker] Worker detenido');
}

// Manejo de señales para shutdown graceful
process.on('SIGTERM', () => {
  logger.info('[PaymentEventWorker] Señal SIGTERM recibida');
  stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('[PaymentEventWorker] Señal SIGINT recibida');
  stop();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  logger.error('[PaymentEventWorker] Excepción no capturada:', error);
  // No salir inmediatamente, intentar continuar
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('[PaymentEventWorker] Promesa rechazada no manejada:', reason);
  // No salir inmediatamente, intentar continuar
});

// Iniciar si este es el script principal
if (require.main === module) {
  start().catch((error) => {
    logger.error('[PaymentEventWorker] Error fatal al iniciar:', error);
    process.exit(1);
  });
}

module.exports = { start, stop, handleCheckoutCompleted, handlePaymentIntentFailed };
