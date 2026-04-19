// backend/src/services/featureGateService.js
// FIX: Feature.findOne({ where: { estado: 'activo' } }) en lugar de { estado: true }
// porque Feature.estado ahora es STRING (no BOOLEAN), consistente con el modelo corregido.
// También se corrige el campo en getSuscripcionActiva para usar fecha_inicio (no periodo_inicio).

const { Feature, FeatureOverride, Suscripcion, PlanFeature, PlanLimit } = require('../models');

const CACHE_TTL_MS = 30 * 1000; // 30 segundos
const featureCache = new Map();
const limitCache   = new Map();

// ─── Cache helpers ─────────────────────────────────────────────────────────────
const getCached = (cache, key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  return entry.value;
};

const setCached = (cache, key, value) => {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
};

// ─── Suscripción activa ────────────────────────────────────────────────────────
const getSuscripcionActiva = async (empresaId) => {
  return Suscripcion.findOne({
    where:  { empresa_id: empresaId, estado: { [require('sequelize').Op.in]: ['activa', 'trial'] } },
    order:  [['fecha_inicio', 'DESC']]   // FIX: era periodo_inicio en modelo viejo
  });
};

// ─── Features legacy (siempre activos aunque no estén en BD) ──────────────────
const LEGACY_FEATURES = new Set(['ventas', 'inventario', 'reportes', 'alertas', 'dashboard']);

const isLegacyFeatureEnabled = (featureCode) => LEGACY_FEATURES.has(featureCode);

// ─── hasFeature ───────────────────────────────────────────────────────────────
const hasFeature = async (empresaId, featureCode) => {
  const cacheKey = `${empresaId}:${featureCode}`;
  const cached   = getCached(featureCache, cacheKey);
  if (cached !== null) return cached;

  // FIX: buscar por estado STRING 'activo' (no booleano true)
  const feature = await Feature.findOne({
    where: { codigo: featureCode, estado: 'activo' }
  });

  if (!feature) {
    const fallback = isLegacyFeatureEnabled(featureCode);
    setCached(featureCache, cacheKey, fallback);
    return fallback;
  }

  // 1. Override por empresa (máxima prioridad)
  const override = await FeatureOverride.findOne({
    where: { empresa_id: empresaId, feature_id: feature.id },
    order: [['actualizado_en', 'DESC']]
  });
  if (override) {
    setCached(featureCache, cacheKey, override.activo);
    return override.activo;
  }

  // 2. Plan activo de la empresa
  const suscripcion = await getSuscripcionActiva(empresaId);
  if (!suscripcion) {
    const fallback = isLegacyFeatureEnabled(featureCode);
    setCached(featureCache, cacheKey, fallback);
    return fallback;
  }

  const planFeature = await PlanFeature.findOne({
    where: { plan_id: suscripcion.plan_id, feature_id: feature.id, activo: true }
  });

  const enabled = Boolean(planFeature);
  setCached(featureCache, cacheKey, enabled);
  return enabled;
};

// ─── getPlanLimit ─────────────────────────────────────────────────────────────
const getPlanLimit = async (empresaId, limitCode) => {
  const cacheKey = `${empresaId}:${limitCode}`;
  const cached   = getCached(limitCache, cacheKey);
  if (cached) return cached;

  const suscripcion = await getSuscripcionActiva(empresaId);
  if (!suscripcion) return null;

  const limit = await PlanLimit.findOne({
    where: { plan_id: suscripcion.plan_id, limite: limitCode }
  });
  if (limit) setCached(limitCache, cacheKey, limit);
  return limit;
};

// ─── getEffectiveFeaturesForEmpresa ───────────────────────────────────────────
const getEffectiveFeaturesForEmpresa = async (empresaId) => {
  // FIX: estado STRING 'activo'
  const [features, suscripcion] = await Promise.all([
    Feature.findAll({ where: { estado: 'activo' }, order: [['codigo', 'ASC']] }),
    getSuscripcionActiva(empresaId)
  ]);

  const planFeatures = suscripcion
    ? await PlanFeature.findAll({ where: { plan_id: suscripcion.plan_id } })
    : [];

  const planFeatureMap = new Map(planFeatures.map(pf => [pf.feature_id, pf.activo]));

  const overrides    = await FeatureOverride.findAll({ where: { empresa_id: empresaId } });
  const overrideMap  = new Map(overrides.map(ov => [ov.feature_id, ov]));

  return features.map(feature => {
    const override = overrideMap.get(feature.id);
    if (override) {
      return {
        feature_id: feature.id, codigo: feature.codigo, nombre: feature.nombre,
        activo: override.activo, fuente: 'override', motivo: override.motivo || null
      };
    }

    const fromPlan = planFeatureMap.get(feature.id);
    if (typeof fromPlan === 'boolean') {
      return {
        feature_id: feature.id, codigo: feature.codigo, nombre: feature.nombre,
        activo: fromPlan, fuente: 'plan'
      };
    }

    const legacy = isLegacyFeatureEnabled(feature.codigo);
    return {
      feature_id: feature.id, codigo: feature.codigo, nombre: feature.nombre,
      activo: legacy, fuente: legacy ? 'legacy_fallback' : 'none'
    };
  });
};

// ─── clearFeatureCache ────────────────────────────────────────────────────────
const clearFeatureCache = (empresaId) => {
  const prefix = `${empresaId}:`;
  for (const key of featureCache.keys()) {
    if (key.startsWith(prefix)) featureCache.delete(key);
  }
  for (const key of limitCache.keys()) {
    if (key.startsWith(prefix)) limitCache.delete(key);
  }
};

module.exports = {
  hasFeature,
  getPlanLimit,
  getEffectiveFeaturesForEmpresa,
  clearFeatureCache
};
