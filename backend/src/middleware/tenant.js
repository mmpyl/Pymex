const TENANT_FIELD_ALIASES = ['empresa_id', 'empresaId', 'company_id', 'companyId', 'tenant_id', 'tenantId'];

const toTenantNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : NaN;
};

const collectTenantValues = (source, location, values = []) => {
  if (!source || typeof source !== 'object') {
    return values;
  }

  for (const [key, value] of Object.entries(source)) {
    if (TENANT_FIELD_ALIASES.includes(key)) {
      values.push({ location, key, value });
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => collectTenantValues(item, `${location}.${key}[${index}]`, values));
    } else if (value && typeof value === 'object') {
      collectTenantValues(value, `${location}.${key}`, values);
    }
  }

  return values;
};

const rejectCrossTenantValue = (res, location, key) => res.status(403).json({
  error: 'No puedes acceder u operar sobre otra empresa',
  code: 'TENANT_ACCESS_DENIED',
  field: `${location}.${key}`
});

/**
 * Middleware obligatorio para rutas de usuarios de empresa.
 *
 * Garantiza que cada endpoint autenticado tenga un tenant válido y que ningún
 * cliente pueda inyectar empresa_id/empresaId/company_id/tenant_id de otro tenant
 * en params, query, body o payloads anidados. Los controladores deben seguir
 * filtrando por req.empresa_id/req.usuario.empresa_id en DB.
 */
const ensureTenantAccess = ({ paramKey = null, bodyKey = null, queryKey = null } = {}) => (req, res, next) => {
  const empresaIdToken = toTenantNumber(req.usuario?.empresa_id);
  if (!empresaIdToken || Number.isNaN(empresaIdToken)) {
    return res.status(401).json({
      error: 'Token sin empresa válida',
      code: 'TENANT_REQUIRED'
    });
  }

  const explicitChecks = [
    paramKey && { location: 'params', key: paramKey, value: req.params?.[paramKey] },
    bodyKey && { location: 'body', key: bodyKey, value: req.body?.[bodyKey] },
    queryKey && { location: 'query', key: queryKey, value: req.query?.[queryKey] }
  ].filter(Boolean);

  const discoveredChecks = [
    ...collectTenantValues(req.params, 'params'),
    ...collectTenantValues(req.query, 'query'),
    ...collectTenantValues(req.body, 'body')
  ];

  for (const check of [...explicitChecks, ...discoveredChecks]) {
    const tenantValue = toTenantNumber(check.value);
    if (tenantValue === null) {
      continue;
    }
    if (Number.isNaN(tenantValue)) {
      return res.status(400).json({
        error: 'Identificador de empresa inválido',
        code: 'INVALID_TENANT_ID',
        field: `${check.location}.${check.key}`
      });
    }
    if (tenantValue !== empresaIdToken) {
      return rejectCrossTenantValue(res, check.location, check.key);
    }
  }

  req.empresa_id = empresaIdToken;
  req.tenant = { empresa_id: empresaIdToken };
  return next();
};

module.exports = { ensureTenantAccess, TENANT_FIELD_ALIASES };
