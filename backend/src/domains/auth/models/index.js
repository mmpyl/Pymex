/**
 * Índice de Modelos del Dominio AUTH
 * 
 * Este archivo centraliza los modelos que pertenecen al dominio AUTH,
 * responsable de autenticación, autorización y gestión de sesiones.
 * 
 * REGLAS:
 * - Solo los modelos del dominio AUTH deben importarse aquí
 * - Las relaciones entre modelos del mismo dominio están permitidas
 * - NO se permiten relaciones directas con modelos de otros dominios
 */

const sequelize = require('../../../config/database');

// Importación de modelos del dominio AUTH
const UsuarioBusiness  = require('./UsuarioBusiness');
const Rol              = require('./Rol');
const Permiso          = require('./Permiso');
const RolPermiso       = require('./RolPermiso');
const UsuarioAdmin     = require('./UsuarioAdmin');
const RevokedToken     = require('./RevokedToken');
const AuditoriaAdmin   = require('./AuditoriaAdmin');

// ═══════════════════════════════════════════════════════════════════════════════
// RELACIONES DENTRO DEL DOMINIO AUTH
// ═══════════════════════════════════════════════════════════════════════════════

// RBAC: Roles y Permisos
Rol.hasMany(UsuarioBusiness,      { foreignKey: 'rol_id', as: 'usuarios_business' });
UsuarioBusiness.belongsTo(Rol,    { foreignKey: 'rol_id', as: 'rol' });

Rol.belongsToMany(Permiso, { 
  through: RolPermiso, 
  foreignKey: 'rol_id',    
  otherKey: 'permiso_id',
  as: 'permisos'
});
Permiso.belongsToMany(Rol, { 
  through: RolPermiso, 
  foreignKey: 'permiso_id', 
  otherKey: 'rol_id',
  as: 'roles'
});

// Nota: La relación Usuario ↔ Empresa cruza el límite del dominio CORE.
// Se maneja como referencia externa (empresa_id) sin relación directa de Sequelize.
// En una arquitectura completa, esto se resolvería mediante eventos o APIs.

// ═══════════════════════════════════════════════════════════════════════════════
// RELACIONES CROSS-DOMAIN (se inicializan explícitamente)
// ═══════════════════════════════════════════════════════════════════════════════

let _crossDomainRelationsInitialized = false;

/**
 * Inicializa relaciones cross-domain entre AUTH y CORE
 * Debe llamarse explícitamente durante el startup de la aplicación
 */
const initializeCrossDomainRelations = () => {
  if (_crossDomainRelationsInitialized) {
    return;
  }

  try {
    const Empresa = require('../../core/models/Empresa');
    const AuditLog = require('../../core/models/AuditLog');

    // UsuarioBusiness pertenece a una Empresa
    Empresa.hasMany(UsuarioBusiness, { foreignKey: 'empresa_id', as: 'usuarios_business' });
    UsuarioBusiness.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

    // AuditLog pertenece a UsuarioBusiness (relación cross-domain CORE -> AUTH)
    AuditLog.belongsTo(UsuarioBusiness, { foreignKey: 'usuario_id', as: 'usuario' });
    UsuarioBusiness.hasMany(AuditLog, { foreignKey: 'usuario_id', as: 'auditLogs' });

    _crossDomainRelationsInitialized = true;
    console.log('[AUTH] Relaciones cross-domain con CORE inicializadas');
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[AUTH] No se pudo cargar Empresa para relación cross-domain:', error.message);
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTACIÓN
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  sequelize,
  // Entidades principales
  UsuarioBusiness,
  Rol,
  Permiso,
  RolPermiso,
  // Administración
  UsuarioAdmin,
  // Seguridad de sesiones
  RevokedToken,
  // Auditoría
  AuditoriaAdmin,
  // Inicialización cross-domain
  initializeCrossDomainRelations,
  areCrossDomainRelationsInitialized: () => _crossDomainRelationsInitialized
};

// Alias para compatibilidad con código legacy
module.exports.default = module.exports;
