// backend/src/routes/reportes.js — versión consolidada
// Combina ambas ramas:
//   - checkPermission('reportes_ver') del RBAC (rama HEAD)
//   - checkFeature del plan (rama main) para los exports premium
// PDF: requiere permiso + feature 'reportes'
// Excel: requiere permiso + feature 'exportar_excel'
const router = require('express').Router();
const { reporteVentasPDF, reporteVentasExcel, reporteGastosExcel } = require('../controllers/reporteController');

const { verificarToken } = require('../middleware/auth');

const { checkPermission } = require('../middleware/roles');

router.use(verificarToken, checkPermission('reportes_ver'));
router.get('/ventas/pdf', reporteVentasPDF);
router.get('/ventas/excel', reporteVentasExcel);
router.get('/gastos/excel', reporteGastosExcel);

const { checkFeature } = require('../middleware/featureGate');

router.use(verificarToken);
router.get('/ventas/pdf', checkFeature('reportes'), reporteVentasPDF);
router.get('/ventas/excel', checkFeature('exportar_excel'), reporteVentasExcel);
router.get('/gastos/excel', checkFeature('exportar_excel'), reporteGastosExcel);


const { verificarToken }  = require('../middleware/auth');
const { checkPermission } = require('../middleware/roles');
const { checkFeature }    = require('../middleware/featureGate');

router.use(verificarToken);
router.use(checkPermission('reportes_ver'));

router.get('/ventas/pdf',   checkFeature('reportes'),        reporteVentasPDF);
router.get('/ventas/excel', checkFeature('exportar_excel'),  reporteVentasExcel);
router.get('/gastos/excel', checkFeature('exportar_excel'),  reporteGastosExcel);


module.exports = router;
