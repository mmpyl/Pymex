/**
 * Índice de Modelos del Dominio CORE
 * 
 * Este archivo centraliza los modelos que pertenecen al dominio CORE,
 * separándolos conceptualmente de otros dominios (AUTH, BILLING, ML).
 * 
 * REGRAS:
 * - Solo los modelos del dominio CORE deben importarse aquí
 * - Las relaciones entre modelos del mismo dominio están permitidas
 * - NO se permiten relaciones directas con modelos de otros dominios
 * 
 * NOTA: Las relaciones cross-domain (como Rubro ↔ Feature) deben establecerse
 * en un punto de inicialización explícito, no durante la carga del módulo.
 */

const sequelize = require('../../../config/database');

// Importación de modelos del dominio CORE
const Empresa              = require('./Empresa');
const Producto             = require('./Producto');
const Categoria            = require('./Categoria');
const Cliente              = require('./Cliente');
const Proveedor            = require('./Proveedor');
const Venta                = require('./Venta');
const DetalleVenta         = require('./DetalleVenta');
const Gasto                = require('./Gasto');
const MovimientoInventario = require('./MovimientoInventario');
const Alerta               = require('./Alerta');
const AuditLog             = require('./AuditLog');
const ApiKey               = require('./ApiKey');
const Rubro                = require('./Rubro');
const RubroFeature         = require('./RubroFeature');
const EmpresaRubro         = require('./EmpresaRubro');

// ═══════════════════════════════════════════════════════════════════════════════
// RELACIONES DENTRO DEL DOMINIO CORE
// ═══════════════════════════════════════════════════════════════════════════════

// Empresa → Productos / Categorías
Empresa.hasMany(Producto,   { foreignKey: 'empresa_id', as: 'productos' });
Producto.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

Categoria.hasMany(Producto,   { foreignKey: 'categoria_id', as: 'productos' });
Producto.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' });

// Empresa → Clientes / Proveedores
Empresa.hasMany(Cliente,    { foreignKey: 'empresa_id', as: 'clientes' });
Cliente.belongsTo(Empresa,  { foreignKey: 'empresa_id', as: 'empresa' });

Empresa.hasMany(Proveedor,   { foreignKey: 'empresa_id', as: 'proveedores' });
Proveedor.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

// Ventas (relaciones internas del dominio)
Empresa.hasMany(Venta,   { foreignKey: 'empresa_id', as: 'ventas' });
Venta.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

Cliente.hasMany(Venta,   { foreignKey: 'cliente_id', as: 'ventas' });
Venta.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

// Nota: usuario_id es referencia al dominio AUTH, se maneja como ID simple
Venta.hasMany(DetalleVenta,      { foreignKey: 'venta_id', as: 'detalles' });
DetalleVenta.belongsTo(Venta,    { foreignKey: 'venta_id', as: 'venta' });
DetalleVenta.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });

// Gastos
Empresa.hasMany(Gasto,   { foreignKey: 'empresa_id', as: 'gastos' });
Gasto.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });
// Nota: usuario_id es referencia al dominio AUTH, se maneja como ID simple

// Inventario
Empresa.hasMany(MovimientoInventario,    { foreignKey: 'empresa_id', as: 'movimientos' });
MovimientoInventario.belongsTo(Empresa,  { foreignKey: 'empresa_id', as: 'empresa' });
Producto.hasMany(MovimientoInventario,   { foreignKey: 'producto_id', as: 'movimientos' });
MovimientoInventario.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });
// Nota: usuario_id es referencia al dominio AUTH, se maneja como ID simple

// Alertas
Empresa.hasMany(Alerta,   { foreignKey: 'empresa_id', as: 'alertas' });
Alerta.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

// Auditoría y API Keys
Empresa.hasMany(ApiKey,   { foreignKey: 'empresa_id', as: 'apiKeys' });
ApiKey.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

Empresa.hasMany(AuditLog,   { foreignKey: 'empresa_id', as: 'auditLogs' });
AuditLog.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });
// Nota: usuario_id es referencia al dominio AUTH, se maneja como ID simple

// Rubros (clasificación de empresas)
Empresa.belongsToMany(Rubro, { 
  through: EmpresaRubro, 
  foreignKey: 'empresa_id', 
  otherKey: 'rubro_id',
  as: 'rubros'
});
Rubro.belongsToMany(Empresa, { 
  through: EmpresaRubro, 
  foreignKey: 'rubro_id', 
  otherKey: 'empresa_id',
  as: 'empresas'
});
Empresa.hasMany(EmpresaRubro,   { foreignKey: 'empresa_id', as: 'empresaRubros' });
EmpresaRubro.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });
Rubro.hasMany(EmpresaRubro,     { foreignKey: 'rubro_id', as: 'empresaRubros' });
EmpresaRubro.belongsTo(Rubro,   { foreignKey: 'rubro_id', as: 'rubro' });

// ═══════════════════════════════════════════════════════════════════════════════
// INICIALIZACIÓN DE RELACIONES CROSS-DOMAIN
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Inicializa las relaciones cross-domain entre Rubro (CORE) y Feature (BILLING).
 * Esta función debe llamarse explícitamente en el punto de arranque de la aplicación.
 * Es idempotente: solo establece las relaciones una vez.
 * 
 * Esto respeta el principio de fronteras de dominio al evitar imports directos
 * durante la carga del módulo.
 */
let _crossDomainRelationsInitialized = false;

const initializeCrossDomainRelations = () => {
  if (_crossDomainRelationsInitialized) {
    return;
  }

  try {
    const Feature = require('../../billing/models/Feature');
    
    Rubro.belongsToMany(Feature, { 
      through: RubroFeature, 
      foreignKey: 'rubro_id', 
      otherKey: 'feature_id',
      as: 'features'
    });

    Feature.belongsToMany(Rubro, {
      through: RubroFeature,
      foreignKey: 'feature_id',
      otherKey: 'rubro_id',
      as: 'rubros'
    });
    
    // Relaciones directas para includes simples
    RubroFeature.belongsTo(Rubro, { foreignKey: 'rubro_id', as: 'rubro' });
    RubroFeature.belongsTo(Feature, { foreignKey: 'feature_id', as: 'feature' });
    
    _crossDomainRelationsInitialized = true;
  } catch (error) {
    // En entorno de testing o cuando billing no está disponible, continuar sin error
    if (process.env.NODE_ENV !== 'test') {
      console.warn('No se pudo cargar Feature para relación con Rubro:', error.message);
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTACIÓN
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  sequelize,
  // Entidades principales
  Empresa,
  Producto,
  Categoria,
  Cliente,
  Proveedor,
  // Transacciones
  Venta,
  DetalleVenta,
  Gasto,
  MovimientoInventario,
  // Soporte
  Alerta,
  AuditLog,
  ApiKey,
  // Clasificación
  Rubro,
  RubroFeature,
  EmpresaRubro,
  // Inicialización
  initializeCrossDomainRelations,
  areCrossDomainRelationsInitialized: () => _crossDomainRelationsInitialized
};

// Alias para compatibilidad con código legacy
module.exports.default = module.exports;
