const router = require('express').Router();
const { listar, crear } = require('../controllers/gastoController');
const { verificarToken } = require('../../../middleware/auth');
const { ensureTenantAccess } = require('../../../middleware/tenant');

router.use(verificarToken, ensureTenantAccess());
router.get('/', listar);
router.post('/', crear);

module.exports = router;
