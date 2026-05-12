/**
 * Interfaces Públicas del Dominio PAYMENTS
 * 
 * Este archivo exporta las interfaces públicas que otros dominios pueden usar
 * para interactuar con el dominio PAYMENTS, respetando los límites del dominio.
 */

const WebhookController = require('../controllers/WebhookController');
const webhookSignatureService = require('../services/WebhookSignatureService');
const WebhookEventHandler = require('../services/WebhookEventHandler');
const paymentGatewayService = require('../services/paymentGatewayService');

// Factory para crear instancia del controller con dependencias inyectadas
const createWebhookController = (models) => {
  return new WebhookController(models);
};

module.exports = {
  /**
   * Controllers - Para uso en rutas
   */
  controllers: {
    createWebhookController
  },

  /**
   * Servicios públicos
   */
  services: {
    webhookSignature: webhookSignatureService,
    WebhookEventHandler,
    paymentGateway: paymentGatewayService
  }
};
