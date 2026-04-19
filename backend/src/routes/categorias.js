const router = require('express').Router();
const { listar, crear, eliminar } = require('../controllers/categoriaController');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);
router.get('/',     listar);
router.post('/',    crear);
router.delete('/:id', eliminar);

module.exports = router;
