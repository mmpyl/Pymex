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
const Usuario      = require('./Usuario');
const Rol          = require('./Rol');
const Permiso      = require('./Permiso');
const RolPermiso   = require('./RolPermiso');
const UsuarioAdmin = require('./UsuarioAdmin');
const RevokedToken = require('./RevokedToken');
const AuditoriaAdmin = require('./AuditoriaAdmin');

// ═══════════════════════════════════════════════════════════════════════════════
// RELACIONES DENTRO DEL DOMINIO AUTH
// ═══════════════════════════════════════════════════════════════════════════════

// RBAC: Roles y Permisos
Rol.hasMany(Usuario,      { foreignKey: 'rol_id', as: 'usuarios' });
Usuario.belongsTo(Rol,    { foreignKey: 'rol_id', as: 'rol' });

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
// EXPORTACIÓN
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  sequelize,
  // Entidades principales
  Usuario,
  Rol,
  Permiso,
  RolPermiso,
  // Administración
  UsuarioAdmin,
  // Seguridad de sesiones
  RevokedToken,
  // Auditoría
  AuditoriaAdmin
};

// Alias para compatibilidad con código legacy
module.exports.default = module.exports;
