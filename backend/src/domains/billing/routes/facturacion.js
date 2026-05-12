/**
 * Rutas de Facturación - Dominio BILLING
 * 
 * Define las rutas para operaciones de facturación electrónica.
 */

const router = require('express').Router();
const { verificarToken } = require('../../../middleware/auth');
const facturacionController = require('../controllers/facturacionController');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// POST /api/facturacion/factura/:venta_id - Emitir factura
router.post('/factura/:venta_id', (req, res, next) => 
  facturacionController.emitirFactura(req, res, next)
);

// POST /api/facturacion/boleta/:venta_id - Emitir boleta
router.post('/boleta/:venta_id', (req, res, next) => 
  facturacionController.emitirBoleta(req, res, next)
);

// POST /api/facturacion/nota-credito - Emitir nota de crédito
router.post('/nota-credito', (req, res, next) => 
  facturacionController.emitirNotaCredito(req, res, next)
);

// GET /api/facturacion/comprobantes - Listar comprobantes
router.get('/comprobantes', (req, res, next) => 
  facturacionController.listarComprobantes(req, res, next)
);

// GET /api/facturacion/pdf/:id/:tipo - Obtener PDF de comprobante
router.get('/pdf/:id/:tipo', (req, res, next) => 
  facturacionController.obtenerPdf(req, res, next)
);

// GET /api/facturacion/health - Health check del servicio
router.get('/health', (req, res, next) => 
  facturacionController.healthCheck(req, res, next)
);

module.exports = router;
