/**
 * Índice del Dominio ML (Machine Learning)
 * 
 * Este archivo centraliza las exportaciones del dominio ML.
 * El dominio ML es responsable de:
 * - Predicciones de ventas, demanda y stock
 * - Modelos de machine learning
 * - Análisis predictivo para clientes Enterprise
 * 
 * Límites del dominio:
 * - Solo lee datos históricos del dominio CORE (no los modifica)
 * - No tiene dependencias directas con otros dominios excepto CORE (lectura)
 * - Expone servicios premium para clientes con api_access
 * 
 * Estructura del dominio:
 * ├── controllers/   - Controladores HTTP
 * ├── routes/        - Definición de rutas
 * ├── services/      - Lógica de negocio
 * ├── models/        - Modelos de datos
 * └── interfaces/    - Interfaz pública del dominio
 */

// Servicios
const { MLPremiumService, getInstance: getMLPremiumService } = require('./services/mlPremiumService');

// Controladores
const MLController = require('./controllers/mlController');

// Rutas
const mlRoutes = require('./routes/ml');

// Modelos
const mlModels = require('./models');

// Interfaz pública
const publicInterface = require('./interfaces/public');

module.exports = {
  // Servicios
  MLPremiumService,
  getMLPremiumService,
  
  // Controladores
  MLController,
  
  // Rutas
  routes: mlRoutes,
  
  // Modelos
  ...mlModels,
  
  // Interfaz pública completa
  ...publicInterface,
  
  // Utilidad para obtener instancia singleton
  getService: () => getMLPremiumService()
};
