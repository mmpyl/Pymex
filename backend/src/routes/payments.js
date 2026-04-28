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

/**
 * @swagger
 * /api/payments/events:
 *   get:
 *     summary: Lista eventos de pagos
 *     description: Obtiene una lista paginada de eventos de pagos recibidos desde Stripe
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Tamaño de página
 *       - in: query
 *         name: proveedor
 *         schema:
 *           type: string
 *         description: Filtrar por proveedor (stripe)
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de evento
 *       - in: query
 *         name: event_id
 *         schema:
 *           type: string
 *         description: Filtrar por ID del evento
 *     responses:
 *       200:
 *         description: Lista de eventos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PaymentEvent'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       500:
 *         description: Error interno del servidor
 */
router.get('/events', async (req, res) => {
  await webhookController.listPaymentEvents(req, res);
});

/**
 * @swagger
 * /api/payments/events/{id}:
 *   get:
 *     summary: Obtiene un evento de pago por ID
 *     description: Obtiene los detalles de un evento de pago específico
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Evento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentEvent'
 *       404:
 *         description: Evento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/events/:id', async (req, res) => {
  await webhookController.getPaymentEvent(req, res);
});

module.exports = router;
