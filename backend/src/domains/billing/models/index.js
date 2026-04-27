/**
 * Índice de Modelos del Dominio BILLING
 * 
 * Este archivo centraliza los modelos que pertenecen al dominio BILLING,
 * responsable de planes, suscripciones, pagos y facturación electrónica.
 * 
 * REGLAS:
 * - Solo los modelos del dominio BILLING deben importarse aquí
 * - Las relaciones entre modelos del mismo dominio están permitidas
 * - NO se permiten relaciones directas con modelos de otros dominios
 */

const sequelize = require('../../../config/database');

// Importación de modelos del dominio BILLING
const Plan            = require('./Plan');
const Feature         = require('./Feature');
const PlanFeature     = require('./PlanFeature');
const PlanLimit       = require('./PlanLimit');
const Suscripcion     = require('./Suscripcion');
const FeatureOverride = require('./FeatureOverride');
const Pago            = require('./Pago');
const PaymentEvent    = require('./PaymentEvent');
const Comprobante     = require('./Comprobante');
const DomainEvent     = require('./DomainEvent'); // Outbox pattern para eventos persistentes

// Nota: SeriesComprobante no existe como modelo separado en la estructura actual
// Se maneja dentro del contexto de comprobantes

// ═══════════════════════════════════════════════════════════════════════════════
// RELACIONES DENTRO DEL DOMINIO BILLING
// ═══════════════════════════════════════════════════════════════════════════════

// Planes y Features
Plan.hasMany(PlanFeature,    { foreignKey: 'plan_id', as: 'features' });
PlanFeature.belongsTo(Plan,  { foreignKey: 'plan_id', as: 'plan' });
Feature.hasMany(PlanFeature, { foreignKey: 'feature_id', as: 'planes' });
PlanFeature.belongsTo(Feature,{ foreignKey: 'feature_id', as: 'feature' });

Plan.hasMany(PlanLimit,   { foreignKey: 'plan_id', as: 'limits' });
PlanLimit.belongsTo(Plan, { foreignKey: 'plan_id', as: 'plan' });

// Suscripciones
// Nota: La relación Suscripción ↔ Empresa cruza el límite del dominio CORE.
// Se maneja como referencia externa (empresa_id) sin relación directa de Sequelize.
Plan.hasMany(Suscripcion,      { foreignKey: 'plan_id', as: 'suscripciones' });
Suscripcion.belongsTo(Plan,    { foreignKey: 'plan_id', as: 'plan' });

// Feature Overrides
// Nota: La relación FeatureOverride ↔ Empresa cruza el límite del dominio CORE.
Feature.hasMany(FeatureOverride,   { foreignKey: 'feature_id', as: 'overrides' });
FeatureOverride.belongsTo(Feature, { foreignKey: 'feature_id', as: 'feature' });

// Pagos
// Nota: La relación Pago ↔ Empresa cruza el límite del dominio CORE.
Suscripcion.hasMany(Pago,   { foreignKey: 'suscripcion_id', as: 'pagos' });
Pago.belongsTo(Suscripcion, { foreignKey: 'suscripcion_id', as: 'suscripcion' });

// Comprobantes
// Nota: La relación Comprobante ↔ Empresa cruza el límite del dominio CORE.
// Nota: La relación Comprobante ↔ Venta cruza el límite del dominio CORE.

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTACIÓN
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  sequelize,
  // Planes y Features
  Plan,
  Feature,
  PlanFeature,
  PlanLimit,
  // Suscripciones
  Suscripcion,
  FeatureOverride,
  // Pagos
  Pago,
  PaymentEvent,
  // Facturación
  Comprobante,
  // Outbox pattern para eventos persistentes
  DomainEvent
};

// Alias para compatibilidad con código legacy
module.exports.default = module.exports;
