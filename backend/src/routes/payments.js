const router = require('express').Router();
const paymentsDomain = require('../domains/payments');

// Crear controller con dependencias inyectadas desde el dominio
const webhookController = paymentsDomain.interfaces.public.controllers.createWebhookController({
  PaymentEvent: paymentsDomain.models.PaymentEvent
});

/**
 * @swagger
 * /api/payments/webhook/stripe:
 *   post:
 *     summary: Webhook para eventos de Stripe
 *     description: Endpoint para recibir eventos de Stripe (checkout.session.completed, payment_intent.succeeded, etc.)
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               type:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Evento procesado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 processed:
 *                   type: boolean
 *                 deduplicated:
 *                   type: boolean
 *                 event_id:
 *                   type: string
 *       400:
 *         description: Firma inválida o payload incorrecto
 *       500:
 *         description: Error interno procesando el webhook
 */
router.post('/webhook/stripe', async (req, res) => {
  await webhookController.handleStripeWebhook(req, res);
});

/**
 * @swagger
 * /api/payments/webhook/health:
 *   get:
 *     summary: Health check para webhooks
 *     description: Verifica que el servicio de webhooks esté operativo
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Servicio operativo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 service:
 *                   type: string
 *                   example: payments-webhook
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/webhook/health', (req, res) => {
  webhookController.healthCheck(req, res);
});

module.exports = router;
