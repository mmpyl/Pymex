// backend/src/models/Plan.js
// FIX: tableName corregido a 'planes' (el SQL v3 crea la tabla como 'planes', no 'plans')
const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const Plan = sequelize.define('Plan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  codigo: { type: DataTypes.STRING(30), allowNull: false, unique: true },
  descripcion: { type: DataTypes.STRING(300), allowNull: true },
  precio_mensual: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  estado: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'activo' }
}, {
  tableName: 'planes',
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: 'actualizado_en'
});

module.exports = Plan;
