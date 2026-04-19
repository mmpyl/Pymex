const router = require('express').Router();
const { listar, registrarMovimiento, historial, stockBajo } = require('../controllers/inventarioController');
const { verificarToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/roles');

router.use(verificarToken);
router.get('/', checkPermission('inventario_ver'), listar);
router.get('/historial', checkPermission('inventario_ver'), historial);
router.get('/stock-bajo', checkPermission('inventario_ver'), stockBajo);
router.post('/movimiento', checkPermission('inventario_crear'), registrarMovimiento);

module.exports = router;
