/**
 * Rutas de Suspensiones - Dominio BILLING
 * 
 * Define las rutas para gestión de suspensiones automáticas.
 */

const router = require('express').Router();
const { verificarToken } = require('../../../middleware/auth');
const { verificarRol } = require('../../../middleware/roles');
const suspensionesController = require('../controllers/suspensionesController');

// Todas las rutas requieren autenticación y rol admin
router.use(verificarToken, verificarRol('admin', 'super_admin'));

// POST /api/suspensiones/ejecutar - Ejecutar suspensión automática
router.post('/ejecutar', (req, res, next) => 
  suspensionesController.ejecutarSuspension(req, res, next)
);

module.exports = router;
