const router = require('express').Router();
const { listar, crear, actualizar, eliminar } = require('../domains/core/controllers/clienteController');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);
router.get('/', listar);
router.post('/', crear);
router.put('/:id', actualizar);
router.delete('/:id', eliminar);

module.exports = router;