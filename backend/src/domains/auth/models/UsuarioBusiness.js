const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

/**
 * Modelo UsuarioBusiness - Usuarios de empresas (business users)
 * Tabla: usuarios_business
 * 
 * Representa a los usuarios que pertenecen a una empresa en el sistema SaaS.
 * Estos usuarios tienen roles y permisos dentro de su empresa.
 */
const UsuarioBusiness = sequelize.define('UsuarioBusiness', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    empresa_id: { type: DataTypes.INTEGER, allowNull: false },
    rol_id: { type: DataTypes.INTEGER, allowNull: false },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: false },
    password: { type: DataTypes.STRING(255), allowNull: false },
    estado: { type: DataTypes.STRING(10), defaultValue: 'activo' }
}, { tableName: 'usuarios_business', timestamps: true, createdAt: 'fecha_registro', updatedAt: false });

module.exports = UsuarioBusiness;
