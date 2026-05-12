/**
 * Índice del Dominio PAYMENTS
 * 
 * Este archivo centraliza y exporta las interfaces públicas del dominio PAYMENTS.
 * Otros dominios deben importar desde este punto para mantener los límites claros.
 */

// Modelos del dominio
const PaymentEvent = require('./models/PaymentEvent');

// Interfaces públicas para comunicación entre dominios
const publicInterfaces = require('./interfaces/public');

// Servicios internos
const WebhookEventHandler = require('./services/WebhookEventHandler');
const webhookSignatureService = require('./services/WebhookSignatureService');
const paymentGatewayService = require('./services/paymentGatewayService');

module.exports = {
  // Modelos
  models: {
    PaymentEvent
  },

  // Interfaces públicas para otros dominios
  interfaces: {
    public: publicInterfaces
  },

  // Servicios internos (solo uso dentro del dominio)
  services: {
    WebhookEventHandler,
    webhookSignature: webhookSignatureService,
    paymentGateway: paymentGatewayService
  }
};
