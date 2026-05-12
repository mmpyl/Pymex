/**
 * ML Domain Public Interface
 * 
 * Este archivo define la interfaz pública del dominio ML.
 * Centraliza las exportaciones que otros módulos pueden utilizar.
 * 
 * Uso recomendado:
 * const { routes, controllers, services } = require('./domains/ml/interfaces/public');
 */

// Rutas
const mlRoutes = require('../routes/ml');

// Controladores
const MLController = require('../controllers/mlController');

// Servicios
const { MLPremiumService, getInstance: getMLPremiumService } = require('../services/mlPremiumService');

// Modelos
const mlModels = require('../models');

module.exports = {
  // Rutas
  routes: {
    ml: mlRoutes
  },
  
  // Controladores
  controllers: {
    MLController
  },
  
  // Servicios
  services: {
    MLPremiumService,
    getMLPremiumService
  },
  
  // Modelos
  models: {
    ...mlModels
  },
  
  // Helper para obtener el servicio singleton
  getService: () => getMLPremiumService()
};
