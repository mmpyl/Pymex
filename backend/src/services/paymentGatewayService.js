const axios = require('axios');

const createCheckoutForPago = async (pago, idempotencyKey) => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const appUrl = process.env.APP_URL || 'http://localhost:5173';

  if (!stripeKey) {
    return {
      provider: 'mock',
      checkout_url: `https://mock-gateway.sapyme.local/checkout?pago_id=${pago.id}&monto=${pago.monto}`,
      external_id: `mock_${pago.id}_${Date.now()}`
    };
  }

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

  return {
    provider: 'stripe',
    checkout_url: data.url,
    external_id: data.id
  };
};

module.exports = { createCheckoutForPago };
