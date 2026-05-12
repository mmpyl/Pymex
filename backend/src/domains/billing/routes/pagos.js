/**
 * Rutas de Pagos - Dominio BILLING
 * 
 * Define las rutas para operaciones de pagos (checkout y webhook).
 * NOTA: el checkout y webhook Stripe reales están en routes/payments.js.
 * Este archivo sirve el flujo legacy mock para tests/desarrollo.
 */

const router = require('express').Router();
const { verificarToken } = require('../../../middleware/auth');
const { idempotencyMiddleware } = require('../../../middleware/idempotency');
const pagosController = require('../controllers/pagosController');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// POST /api/pagos/checkout - Generar checkout
router.post('/checkout', (req, res, next) => 
  pagosController.crearCheckout(req, res, next)
);

// POST /api/pagos/webhook - Procesar webhook (con idempotencia)
router.post('/webhook', idempotencyMiddleware, (req, res, next) => 
  pagosController.procesarWebhook(req, res, next)
);

module.exports = router;
