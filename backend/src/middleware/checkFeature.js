// backend/src/middleware/checkFeature.js
// FIX: Feature.findOne busca por estado STRING 'activo' (no booleano true)
// consistente con el modelo Feature.js corregido.
// FIX: Empresa.findByPk incluye plan_id en attributes para no lanzar error
// cuando se busca plan por codigo de fallback.

const { Empresa, Feature, Plan, PlanFeature, RubroFeature, FeatureOverride } = require('../models');

const resolveFeatureAccess = async (empresaId, featureCode) => {
  // FIX: estado STRING 'activo'
  const feature = await Feature.findOne({ where: { codigo: featureCode, estado: 'activo' } });
  if (!feature) {

    return { active: false, source: 'feature_disabled_or_missing', featureId: null };
  }

  const empresa = await Empresa.findByPk(empresaId, {
    attributes: ['id', 'plan', 'plan_id', 'rubro_id']
  });




  if (!empresa) {
    return { active: false, source: 'empresa_missing', featureId: feature.id };
  }



  // 1. Override por empresa (máxima prioridad)

  const override = await FeatureOverride.findOne({
    where: { empresa_id: empresa.id, feature_id: feature.id }
  });
  if (override) {
    return { active: Boolean(override.activo), source: 'feature_override', featureId: feature.id };
  }



  // 2. Feature por rubro

  if (empresa.rubro_id) {
    const rubroFeature = await RubroFeature.findOne({
      where: { rubro_id: empresa.rubro_id, feature_id: feature.id }
    });
    if (rubroFeature) {
      return { active: Boolean(rubroFeature.activo), source: 'rubro_feature', featureId: feature.id };
    }
  }



  // 3. Feature por plan

  let planId = empresa.plan_id;
  if (!planId && empresa.plan) {
    const plan = await Plan.findOne({ where: { codigo: empresa.plan }, attributes: ['id'] });
    planId = plan?.id || null;
  }




  if (planId) {
    const planFeature = await PlanFeature.findOne({
      where: { plan_id: planId, feature_id: feature.id }
    });
    if (planFeature) {
      return { active: Boolean(planFeature.activo), source: 'plan_feature', featureId: feature.id };
    }
  }

  return { active: false, source: 'no_mapping', featureId: feature.id };
};

const checkFeature = (featureCode) => {
  return async (req, res, next) => {
    try {
      if (!req.usuario?.empresa_id) {
        return res.status(401).json({ error: 'Token requerido para validar feature' });
      }

      const resolution = await resolveFeatureAccess(req.usuario.empresa_id, featureCode);
      if (!resolution.active) {
        return res.status(403).json({
          error: `Feature desactivada: ${featureCode}`,
          feature_code: featureCode,
          source: resolution.source,
          trace_id: req.requestId
        });
      }

      req.featureCheck = { code: featureCode, source: resolution.source };

      next();

    } catch (error) {
      return res.status(500).json({ error: error.message, trace_id: req.requestId });
    }
  };
};

module.exports = { checkFeature, resolveFeatureAccess };
