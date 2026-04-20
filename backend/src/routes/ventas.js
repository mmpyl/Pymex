// backend/src/routes/ventas.js — versión consolidada
// Combina checkPermission (RBAC) + checkLimit (plan) sin conflictos de merge
const router = require('express').Router();
const { listar, crear } = require('../controllers/ventaController');
const { verificarToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/roles');
const { checkLimit }      = require('../middleware/featureGate');
const { Venta }           = require('../models');
const { Op }              = require('sequelize');

router.use(verificarToken);

// GET /api/ventas — requiere permiso ventas_ver
router.get('/', checkPermission('ventas_ver'), listar);

// POST /api/ventas — requiere permiso ventas_crear + límite mensual del plan
router.post(
  '/',
  checkPermission('ventas_crear'),
  checkLimit('max_ventas_mes', async (req) => {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);
    return Venta.count({
      where: {
        empresa_id: req.usuario.empresa_id,
        fecha: { [Op.gte]: inicioMes }
      }
    });
  }),
  crear
);


module.exports = router;
