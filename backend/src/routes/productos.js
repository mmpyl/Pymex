// backend/src/routes/productos.js  — con límites completos
const router  = require('express').Router();
const { listar, crear, actualizar, eliminar } = require('../controllers/productoController');

const { verificarToken } = require('../middleware/auth');
const { checkFeature, checkLimit } = require('../middleware/featureGate');
const { Producto } = require('../models');

router.use(verificarToken);
router.use(checkFeature('inventario'));

router.get('/', listar);
router.post(
  '/',
  checkLimit('max_productos', async (req) => Producto.count({ where: { empresa_id: req.usuario.empresa_id, estado: 'activo' } })),
  crear
);
router.put('/:id', actualizar);
router.delete('/:id', eliminar);

module.exports = router;
