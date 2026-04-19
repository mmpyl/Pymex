
const router = require('express').Router();
const { verificarToken } = require('../middleware/auth');
const { verificarRol } = require('../middleware/roles');
const { resolveFeatureAccess } = require('../middleware/checkFeature');
const {
  Feature,
  Plan,
  Rubro,
  Empresa,
  PlanFeature,
  RubroFeature,
  FeatureOverride

// backend/src/routes/features.js — versión corregida
// FIX: Feature.findAll filtra por estado STRING 'activo' (no booleano true).
// FIX: Plan.findAll filtra por estado STRING 'activo' (no booleano true).
// FIX: Rubro ya no tiene campo 'estado' en el modelo v3, se elimina el filtro.
// FIX: checkPermission importado del middleware roles.js corregido.

const router = require('express').Router();
const { verificarToken }    = require('../middleware/auth');
const { checkPermission }   = require('../middleware/roles');
const { resolveFeatureAccess } = require('../middleware/checkFeature');
const {
  Feature, Plan, Rubro, Empresa,
  PlanFeature, RubroFeature, FeatureOverride

} = require('../models');

router.use(verificarToken);


router.get('/catalogo', verificarRol('admin'), async (req, res) => {
  try {
    const [features, planes, rubros] = await Promise.all([
      Feature.findAll({ order: [['codigo', 'ASC']] }),
      Plan.findAll({ where: { estado: true }, order: [['id', 'ASC']] }),
      Rubro.findAll({ where: { estado: true }, order: [['id', 'ASC']] })
    ]);
    res.json({ features, planes, rubros });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', verificarRol('admin'), async (req, res) => {
  try {
    const { nombre, codigo, descripcion = '', estado = true } = req.body;
    if (!nombre || !codigo) {
      return res.status(400).json({ error: 'nombre y codigo son obligatorios' });
    }
    const feature = await Feature.create({ nombre, codigo, descripcion, estado });
    res.status(201).json(feature);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/planes/:planId/features/:featureId', verificarRol('admin'), async (req, res) => {
  try {
    const activo = Boolean(req.body.activo);
    await PlanFeature.upsert({
      plan_id: Number(req.params.planId),
      feature_id: Number(req.params.featureId),
      activo
    });
    res.json({ mensaje: 'Feature de plan actualizada', activo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/rubros/:rubroId/features/:featureId', verificarRol('admin'), async (req, res) => {
  try {
    const activo = Boolean(req.body.activo);
    await RubroFeature.upsert({
      rubro_id: Number(req.params.rubroId),
      feature_id: Number(req.params.featureId),
      activo
    });
    res.json({ mensaje: 'Feature de rubro actualizada', activo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/empresas/:empresaId/features/:featureId', verificarRol('admin'), async (req, res) => {

// GET /api/features/catalogo — catálogo de features, planes y rubros
router.get('/catalogo', checkPermission('usuarios_gestionar'), async (req, res) => {
  try {
    const [features, planes, rubros] = await Promise.all([
      Feature.findAll({ where: { estado: 'activo' }, order: [['codigo', 'ASC']] }),
      // FIX: estado STRING
      Plan.findAll({    where: { estado: 'activo' }, order: [['precio_mensual', 'ASC']] }),
      // FIX: Rubro v3 no tiene campo estado
      Rubro.findAll({ order: [['nombre', 'ASC']] })
    ]);
    return res.json({ features, planes, rubros });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/features — crear feature
router.post('/', checkPermission('usuarios_gestionar'), async (req, res) => {
  try {
    const { nombre, codigo, descripcion = '', estado = 'activo' } = req.body;
    if (!nombre || !codigo) return res.status(400).json({ error: 'nombre y codigo son obligatorios' });
    const feature = await Feature.create({ nombre, codigo, descripcion, estado });
    return res.status(201).json(feature);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/features/planes/:planId/features/:featureId
router.put('/planes/:planId/features/:featureId', checkPermission('usuarios_gestionar'), async (req, res) => {
  try {
    const activo = Boolean(req.body.activo);
    await PlanFeature.upsert({
      plan_id:    Number(req.params.planId),
      feature_id: Number(req.params.featureId),
      activo
    });
    return res.json({ mensaje: 'Feature de plan actualizada', activo });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/features/rubros/:rubroId/features/:featureId
router.put('/rubros/:rubroId/features/:featureId', checkPermission('usuarios_gestionar'), async (req, res) => {
  try {
    const activo = Boolean(req.body.activo);
    await RubroFeature.upsert({
      rubro_id:   Number(req.params.rubroId),
      feature_id: Number(req.params.featureId),
      activo
    });
    return res.json({ mensaje: 'Feature de rubro actualizada', activo });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/features/empresas/:empresaId/features/:featureId
router.put('/empresas/:empresaId/features/:featureId', checkPermission('usuarios_gestionar'), async (req, res) => {

  try {
    const activo = Boolean(req.body.activo);
    await FeatureOverride.upsert({
      empresa_id: Number(req.params.empresaId),
      feature_id: Number(req.params.featureId),

      activo
    });
    res.json({ mensaje: 'Override por empresa actualizado', activo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/empresas/:empresaId/effective', verificarRol('admin'), async (req, res) => {
  try {
    const empresaId = Number(req.params.empresaId);
    const [empresa, features] = await Promise.all([
      Empresa.findByPk(empresaId, { attributes: ['id', 'nombre', 'plan', 'plan_id', 'rubro_id'] }),
      Feature.findAll({ where: { estado: true }, order: [['codigo', 'ASC']] })
    ]);

    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

    const evaluacion = await Promise.all(features.map(async (feature) => {
      const resolution = await resolveFeatureAccess(empresaId, feature.codigo);
      return {
        feature_id: feature.id,
        feature_code: feature.codigo,
        activo: resolution.active,
        source: resolution.source
      };
    }));

    res.json({ empresa, features: evaluacion });
  } catch (error) {
    res.status(500).json({ error: error.message });

      activo,
      motivo:     req.body.motivo || null
    });
    return res.json({ mensaje: 'Override por empresa actualizado', activo });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/features/empresas/:empresaId/effective — features efectivos para una empresa
router.get('/empresas/:empresaId/effective', checkPermission('usuarios_gestionar'), async (req, res) => {
  try {
    const empresaId = Number(req.params.empresaId);
    const empresa   = await Empresa.findByPk(empresaId, {
      attributes: ['id', 'nombre', 'plan', 'plan_id', 'rubro_id']
    });
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

    // FIX: estado STRING 'activo'
    const features = await Feature.findAll({
      where: { estado: 'activo' }, order: [['codigo', 'ASC']]
    });

    const evaluacion = await Promise.all(features.map(async (feature) => {
      const resolution = await resolveFeatureAccess(empresaId, feature.codigo);
      return {
        feature_id:   feature.id,
        feature_code: feature.codigo,
        nombre:       feature.nombre,
        activo:       resolution.active,
        source:       resolution.source
      };
    }));

    return res.json({ empresa, features: evaluacion });
  } catch (error) {
    return res.status(500).json({ error: error.message });

  }
});

module.exports = router;
