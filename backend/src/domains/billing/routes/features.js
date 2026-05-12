/**
 * Rutas de Features - Dominio BILLING
 * 
 * Define las rutas para gestión de features, planes y rubros.
 */

const router = require('express').Router();
const { verificarToken } = require('../../../middleware/auth');
const { checkPermission } = require('../../../middleware/roles');
const featuresController = require('../controllers/featuresController');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// GET /api/features/catalogo - Obtener catálogo (requiere permiso)
router.get('/catalogo', checkPermission('usuarios_gestionar'), (req, res, next) => 
  featuresController.obtenerCatalogo(req, res, next)
);

// POST /api/features - Crear feature (requiere permiso)
router.post('/', checkPermission('usuarios_gestionar'), (req, res, next) => 
  featuresController.crearFeature(req, res, next)
);

// PUT /api/features/planes/:planId/features/:featureId - Actualizar feature de plan
router.put('/planes/:planId/features/:featureId', checkPermission('usuarios_gestionar'), (req, res, next) => 
  featuresController.actualizarFeaturePlan(req, res, next)
);

// PUT /api/features/rubros/:rubroId/features/:featureId - Actualizar feature de rubro
router.put('/rubros/:rubroId/features/:featureId', checkPermission('usuarios_gestionar'), (req, res, next) => 
  featuresController.actualizarFeatureRubro(req, res, next)
);

// PUT /api/features/empresas/:empresaId/features/:featureId - Actualizar override por empresa
router.put('/empresas/:empresaId/features/:featureId', checkPermission('usuarios_gestionar'), (req, res, next) => 
  featuresController.actualizarFeatureEmpresa(req, res, next)
);

// GET /api/features/empresas/:empresaId/effective - Obtener features efectivos
router.get('/empresas/:empresaId/effective', checkPermission('usuarios_gestionar'), (req, res, next) => 
  featuresController.obtenerFeaturesEfectivos(req, res, next)
);

module.exports = router;
