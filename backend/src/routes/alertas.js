const router = require('express').Router();
const { listar, marcarLeido, marcarTodasLeidas, sinLeer } = require('../controllers/alertaController');
const { verificarToken } = require('../middleware/auth');
const { ensureTenantAccess } = require('../middleware/tenant');

router.use(verificarToken, ensureTenantAccess());
router.get('/', listar);
router.get('/sin-leer', sinLeer);
router.put('/todas/leer', marcarTodasLeidas);  // ← ANTES que /:id
router.put('/:id/leer', marcarLeido);

module.exports = router;
