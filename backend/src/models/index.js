/**
 * Legacy Models Facade - Compatibility Layer
 * 
 * ESTE ARCHIVO ES TEMPORAL para mantener compatibilidad con código legacy
 * mientras se completa la migración a DDD.
 * 
 * TODO: Migrar todo el código a importar directamente desde los dominios:
 * - auth:   require('../domains/auth/models')
 * - core:   require('../domains/core/models')
 * - billing: require('../domains/billing/models')
 * 
 * Una vez completada la migración, este archivo debe ser eliminado.
 */

const authModels = require('../domains/auth/models');
const coreModels = require('../domains/core/models');
const billingModels = require('../domains/billing/models');

// Re-exportar todos los modelos para compatibilidad con imports legacy
module.exports = {
  sequelize: coreModels.sequelize,
  
  // AUTH domain
  Usuario: authModels.Usuario,
  Rol: authModels.Rol,
  Permiso: authModels.Permiso,
  RolPermiso: authModels.RolPermiso,
  UsuarioAdmin: authModels.UsuarioAdmin,
  RevokedToken: authModels.RevokedToken,
  AuditoriaAdmin: authModels.AuditoriaAdmin,
  
  // CORE domain
  Empresa: coreModels.Empresa,
  Producto: coreModels.Producto,
  Categoria: coreModels.Categoria,
  Cliente: coreModels.Cliente,
  Proveedor: coreModels.Proveedor,
  Venta: coreModels.Venta,
  DetalleVenta: coreModels.DetalleVenta,
  Gasto: coreModels.Gasto,
  MovimientoInventario: coreModels.MovimientoInventario,
  Alerta: coreModels.Alerta,
  AuditLog: coreModels.AuditLog,
  ApiKey: coreModels.ApiKey,
  Rubro: coreModels.Rubro,
  RubroFeature: coreModels.RubroFeature,
  EmpresaRubro: coreModels.EmpresaRubro,
  
  // BILLING domain
  Plan: billingModels.Plan,
  Feature: billingModels.Feature,
  PlanFeature: billingModels.PlanFeature,
  PlanLimit: billingModels.PlanLimit,
  Suscripcion: billingModels.Suscripcion,
  FeatureOverride: billingModels.FeatureOverride,
  Pago: billingModels.Pago,
  PaymentEvent: billingModels.PaymentEvent,
  Comprobante: billingModels.Comprobante
};

// Alias para compatibilidad
module.exports.default = module.exports;
