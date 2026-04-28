// backend/src/services/featureGateService.js
// Servicio centralizado para feature gating con caché y soporte multi-dominio.
// FIX: Feature.findOne({ where: { estado: 'activo' } }) en lugar de { estado: true }
// porque Feature.estado ahora es STRING (no BOOLEAN), consistente con el modelo corregido.
// También se corrige el campo en getSuscripcionActiva para usar fecha_inicio (no periodo_inicio).
// MIGRACIÓN: Imports separados por dominio (billingModels)
// REFACTOR: Las suscripciones al eventBus se realizan explícitamente mediante initialize()

const billingModels = require('../domains/billing/models');

const { Feature, FeatureOverride, Suscripcion, PlanFeature, PlanLimit } = billingModels;

const CACHE_TTL_MS = 30 * 1000; // 30 segundos
const featureCache = new Map();
const limitCache   = new Map();

let _initialized = false;

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

// ─── Inicialización explícita de suscripciones al eventBus ─────────────────────
/**
 * Inicializa las suscripciones al eventBus para invalidación de caché.
 * Debe llamarse explícitamente en el punto de arranque de la aplicación.
 * Es idempotente: solo suscribe una vez.
 */
const initialize = () => {
  if (_initialized) {
    return;
  }

  const eventBus = require('../domains/eventBus');

  // Suscribirse a eventos para invalidar caché cuando cambie la suscripción
  eventBus.subscribe('SUBSCRIPTION_CHANGED', (data) => {
    if (data && data.empresa_id) {
      clearFeatureCache(data.empresa_id);
    }
  });

  eventBus.subscribe('SUBSCRIPTION_ACTIVATED', (data) => {
    if (data && data.empresa_id) {
      clearFeatureCache(data.empresa_id);
    }
  });

  eventBus.subscribe('PAYMENT_COMPLETED', (data) => {
    if (data && data.empresa_id) {
      clearFeatureCache(data.empresa_id);
    }
  });

  // Suscribirse a eventos para invalidar caché cuando cambien features
  eventBus.subscribe('FEATURE_CHANGED', (data) => {
    if (data && data.tipo === 'empresa_override' && data.empresa_id) {
      // Invalidar caché para empresa específica
      clearFeatureCache(data.empresa_id);
      console.log(`[FeatureGate Cache] Caché invalidada por FEATURE_CHANGED (empresa) para empresa ${data.empresa_id}`);
    } else if (data && data.tipo === 'plan_feature' && data.plan_id) {
      // Para cambios en plan_feature, necesitamos invalidar caché de todas las empresas con ese plan
      invalidateCacheByPattern('feature:*');
      console.log(`[FeatureGate Cache] Caché invalidada por FEATURE_CHANGED (plan ${data.plan_id})`);
    }
  });

  _initialized = true;
};

// Función genérica para invalidar caché por patrón
const invalidateCacheByPattern = (pattern) => {
  for (const key of featureCache.keys()) {
    if (key.includes(pattern)) {
      featureCache.delete(key);
    }
  }
  for (const key of limitCache.keys()) {
    if (key.includes(pattern)) {
      limitCache.delete(key);
    }
  }
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

// ─── resolveFeatureAccess (para uso en middleware) ────────────────────────────
/**
 * Resuelve el acceso a un feature para una empresa.
 * Retorna un objeto con { active: boolean, source: string, featureId: number|null }
 * Esta función es usada por el middleware checkFeature.js
 */
const resolveFeatureAccess = async (empresaId, featureCode) => {
  // Buscar feature activo
  const feature = await Feature.findOne({
    where: { codigo: featureCode, estado: 'activo' }
  });

  if (!feature) {
    return { active: false, source: 'feature_disabled_or_missing', featureId: null };
  }

  // 1. Override por empresa (máxima prioridad)
  const override = await FeatureOverride.findOne({
    where: { empresa_id: empresaId, feature_id: feature.id }
  });
  if (override) {
    return { active: Boolean(override.activo), source: 'feature_override', featureId: feature.id };
  }

  // 2. Feature por rubro (solo si existe relación RubroFeature)
  try {
    const coreModels = require('../domains/core/models');
    const { RubroFeature } = coreModels;
    
    // Obtener empresa para verificar rubro_id
    const { Empresa } = coreModels;
    const empresa = await Empresa.findByPk(empresaId, {
      attributes: ['id', 'rubro_id']
    });

    if (empresa && empresa.rubro_id) {
      const rubroFeature = await RubroFeature.findOne({
        where: { rubro_id: empresa.rubro_id, feature_id: feature.id }
      });
      if (rubroFeature) {
        return { active: Boolean(rubroFeature.activo), source: 'rubro_feature', featureId: feature.id };
      }
    }
  } catch (error) {
    // Si no hay modelos core disponibles, continuar sin esta verificación
  }

  // 3. Plan activo de la empresa
  const suscripcion = await getSuscripcionActiva(empresaId);
  if (suscripcion) {
    const planFeature = await PlanFeature.findOne({
      where: { plan_id: suscripcion.plan_id, feature_id: feature.id, activo: true }
    });
    if (planFeature) {
      return { active: true, source: 'plan_feature', featureId: feature.id };
    }
  }

  // 4. Fallback a legacy features
  if (isLegacyFeatureEnabled(featureCode)) {
    return { active: true, source: 'legacy_fallback', featureId: feature.id };
  }

  return { active: false, source: 'no_mapping', featureId: feature.id };
};

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

  // OPTIMIZACIÓN: Precargar RubroFeature en batch para evitar N+1 queries
  // Se obtiene el rubro de la empresa y se cargan todas las relaciones rubro-feature
  let rubroFeatureMap = new Map();
  try {
    const coreModels = require('../domains/core/models');
    const { Empresa, RubroFeature } = coreModels;
    
    const empresa = await Empresa.findByPk(empresaId, {
      attributes: ['id', 'rubro_id']
    });

    if (empresa && empresa.rubro_id) {
      const rubroFeatures = await RubroFeature.findAll({
        where: { rubro_id: empresa.rubro_id }
      });
      rubroFeatureMap = new Map(rubroFeatures.map(rf => [rf.feature_id, rf]));
    }
  } catch (error) {
    // Si no hay modelos core disponibles, continuar sin esta verificación
  }

  return features.map(feature => {
    // 1. Override por empresa (máxima prioridad)
    const override = overrideMap.get(feature.id);
    if (override) {
      return {
        feature_id: feature.id, codigo: feature.codigo, nombre: feature.nombre,
        activo: override.activo, fuente: 'override', motivo: override.motivo || null
      };
    }

    // 2. Feature por rubro (segunda prioridad)
    const rubroFeature = rubroFeatureMap.get(feature.id);
    if (rubroFeature) {
      return {
        feature_id: feature.id, codigo: feature.codigo, nombre: feature.nombre,
        activo: Boolean(rubroFeature.activo), fuente: 'rubro_feature'
      };
    }

    // 3. Plan activo de la empresa
    const fromPlan = planFeatureMap.get(feature.id);
    if (typeof fromPlan === 'boolean') {
      return {
        feature_id: feature.id, codigo: feature.codigo, nombre: feature.nombre,
        activo: fromPlan, fuente: 'plan'
      };
    }

    // 4. Fallback a legacy features
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
  clearFeatureCache,
  invalidateCacheByPattern,
  resolveFeatureAccess,
  initialize,
  isInitialized: () => _initialized
};
