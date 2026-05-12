/**
 * Rutas SaaS - Dominio BILLING
 * 
 * Define las rutas para operaciones de métricas SaaS.
 */

const router = require('express').Router();
const { verificarToken } = require('../../../middleware/auth');
const { verificarRol } = require('../../../middleware/roles');
const saasController = require('../controllers/saasController');

// Todas las rutas requieren autenticación y rol admin
router.use(verificarToken, verificarRol('admin', 'super_admin'));

// GET /api/saas/metricas - Obtener métricas del sistema
router.get('/metricas', (req, res, next) => 
  saasController.obtenerMetricas(req, res, next)
);

module.exports = router;
