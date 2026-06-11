const router = require('express').Router();
const { listar, crear, eliminar } = require('../controllers/categoriaController');
const { verificarToken } = require('../middleware/auth');
const { ensureTenantAccess } = require('../middleware/tenant');

router.use(verificarToken, ensureTenantAccess());
router.get('/',     listar);
router.post('/',    crear);
router.delete('/:id', eliminar);

module.exports = router;
