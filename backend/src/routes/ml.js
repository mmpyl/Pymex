const router = require('express').Router();
const axios = require('axios');
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
    const { data } = await mlClient.post('/predicciones/entrenar', {
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
    const { data } = await mlClient.get(`/predicciones/ventas/${req.usuario.empresa_id}?meses=${meses}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener predicción de ventas' });
  }
});

// Predicción de demanda
router.get('/demanda', async (req, res) => {
  try {
    const { data } = await mlClient.get(`/predicciones/demanda/${req.usuario.empresa_id}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener predicción de demanda' });
  }
});

// Predicción de stock
router.get('/stock', async (req, res) => {
  try {
    const { data } = await mlClient.get(`/predicciones/stock/${req.usuario.empresa_id}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener predicción de stock' });
  }
});

// Resumen general ML
router.get('/resumen', async (req, res) => {
  try {
    const { data } = await mlClient.get(`/predicciones/resumen/${req.usuario.empresa_id}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener resumen ML' });
  }
});

// API premium (solo Enterprise o clientes con api_access)
router.get('/api/ventas', checkFeature('api_access'), async (req, res) => {
  try {
    const meses = req.query.meses || 6;
    const { data } = await mlClient.get(`/predicciones/ventas/${req.usuario.empresa_id}?meses=${meses}`);
    res.json({ fuente: 'ml_api_premium', ...data });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener predicción API premium' });
  }
});

module.exports = router;
