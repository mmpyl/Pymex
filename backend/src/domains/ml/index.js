/**
 * Índice del Dominio ML
 * 
 * Este archivo centraliza las exportaciones del dominio ML (Machine Learning).
 * El dominio ML es responsable de:
 * - Predicciones de ventas, demanda y stock
 * - Modelos de machine learning
 * - Análisis predictivo para clientes Enterprise
 * 
 * Límites del dominio:
 * - Solo lee datos históricos del dominio CORE (no los modifica)
 * - No tiene dependencias directas con otros dominios excepto CORE (lectura)
 * - Expone servicios premium para clientes con api_access
 */

// Servicios
const { MLPremiumService, getInstance: getMLPremiumService } = require('./services/mlPremiumService');

// Modelos
const mlModels = require('./models');

module.exports = {
  // Servicios
  MLPremiumService,
  getMLPremiumService,
  
  // Modelos
  ...mlModels,
  
  // Utilidad para obtener instancia singleton
  getService: () => getMLPremiumService()
};
