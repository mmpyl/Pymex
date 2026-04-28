/**
 * WebhookController - Controlador para webhooks de proveedores de pago
 * 
 * Maneja la recepción y procesamiento de webhooks desde Stripe,
 * aplicando verificación de firma, idempotencia y dispatch de eventos.
 */

const logger = require('../../../utils/logger');
const webhookSignatureService = require('../services/WebhookSignatureService');
const WebhookEventHandler = require('../services/WebhookEventHandler');

class WebhookController {
  constructor({ PaymentEvent }) {
    this.PaymentEvent = PaymentEvent;
    this.eventHandler = new WebhookEventHandler({ PaymentEvent });
  }

  /**
   * Maneja el webhook de Stripe
   * 
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @returns {Promise<void>}
   */
  async handleStripeWebhook(req, res) {
    try {
      // Obtener payload raw para verificación de firma
      const payload = Buffer.isBuffer(req.body) 
        ? req.body.toString('utf8') 
        : JSON.stringify(req.body);
      
      const signature = req.headers['stripe-signature'];
      const secret = process.env.STRIPE_WEBHOOK_SECRET;

      // Verificar firma (en desarrollo sin secret, se acepta sin verificar)
      const isValidSignature = webhookSignatureService.verifyStripeSignature(
        payload, 
        signature, 
        secret
      );

      if (!isValidSignature) {
        logger.warn('[WebhookController] Firma de webhook inválida');
        return res.status(400).json({ 
          error: 'Firma webhook inválida',
          code: 'INVALID_SIGNATURE'
        });
      }

      // Parsear evento
      let event;
      try {
        event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      } catch (parseError) {
        logger.error('[WebhookController] Error parseando payload:', parseError.message);
        return res.status(400).json({ 
          error: 'Payload JSON inválido',
          code: 'INVALID_PAYLOAD'
        });
      }

      // Procesar evento con idempotencia
      const result = await this.eventHandler.processEvent(event, 'stripe');

      if (result.deduplicated) {
        logger.info(`[WebhookController] Evento ya procesado: ${event.id}`);
        return res.status(200).json({ 
          ok: true, 
          deduplicated: true,
          event_id: event.id
        });
      }

      logger.info(`[WebhookController] Webhook procesado exitosamente: ${event.id} (${event.type})`);
      
      return res.status(200).json({ 
        ok: true, 
        processed: true,
        event_id: event.id,
        event_type: event.type,
        result: result.result
      });

    } catch (error) {
      logger.error('[WebhookController] Error procesando webhook:', error.message, {
        stack: error.stack,
        eventId: req.body?.id
      });

      // No revelar detalles del error al cliente
      return res.status(500).json({ 
        error: 'Error procesando webhook',
        code: 'WEBHOOK_PROCESSING_ERROR'
      });
    }
  }

  /**
   * Endpoint de health check para webhooks
   * 
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @returns {void}
   */
  healthCheck(req, res) {
    res.json({ 
      status: 'ok', 
      service: 'payments-webhook',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Lista eventos de webhook con paginación y filtros
   * 
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @returns {Promise<void>}
   */
  async listPaymentEvents(req, res) {
    try {
      const { page = 1, pageSize = 20, proveedor, tipo, event_id } = req.query;
      const pageNum = Math.max(parseInt(page, 10), 1);
      const pageSizeNum = Math.min(Math.max(parseInt(pageSize, 10), 1), 100);
      const offset = (pageNum - 1) * pageSizeNum;

      const where = {};
      if (proveedor) where.proveedor = proveedor;
      if (tipo) where.tipo = tipo;
      if (event_id) where.event_id = event_id;

      const { count, rows } = await this.PaymentEvent.findAndCountAll({
        where,
        order: [['procesado_en', 'DESC']],
        limit: pageSizeNum,
        offset
      });

      return res.json({
        data: rows,
        meta: {
          page: pageNum,
          pageSize: pageSizeNum,
          total: count,
          totalPages: Math.ceil(count / pageSizeNum)
        }
      });
    } catch (error) {
      logger.error('[WebhookController] Error listando eventos:', error.message);
      return res.status(500).json({
        error: 'Error obteniendo eventos de pago',
        code: 'LIST_EVENTS_ERROR'
      });
    }
  }

  /**
   * Obtiene un evento específico por su ID
   * 
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @returns {Promise<void>}
   */
  async getPaymentEvent(req, res) {
    try {
      const { id } = req.params;
      
      const event = await this.PaymentEvent.findByPk(id);
      
      if (!event) {
        return res.status(404).json({
          error: 'Evento no encontrado',
          code: 'EVENT_NOT_FOUND'
        });
      }

      return res.json(event);
    } catch (error) {
      logger.error('[WebhookController] Error obteniendo evento:', error.message);
      return res.status(500).json({
        error: 'Error obteniendo evento de pago',
        code: 'GET_EVENT_ERROR'
      });
    }
  }
}

module.exports = WebhookController;
