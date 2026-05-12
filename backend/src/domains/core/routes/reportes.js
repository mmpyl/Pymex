// backend/src/routes/reportes.js
// Requiere autenticación + permiso RBAC para ver reportes.
// PDF: además requiere feature `reportes`.
// Excel: además requiere feature `exportar_excel`.

const router = require('express').Router();
const {
  reporteVentasPDF,
  reporteVentasExcel,
  reporteGastosExcel
} = require('../domains/core/controllers/reporteController');

const { verificarToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/roles');
const { checkFeature } = require('../middleware/featureGate');

router.use(verificarToken);
router.use(checkPermission('reportes_ver'));

router.get('/ventas/pdf', checkFeature('reportes'), reporteVentasPDF);
router.get('/ventas/excel', checkFeature('exportar_excel'), reporteVentasExcel);
router.get('/gastos/excel', checkFeature('exportar_excel'), reporteGastosExcel);

module.exports = router;
