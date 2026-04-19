const router = require('express').Router();
const { resumen, ventasMensuales, gastosMensuales, topProductos } = require('../controllers/dashboardController');
const { verificarToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/roles');

router.use(verificarToken, checkPermission('dashboard_ver'));
router.get('/resumen', resumen);
router.get('/ventas-mensuales', ventasMensuales);
router.get('/gastos-mensuales', gastosMensuales);
router.get('/top-productos', topProductos);

module.exports = router;
