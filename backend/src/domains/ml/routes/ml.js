/**
 * ML Routes
 * 
 * Define las rutas HTTP para el dominio ML (Machine Learning).
 * Las rutas están organizadas en:
 * - Endpoints básicos (con feature gate 'predicciones')
 * - Endpoints premium (exclusivos para Enterprise con api_access)
 */

const router = require('express').Router();
const { verificarToken } = require('../../../middleware/auth');
const { checkFeature } = require('../../../middleware/featureGate');
const { getInstance: getMLPremiumService } = require('../services/mlPremiumService');
const MLController = require('../controllers/mlController');

// Configuración del servicio ML
const ML_API_KEY = process.env.ML_SERVICE_API_KEY;

// Obtener instancia del servicio premium y crear controlador
const mlPremiumService = getMLPremiumService();
const mlController = new MLController(mlPremiumService);

// Middleware global: verificar autenticación
router.use(verificarToken);

// Feature gate para predicciones (Business/Enterprise o override manual)
router.use(checkFeature('predicciones'));

// Validar que ML_API_KEY esté configurada
router.use((req, res, next) => {
  if (!ML_API_KEY) {
    return res.status(503).json({ 
      error: 'ML_SERVICE_API_KEY no configurada en backend' 
    });
  }
  return next();
});

// ─── ENDPOINTS BÁSICOS (con feature gate 'predicciones') ──────────────────────

/**
 * @route POST /api/ml/entrenar
 * @description Entrenar modelos de la empresa
 * @access Business/Enterprise (predicciones feature required)
 */
router.post('/entrenar', mlController.entrenarModelos.bind(mlController));

/**
 * @route GET /api/ml/ventas
 * @description Predicción de ventas
 * @access Business/Enterprise (predicciones feature required)
 */
router.get('/ventas', mlController.getVentas.bind(mlController));

/**
 * @route GET /api/ml/demanda
 * @description Predicción de demanda
 * @access Business/Enterprise (predicciones feature required)
 */
router.get('/demanda', mlController.getDemanda.bind(mlController));

/**
 * @route GET /api/ml/stock
 * @description Predicción de stock
 * @access Business/Enterprise (predicciones feature required)
 */
router.get('/stock', mlController.getStock.bind(mlController));

/**
 * @route GET /api/ml/resumen
 * @description Resumen general ML
 * @access Business/Enterprise (predicciones feature required)
 */
router.get('/resumen', mlController.getResumen.bind(mlController));

// ─── ENDPOINTS PREMIUM (solo Enterprise con api_access) ───────────────────────

/**
 * @route GET /api/ml/api/ventas
 * @description Endpoint exclusivo para clientes Enterprise con api_access habilitado
 *              Devuelve predicción de ventas premium con metadatos enterprise
 * @access Enterprise (api_access feature required)
 */
router.get('/api/ventas', checkFeature('api_access'), mlController.getVentasPremium.bind(mlController));

/**
 * @route GET /api/ml/api/demanda
 * @description Endpoint exclusivo para clientes Enterprise con api_access habilitado
 * @access Enterprise (api_access feature required)
 */
router.get('/api/demanda', checkFeature('api_access'), mlController.getDemandaPremium.bind(mlController));

/**
 * @route GET /api/ml/api/stock
 * @description Endpoint exclusivo para clientes Enterprise con api_access habilitado
 * @access Enterprise (api_access feature required)
 */
router.get('/api/stock', checkFeature('api_access'), mlController.getStockPremium.bind(mlController));

/**
 * @route GET /api/ml/api/resumen
 * @description Resumen ejecutivo premium con todas las predicciones
 * @access Enterprise (api_access feature required)
 */
router.get('/api/resumen', checkFeature('api_access'), mlController.getResumenPremium.bind(mlController));

/**
 * @route POST /api/ml/api/entrenar
 * @description Entrenamiento premium de modelos ML
 * @access Enterprise (api_access feature required)
 */
router.post('/api/entrenar', checkFeature('api_access'), mlController.entrenarModelosPremium.bind(mlController));

/**
 * @route GET /api/ml/api/health
 * @description Health check del servicio premium
 * @access Enterprise (api_access feature required)
 */
router.get('/api/health', checkFeature('api_access'), mlController.healthCheck.bind(mlController));

const express = require('express');
const routerFn = express.Router();
routerFn.use(router);

module.exports = routerFn;
