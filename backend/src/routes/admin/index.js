// backend/src/routes/admin/index.js — versión consolidada
const router = require('express').Router();
const ctrl   = require('../../controllers/admin/adminController');
const { verificarAdminAccess } = require('../../middleware/adminAuth');
const { validateSchema }        = require('../../middleware/schema');

router.use(verificarAdminAccess);

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard', ctrl.dashboard);

// ─── Empresas ─────────────────────────────────────────────────────────────────
router.get('/empresas', ctrl.listarEmpresas);
router.post('/empresas',
  validateSchema({
    nombre: { required: true, type: 'string', minLength: 2 },
    email:  { required: true, type: 'string', minLength: 5 }
  }),
  ctrl.crearEmpresa
);
router.get('/empresas/:id',    ctrl.detalleEmpresa);
router.put('/empresas/:id',    ctrl.actualizarEmpresa);
router.patch('/empresas/:id/estado',
  validateSchema({ estado: { required: true, type: 'string', enum: ['activo', 'suspendido', 'eliminado'] } }),
  ctrl.cambiarEstadoEmpresa
);
router.delete('/empresas/:id', ctrl.eliminarEmpresa);

// ─── Usuarios de empresa ──────────────────────────────────────────────────────
router.get('/empresas/:id/usuarios',              ctrl.listarUsuariosEmpresa);
router.patch('/empresas/:id/usuarios/:usuarioId', ctrl.actualizarUsuario);

// ─── Rubros ───────────────────────────────────────────────────────────────────
router.get('/rubros',      ctrl.listarRubros);
router.post('/rubros',
  validateSchema({ nombre: { required: true, type: 'string', minLength: 2 } }),
  ctrl.crearRubro
);
router.put('/rubros/:id',          ctrl.actualizarRubro);
router.put('/empresas/:id/rubros', ctrl.asignarRubrosEmpresa);

// ─── Planes ───────────────────────────────────────────────────────────────────
router.get('/planes',      ctrl.listarPlanes);
router.post('/planes',     ctrl.crearPlan);
router.put('/planes/:id',  ctrl.actualizarPlan);
router.post('/planes/:id/features',
  validateSchema({
    feature_id: { required: true, type: 'number' },
    activo:     { type: 'boolean' }
  }),
  ctrl.asignarFeaturePlan
);
router.post('/planes/:id/limits',
  validateSchema({
    limite: { required: true, type: 'string' },
    valor:  { required: true, type: 'number', min: 0 }
  }),
  ctrl.guardarLimitePlan
);

// ─── Features ─────────────────────────────────────────────────────────────────
router.get('/features',  ctrl.listarFeatures);
router.post('/features',
  validateSchema({
    nombre: { required: true, type: 'string' },
    codigo: { required: true, type: 'string' }
  }),
  ctrl.crearFeature
);

// ─── Features por Rubro ───────────────────────────────────────────────────────
router.get('/rubros/features', ctrl.listarRubrosFeatures);
router.put('/rubros/:rubroId/features/:featureId',
  validateSchema({
    activo: { required: true, type: 'boolean' }
  }),
  ctrl.actualizarRubroFeature
);

// ─── Feature overrides por empresa ────────────────────────────────────────────
router.post('/empresas/:id/features',
  validateSchema({
    feature_id: { required: true, type: 'number' },
    activo:     { required: true, type: 'boolean' }
  }),
  ctrl.crearOverride
);
router.get('/empresas/:id/features/effective', ctrl.featuresEfectivosEmpresa);

// ─── Suscripciones ────────────────────────────────────────────────────────────
router.get('/suscripciones',     ctrl.listarSuscripciones);
router.post('/suscripciones',
  validateSchema({
    empresa_id: { required: true, type: 'number' },
    plan_id:    { required: true, type: 'number' }
  }),
  ctrl.crearSuscripcion
);
router.put('/suscripciones/:id', ctrl.cambiarPlanSuscripcion);

// ─── Pagos ────────────────────────────────────────────────────────────────────
router.get('/pagos',  ctrl.listarPagos);
router.post('/pagos',
  validateSchema({
    empresa_id:        { required: true, type: 'number' },
    suscripcion_id:    { required: true, type: 'number' },
    monto:             { required: true, type: 'number', min: 0 },
    fecha_vencimiento: { required: true, type: 'string' }
  }),
  ctrl.registrarPago
);
router.post('/pagos/:id/checkout',      ctrl.generarCheckoutPago);
router.post('/pagos/:id/marcar-pagado', ctrl.marcarPagoPagado);

// ─── Billing, Auditoría y Métricas ────────────────────────────────────────────
router.post('/billing/run-collection', ctrl.ejecutarCobranza);
router.get('/auditoria',               ctrl.listarAuditoria);
router.get('/audit/health',            ctrl.auditHealth);
router.get('/metricas',                ctrl.metricasSaas);

module.exports = router;