// backend/src/services/paymentGatewayService.js
// Integración con pasarela de pagos (Stripe, mock, etc.)
// MIGRACIÓN: Imports separados por dominio (billingModels), publica eventos PAYMENT_COMPLETED/FAILED

const axios = require('axios');
const billingModels = require('../domains/billing/models');
const eventBus = require('../domains/eventBus');

const { Pago, PaymentEvent } = billingModels;

const createCheckoutForPago = async (pago, idempotencyKey) => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const appUrl = process.env.APP_URL || 'http://localhost:5173';

  if (!stripeKey) {
    // Mock para desarrollo
    const result = {
      provider: 'mock',
      checkout_url: `https://mock-gateway.sapyme.local/checkout?pago_id=${pago.id}&monto=${pago.monto}`,
      external_id: `mock_${pago.id}_${Date.now()}`
    };
    
    // Publicar evento de pago iniciado (mock)
    eventBus.publish('PAYMENT_INITIATED', {
      pago_id: pago.id,
      empresa_id: pago.empresa_id,
      monto: pago.monto,
      provider: 'mock'
    }, 'BILLING');
    
    return result;
  }

  try {
    const body = new URLSearchParams({
      mode: 'payment',
      'line_items[0][price_data][currency]': pago.moneda.toLowerCase() === 'pen' ? 'usd' : pago.moneda.toLowerCase(),
      'line_items[0][price_data][product_data][name]': `Suscripción SaaS #${pago.id}`,
      'line_items[0][price_data][unit_amount]': String(Math.round(Number(pago.monto) * 100)),
      'line_items[0][quantity]': '1',
      success_url: `${appUrl}/admin?payment=success&pago_id=${pago.id}`,
      cancel_url: `${appUrl}/admin?payment=cancel&pago_id=${pago.id}`,
      'metadata[pago_id]': String(pago.id),
      'metadata[empresa_id]': String(pago.empresa_id)
    });

    const { data } = await axios.post('https://api.stripe.com/v1/checkout/sessions', body, {
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Idempotency-Key': idempotencyKey
      },
      timeout: 15000
    });

    // Publicar evento PAYMENT_INITIATED
    eventBus.publish('PAYMENT_INITIATED', {
      pago_id: pago.id,
      empresa_id: pago.empresa_id,
      monto: pago.monto,
      provider: 'stripe',
      external_id: data.id
    }, 'BILLING');

    return {
      provider: 'stripe',
      checkout_url: data.url,
      external_id: data.id
    };
  } catch (error) {
    // Publicar evento PAYMENT_FAILED
    eventBus.publish('PAYMENT_FAILED', {
      pago_id: pago.id,
      empresa_id: pago.empresa_id,
      error: error.message,
      provider: 'stripe'
    }, 'BILLING');
    
    throw error;
  }
};

module.exports = { createCheckoutForPago };
