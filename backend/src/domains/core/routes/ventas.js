// backend/src/routes/ventas.js — versión consolidada con tenant enforcement
// Combina checkPermission (RBAC) + checkLimit (plan) sin conflictos de merge
const router = require('express').Router();
const { check } = require('express-validator');
const { listar, crear } = require('../domains/core/controllers/ventaController');
const { verificarToken } = require('../middleware/auth');
const { ensureTenantAccess } = require('../middleware/tenant');
const { checkPermission } = require('../middleware/roles');
const { checkLimit }      = require('../middleware/featureGate');
const { validate }        = require('../middleware/validation');
const { Venta }           = require('../domains/core/models');
const { Op }              = require('sequelize');

router.use(verificarToken);
// Asegurar aislamiento tenant en todas las operaciones de empresa
router.use(ensureTenantAccess());

// Validación para items de venta
const itemsValidation = check('items')
  .isArray({ min: 1 })
  .withMessage('La venta requiere al menos un item');

const itemSchema = check('items.*')
  .isObject()
  .withMessage('Cada item debe ser un objeto');

const productoIdValido = check('items.*.producto_id')
  .isInt({ min: 1 })
  .withMessage('producto_id debe ser un entero positivo');

const cantidadValida = check('items.*.cantidad')
  .isInt({ min: 1 })
  .withMessage('La cantidad debe ser un entero mayor a 0');

const precioUnitarioValido = check('items.*.precio_unitario')
  .isFloat({ min: 0.01 })
  .withMessage('El precio unitario debe ser mayor a 0');

// GET /api/ventas — requiere permiso ventas_ver
router.get('/', checkPermission('ventas_ver'), listar);

// POST /api/ventas — requiere permiso ventas_crear + límite mensual del plan
router.post(
  '/',
  checkPermission('ventas_crear'),
  validate([
    itemsValidation,
    itemSchema,
    productoIdValido,
    cantidadValida,
    precioUnitarioValido,
    check('metodo_pago').optional().trim().escape(),
    check('notas').optional().trim().escape()
  ]),
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
