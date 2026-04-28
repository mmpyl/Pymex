/**
 * Índice del Dominio BILLING
 * 
 * Este archivo centraliza y exporta las interfaces públicas del dominio BILLING.
 * Otros dominios deben importar desde este punto para mantener los límites claros.
 */

// Interfaces públicas para comunicación entre dominios
const publicInterfaces = require('./interfaces/public');

// Servicios de aplicación (uso interno del dominio)
const comprobanteService = require('./services/comprobanteService');

module.exports = {
  // Interfaces públicas para otros dominios
  interfaces: {
    public: publicInterfaces
  },
  
  // Servicios internos (solo uso dentro del dominio)
  services: {
    comprobante: comprobanteService
  }
};
