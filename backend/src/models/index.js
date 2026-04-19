// backend/src/models/index.js — versión consolidada
const sequelize            = require('../config/database');
const Empresa              = require('./Empresa');
const Usuario              = require('./Usuario');
const UsuarioAdmin         = require('./UsuarioAdmin');
const Rol                  = require('./Rol');
const Permiso              = require('./Permiso');
const RolPermiso           = require('./RolPermiso');
const Producto             = require('./Producto');
const Categoria            = require('./Categoria');
const Cliente              = require('./Cliente');
const Proveedor            = require('./Proveedor');
const Venta                = require('./Venta');
const DetalleVenta         = require('./DetalleVenta');
const Gasto                = require('./Gasto');
const MovimientoInventario = require('./MovimientoInventario');
const Alerta               = require('./Alerta');
const Comprobante          = require('./Comprobante');
const AuditLog             = require('./AuditLog');
const ApiKey               = require('./ApiKey');
const Plan                 = require('./Plan');
const Feature              = require('./Feature');
const PlanFeature          = require('./PlanFeature');
const PlanLimit            = require('./PlanLimit');
const Suscripcion          = require('./Suscripcion');
const FeatureOverride      = require('./FeatureOverride');
const Pago                 = require('./Pago');
const AuditoriaAdmin       = require('./AuditoriaAdmin');
const PaymentEvent         = require('./PaymentEvent');
const Rubro                = require('./Rubro');
const RubroFeature         = require('./RubroFeature');
const EmpresaRubro         = require('./EmpresaRubro');

// ─── RBAC ─────────────────────────────────────────────────────────────────────
Rol.hasMany(Usuario,      { foreignKey: 'rol_id' });
Usuario.belongsTo(Rol,    { foreignKey: 'rol_id' });

Rol.belongsToMany(Permiso, { through: RolPermiso, foreignKey: 'rol_id',    otherKey: 'permiso_id' });
Permiso.belongsToMany(Rol, { through: RolPermiso, foreignKey: 'permiso_id', otherKey: 'rol_id' });

// ─── Empresa → Usuarios ───────────────────────────────────────────────────────
Empresa.hasMany(Usuario,   { foreignKey: 'empresa_id' });
Usuario.belongsTo(Empresa, { foreignKey: 'empresa_id' });

// ─── Empresa → Productos ──────────────────────────────────────────────────────
Empresa.hasMany(Producto,   { foreignKey: 'empresa_id' });
Producto.belongsTo(Empresa, { foreignKey: 'empresa_id' });

Categoria.hasMany(Producto,   { foreignKey: 'categoria_id' });
Producto.belongsTo(Categoria, { foreignKey: 'categoria_id' });

// ─── Empresa → Clientes / Proveedores ─────────────────────────────────────────
Empresa.hasMany(Cliente,    { foreignKey: 'empresa_id' });
Cliente.belongsTo(Empresa,  { foreignKey: 'empresa_id' });

Empresa.hasMany(Proveedor,   { foreignKey: 'empresa_id' });
Proveedor.belongsTo(Empresa, { foreignKey: 'empresa_id' });

// ─── Ventas ───────────────────────────────────────────────────────────────────
Empresa.hasMany(Venta,   { foreignKey: 'empresa_id' });
Venta.belongsTo(Empresa, { foreignKey: 'empresa_id' });

Cliente.hasMany(Venta,   { foreignKey: 'cliente_id' });
Venta.belongsTo(Cliente, { foreignKey: 'cliente_id' });

Usuario.hasMany(Venta,   { foreignKey: 'usuario_id' });
Venta.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Venta.hasMany(DetalleVenta,      { foreignKey: 'venta_id' });
DetalleVenta.belongsTo(Venta,    { foreignKey: 'venta_id' });
DetalleVenta.belongsTo(Producto, { foreignKey: 'producto_id' });

// ─── Gastos ───────────────────────────────────────────────────────────────────
Empresa.hasMany(Gasto,   { foreignKey: 'empresa_id' });
Gasto.belongsTo(Empresa, { foreignKey: 'empresa_id' });
Usuario.hasMany(Gasto,   { foreignKey: 'usuario_id' });
Gasto.belongsTo(Usuario, { foreignKey: 'usuario_id' });

// ─── Inventario ───────────────────────────────────────────────────────────────
Empresa.hasMany(MovimientoInventario,    { foreignKey: 'empresa_id' });
MovimientoInventario.belongsTo(Empresa,  { foreignKey: 'empresa_id' });
Producto.hasMany(MovimientoInventario,   { foreignKey: 'producto_id' });
MovimientoInventario.belongsTo(Producto, { foreignKey: 'producto_id' });
Usuario.hasMany(MovimientoInventario,    { foreignKey: 'usuario_id' });
MovimientoInventario.belongsTo(Usuario,  { foreignKey: 'usuario_id' });

// ─── Alertas ──────────────────────────────────────────────────────────────────
Empresa.hasMany(Alerta,   { foreignKey: 'empresa_id' });
Alerta.belongsTo(Empresa, { foreignKey: 'empresa_id' });

// ─── Comprobantes ─────────────────────────────────────────────────────────────
Empresa.hasMany(Comprobante,   { foreignKey: 'empresa_id' });
Comprobante.belongsTo(Empresa, { foreignKey: 'empresa_id' });

// ─── Auditoría / API Keys ─────────────────────────────────────────────────────
Empresa.hasMany(ApiKey,   { foreignKey: 'empresa_id' });
ApiKey.belongsTo(Empresa, { foreignKey: 'empresa_id' });

Empresa.hasMany(AuditLog,   { foreignKey: 'empresa_id' });
AuditLog.belongsTo(Empresa, { foreignKey: 'empresa_id' });
Usuario.hasMany(AuditLog,   { foreignKey: 'usuario_id' });
AuditLog.belongsTo(Usuario, { foreignKey: 'usuario_id' });

// ─── Planes ───────────────────────────────────────────────────────────────────
Plan.hasMany(Empresa,   { foreignKey: 'plan_id' });
Empresa.belongsTo(Plan, { foreignKey: 'plan_id' });

Plan.hasMany(PlanFeature,    { foreignKey: 'plan_id' });
PlanFeature.belongsTo(Plan,  { foreignKey: 'plan_id' });
Feature.hasMany(PlanFeature, { foreignKey: 'feature_id' });
PlanFeature.belongsTo(Feature,{ foreignKey: 'feature_id' });

Plan.hasMany(PlanLimit,   { foreignKey: 'plan_id' });
PlanLimit.belongsTo(Plan, { foreignKey: 'plan_id' });

// ─── Suscripciones ────────────────────────────────────────────────────────────
Empresa.hasMany(Suscripcion,   { foreignKey: 'empresa_id' });
Suscripcion.belongsTo(Empresa, { foreignKey: 'empresa_id' });
Plan.hasMany(Suscripcion,      { foreignKey: 'plan_id' });
Suscripcion.belongsTo(Plan,    { foreignKey: 'plan_id' });

// ─── Feature Overrides ────────────────────────────────────────────────────────
Empresa.hasMany(FeatureOverride,   { foreignKey: 'empresa_id' });
FeatureOverride.belongsTo(Empresa, { foreignKey: 'empresa_id' });
Feature.hasMany(FeatureOverride,   { foreignKey: 'feature_id' });
FeatureOverride.belongsTo(Feature, { foreignKey: 'feature_id' });

// ─── Pagos ────────────────────────────────────────────────────────────────────
Empresa.hasMany(Pago,       { foreignKey: 'empresa_id' });
Pago.belongsTo(Empresa,     { foreignKey: 'empresa_id' });
Suscripcion.hasMany(Pago,   { foreignKey: 'suscripcion_id' });
Pago.belongsTo(Suscripcion, { foreignKey: 'suscripcion_id' });

// ─── Rubros ───────────────────────────────────────────────────────────────────
Empresa.belongsToMany(Rubro, { through: EmpresaRubro, foreignKey: 'empresa_id', otherKey: 'rubro_id' });
Rubro.belongsToMany(Empresa, { through: EmpresaRubro, foreignKey: 'rubro_id',   otherKey: 'empresa_id' });
Empresa.hasMany(EmpresaRubro,   { foreignKey: 'empresa_id' });
EmpresaRubro.belongsTo(Empresa, { foreignKey: 'empresa_id' });
Rubro.hasMany(EmpresaRubro,     { foreignKey: 'rubro_id' });
EmpresaRubro.belongsTo(Rubro,   { foreignKey: 'rubro_id' });

Rubro.belongsToMany(Feature,  { through: RubroFeature, foreignKey: 'rubro_id',   otherKey: 'feature_id' });
Feature.belongsToMany(Rubro,  { through: RubroFeature, foreignKey: 'feature_id', otherKey: 'rubro_id' });

module.exports = {
  sequelize,
  Empresa, Usuario, UsuarioAdmin,
  Rol, Permiso, RolPermiso,
  Producto, Categoria,
  Cliente, Proveedor,
  Venta, DetalleVenta,
  Gasto, MovimientoInventario, Alerta,
  Comprobante, AuditLog, ApiKey,
  Plan, Feature, PlanFeature, PlanLimit,
  Suscripcion, FeatureOverride,
  Pago, AuditoriaAdmin, PaymentEvent,
  Rubro, RubroFeature, EmpresaRubro
};