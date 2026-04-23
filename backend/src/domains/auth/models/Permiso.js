const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Permiso = sequelize.define('Permiso', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(120), allowNull: false },
  codigo: { type: DataTypes.STRING(80), allowNull: false, unique: true }
}, {
  tableName: 'permisos',
  timestamps: false
});

module.exports = Permiso;
