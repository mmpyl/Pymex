const router = require('express').Router();
const { verificarToken } = require('../middleware/auth');
const { checkFeature } = require('../middleware/featureGate');
const { getMLPremiumService } = require('../domains/ml');
const logger = require('../utils/logger');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000/api';
const ML_TIMEOUT = Number(process.env.ML_SERVICE_TIMEOUT_MS || process.env.ML_TIMEOUT_MS || 15000);
const ML_API_KEY = process.env.ML_SERVICE_API_KEY;

// Obtener instancia del servicio premium
const mlPremiumService = getMLPremiumService();

router.use(verificarToken);

// Predicciones son premium (Business/Enterprise o override manual)
router.use(checkFeature('predicciones'));

router.use((req, res, next) => {
  if (!ML_API_KEY) {
    return res.status(503).json({ error: 'ML_SERVICE_API_KEY no configurada en backend' });
  }
  return next();
});

// ─── ENDPOINTS BÁSICOS (con feature gate 'predicciones') ──────────────────────

// Entrenar modelos de la empresa
router.post('/entrenar', async (req, res) => {
  try {
    const data = await mlPremiumService._mlRequest('post', '/predicciones/entrenar', {
      empresa_id: req.usuario.empresa_id
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al entrenar modelos ML' });
  }
});

// Predicción de ventas
router.get('/ventas', async (req, res) => {
  try {
    const meses = req.query.meses || 3;
    const data = await mlPremiumService._mlRequest('get', `/predicciones/ventas/${req.usuario.empresa_id}?meses=${meses}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener predicción de ventas' });
  }
});

// Predicción de demanda
router.get('/demanda', async (req, res) => {
  try {
    const data = await mlPremiumService._mlRequest('get', `/predicciones/demanda/${req.usuario.empresa_id}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener predicción de demanda' });
  }
});

// Predicción de stock
router.get('/stock', async (req, res) => {
  try {
    const data = await mlPremiumService._mlRequest('get', `/predicciones/stock/${req.usuario.empresa_id}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener predicción de stock' });
  }
});

// Resumen general ML
router.get('/resumen', async (req, res) => {
  try {
    const data = await mlPremiumService._mlRequest('get', `/predicciones/resumen/${req.usuario.empresa_id}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener resumen ML' });
  }
});

// ─── ENDPOINTS PREMIUM (solo Enterprise con api_access) ───────────────────────
// Estos endpoints están en /api/ml/api/* y son exclusivos para clientes Enterprise

/**
 * @route GET /api/ml/api/ventas
 * @access Enterprise (api_access feature required)
 * @description Endpoint exclusivo para clientes Enterprise con api_access habilitado
 *              Devuelve predicción de ventas premium con metadatos enterprise
 */
router.get('/api/ventas', checkFeature('api_access'), async (req, res) => {
  try {
    const meses = parseInt(req.query.meses) || 6; // 6 meses default para premium
    const result = await mlPremiumService.getVentasPremium(req.usuario.empresa_id, meses);
    res.json(result);
  } catch (error) {
    logger.error('[ML Route] Error en endpoint premium /api/ventas', {
      empresa_id: req.usuario.empresa_id,
      error: error.message
    });
    res.status(500).json({ 
      error: 'Error al obtener predicción API premium',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/ml/api/demanda
 * @access Enterprise (api_access feature required)
 * @description Endpoint exclusivo para clientes Enterprise con api_access habilitado
 */
router.get('/api/demanda', checkFeature('api_access'), async (req, res) => {
  try {
    const result = await mlPremiumService.getDemandaPremium(req.usuario.empresa_id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener predicción de demanda premium' });
  }
});

/**
 * @route GET /api/ml/api/stock
 * @access Enterprise (api_access feature required)
 * @description Endpoint exclusivo para clientes Enterprise con api_access habilitado
 */
router.get('/api/stock', checkFeature('api_access'), async (req, res) => {
  try {
    const result = await mlPremiumService.getStockPremium(req.usuario.empresa_id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener predicción de stock premium' });
  }
});

/**
 * @route GET /api/ml/api/resumen
 * @access Enterprise (api_access feature required)
 * @description Resumen ejecutivo premium con todas las predicciones
 */
router.get('/api/resumen', checkFeature('api_access'), async (req, res) => {
  try {
    const result = await mlPremiumService.getResumenPremium(req.usuario.empresa_id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener resumen premium' });
  }
});

/**
 * @route POST /api/ml/api/entrenar
 * @access Enterprise (api_access feature required)
 * @description Entrenamiento premium de modelos ML
 */
router.post('/api/entrenar', checkFeature('api_access'), async (req, res) => {
  try {
    const result = await mlPremiumService.entrenarModelosPremium(req.usuario.empresa_id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error al entrenar modelos premium' });
  }
});

/**
 * @route GET /api/ml/api/health
 * @access Enterprise (api_access feature required)
 * @description Health check del servicio premium
 */
router.get('/api/health', checkFeature('api_access'), (req, res) => {
  const circuitState = mlPremiumService.getCircuitState();
  res.json({
    service: 'ml_premium',
    ...circuitState,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
