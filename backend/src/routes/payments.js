const crypto = require('crypto');
const router = require('express').Router();
const billingModels = require('../domains/billing/models');

const { PaymentEvent } = billingModels;
const { applyPaymentAndReactivate } = require('../services/billingService');

const verifyStripeSignature = (payload, signature, secret) => {
  if (!secret) return true; // fallback para desarrollo
  if (!signature) return false;

  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return signature.includes(expected);
};

router.post('/webhook/stripe', async (req, res) => {
  try {
    const payload = JSON.stringify(req.body);
    const signature = req.headers['stripe-signature'];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!verifyStripeSignature(payload, signature, secret)) {
      return res.status(400).json({ error: 'Firma webhook inválida' });
    }

    const event = req.body;
    if (!event?.id || !event?.type) {
      return res.status(400).json({ error: 'Evento inválido' });
    }

    const exists = await PaymentEvent.findOne({ where: { event_id: event.id } });
    if (exists) {
      return res.status(200).json({ ok: true, deduplicated: true });
    }

    await PaymentEvent.create({
      proveedor: 'stripe',
      event_id: event.id,
      tipo: event.type,
      payload: event
    });

    if (event.type === 'checkout.session.completed') {
      const pagoId = Number(event.data?.object?.metadata?.pago_id);
      if (pagoId) {
        await applyPaymentAndReactivate(pagoId, event.data?.object?.id || null);
      }
    }

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
