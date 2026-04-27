const router = require('express').Router();
const axios = require('axios');
const CircuitBreaker = require('opossum');
const { verificarToken } = require('../middleware/auth');
const { checkFeature } = require('../middleware/featureGate');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000/api';
const ML_TIMEOUT = Number(process.env.ML_SERVICE_TIMEOUT_MS || process.env.ML_TIMEOUT_MS || 15000);
const ML_API_KEY = process.env.ML_SERVICE_API_KEY;

const mlClient = axios.create({
  baseURL: ML_URL,
  timeout: ML_TIMEOUT,
  headers: ML_API_KEY ? { 'x-ml-api-key': ML_API_KEY } : undefined
});

// ─── Circuit Breaker para ML Service ──────────────────────────────────────────
// Previene bloqueo del thread principal y timeouts en cascada
const mlCircuit = new CircuitBreaker(async (method, url, data, config) => {
  const response = await mlClient[method](url, data, config);
  return response.data;
}, {
  timeout: ML_TIMEOUT, // Si no responde en este tiempo, abre el circuito
  errorThresholdPercentage: 50, // Abre si >50% de errores en ventana
  resetTimeout: 30000 // Intenta cerrar después de 30s
});

// Fallback cuando el circuito está abierto o falla
mlCircuit.fallback((method, url, data, config) => ({
  status: 'degraded',
  message: 'ML service unavailable - operating in degraded mode',
  circuit_state: 'open',
  timestamp: new Date().toISOString()
}));

// Logging de eventos del circuit breaker
mlCircuit.on('open', () => {
  console.warn('⚠️ ML Circuit Breaker OPENED - service unavailable');
});

mlCircuit.on('close', () => {
  console.info('✅ ML Circuit Breaker CLOSED - service recovered');
});

mlCircuit.on('halfOpen', () => {
  console.info('🔄 ML Circuit Breaker HALF-OPEN - testing service');
});

mlCircuit.on('fallback', (result) => {
  console.warn('🔁 ML Circuit Breaker FALLBACK triggered:', result.message);
});

// Helper para llamadas con circuit breaker
const mlRequest = async (method, endpoint, data = null, config = {}) => {
  return mlCircuit.fire(method, endpoint, data, config);
};

router.use(verificarToken);

// Predicciones son premium (Business/Enterprise o override manual)
router.use(checkFeature('predicciones'));

router.use((req, res, next) => {
  if (!ML_API_KEY) {
    return res.status(503).json({ error: 'ML_SERVICE_API_KEY no configurada en backend' });
  }
  return next();
});

// Entrenar modelos de la empresa
router.post('/entrenar', async (req, res) => {
  try {
    const data = await mlRequest('post', '/predicciones/entrenar', {
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
    const data = await mlRequest('get', `/predicciones/ventas/${req.usuario.empresa_id}?meses=${meses}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener predicción de ventas' });
  }
});

// Predicción de demanda
router.get('/demanda', async (req, res) => {
  try {
    const data = await mlRequest('get', `/predicciones/demanda/${req.usuario.empresa_id}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener predicción de demanda' });
  }
});

// Predicción de stock
router.get('/stock', async (req, res) => {
  try {
    const data = await mlRequest('get', `/predicciones/stock/${req.usuario.empresa_id}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener predicción de stock' });
  }
});

// Resumen general ML
router.get('/resumen', async (req, res) => {
  try {
    const data = await mlRequest('get', `/predicciones/resumen/${req.usuario.empresa_id}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener resumen ML' });
  }
});

// API premium (solo Enterprise o clientes con api_access)
router.get('/api/ventas', checkFeature('api_access'), async (req, res) => {
  try {
    const meses = req.query.meses || 6;
    const data = await mlRequest('get', `/predicciones/ventas/${req.usuario.empresa_id}?meses=${meses}`);
    res.json({ fuente: 'ml_api_premium', ...data });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener predicción API premium' });
  }
});

module.exports = router;
