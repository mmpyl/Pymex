// backend/src/models/Rol.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const Rol = sequelize.define('Rol', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(50), allowNull: false },
  descripcion: { type: DataTypes.STRING(200), allowNull: true }
}, {
  tableName: 'roles',
  timestamps: false
});

module.exports = Rol;
