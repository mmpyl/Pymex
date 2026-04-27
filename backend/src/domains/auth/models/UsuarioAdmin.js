const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const UsuarioAdmin = sequelize.define('UsuarioAdmin', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  rol: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'super_admin' },
  estado: { type: DataTypes.STRING(15), allowNull: false, defaultValue: 'activo' }
}, { tableName: 'usuarios_admin', timestamps: true, createdAt: 'creado_en', updatedAt: 'actualizado_en' });

module.exports = UsuarioAdmin;
