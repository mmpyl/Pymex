// backend/src/middleware/checkFeature.js
// Middleware que utiliza featureGateService para validar acceso a features.
// Centraliza la lógica de feature gating en el servicio, este middleware solo adapta para Express.

const { resolveFeatureAccess: resolveFeatureAccessService } = require('../services/featureGateService');

const checkFeature = (featureCode) => {
  return async (req, res, next) => {
    try {
      if (!req.usuario?.empresa_id) {
        return res.status(401).json({ error: 'Token requerido para validar feature' });
      }

      const resolution = await resolveFeatureAccessService(req.usuario.empresa_id, featureCode);
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

module.exports = { checkFeature };
