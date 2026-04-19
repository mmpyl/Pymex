const { hasFeature, getPlanLimit } = require('../services/featureGateService');

const checkFeature = (featureCode) => {
  return async (req, res, next) => {
    const enabled = await hasFeature(req.usuario.empresa_id, featureCode);
    if (!enabled) return res.status(403).json({ error: `Feature no habilitado: ${featureCode}` });
    return next();
  };
};

const checkLimit = (limitCode, getCurrentUsage) => {
  return async (req, res, next) => {
    const limit = await getPlanLimit(req.usuario.empresa_id, limitCode);
    if (!limit) return next();

    const usage = await getCurrentUsage(req);
    if (usage >= limit.valor) {
      return res.status(403).json({
        error: `Límite excedido para ${limitCode}`,
        limite: limit.valor,
        uso_actual: usage
      });
    }

    return next();
  };
};

module.exports = { checkFeature, checkLimit };
