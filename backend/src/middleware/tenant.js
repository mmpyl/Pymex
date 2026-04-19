const ensureTenantAccess = ({ paramKey = null, bodyKey = null } = {}) => {
  return (req, res, next) => {
    const empresaIdToken = Number(req.usuario?.empresa_id);
    if (!empresaIdToken) {
      return res.status(401).json({ error: 'Token sin empresa válida' });
    }

    const empresaFromParam = paramKey ? Number(req.params[paramKey]) : null;
    if (empresaFromParam && empresaFromParam !== empresaIdToken) {
      return res.status(403).json({ error: 'No puedes acceder a otra empresa (params)' });
    }

    const empresaFromBody = bodyKey ? Number(req.body?.[bodyKey]) : null;
    if (empresaFromBody && empresaFromBody !== empresaIdToken) {
      return res.status(403).json({ error: 'No puedes operar sobre otra empresa (body)' });
    }

    req.empresa_id = empresaIdToken;
    next();
  };
};

module.exports = { ensureTenantAccess };
