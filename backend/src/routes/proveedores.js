const router = require('express').Router();
const { listar, crear, actualizar, eliminar } = require('../controllers/proveedorController');
const { verificarToken } = require('../middleware/auth');
const { ensureTenantAccess } = require('../middleware/tenant');

router.use(verificarToken, ensureTenantAccess());
router.get('/', listar);
router.post('/', crear);
router.put('/:id', actualizar);
router.delete('/:id', eliminar);

module.exports = router;