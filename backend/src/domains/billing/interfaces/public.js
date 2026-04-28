/**
 * Interfaces Públicas del Dominio BILLING
 * 
 * Este archivo exporta las interfaces públicas que otros dominios pueden usar
 * para interactuar con el dominio BILLING, respetando los límites del dominio.
 */

const comprobanteService = require('../services/comprobanteService');

module.exports = {
  /**
   * Servicio de Comprobantes - Interfaz pública
   * 
   * Otros dominios pueden usar este servicio para acceder a comprobantes
   * sin acoplamiento directo a los modelos internos.
   */
  comprobanteService: {
    obtenerComprobantesPorEmpresa: comprobanteService.obtenerComprobantesPorEmpresa.bind(comprobanteService),
    obtenerComprobantePorId: comprobanteService.obtenerComprobantePorId.bind(comprobanteService),
    validarPropiedadComprobante: comprobanteService.validarPropiedadComprobante.bind(comprobanteService)
  }
};
