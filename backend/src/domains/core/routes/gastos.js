const router = require('express').Router();
const { listar, crear } = require('../domains/core/controllers/gastoController');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);
router.get('/', listar);
router.post('/', crear);

module.exports = router;