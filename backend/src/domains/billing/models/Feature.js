// backend/src/models/Feature.js
// FIX: conflicto de merge resuelto.
// Se elige la versión consistente con database.sql v3:
//   - estado como STRING (activo/inactivo), consistente con el SQL que usa VARCHAR(20)
//   - timestamps creado_en / actualizado_en
//   - codigo VARCHAR(80) para cubrir códigos largos
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Feature = sequelize.define('Feature', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  codigo: { type: DataTypes.STRING(80), allowNull: false, unique: true },
  descripcion: { type: DataTypes.STRING(400), allowNull: true },
  // FIX: estado como STRING (consistente con database.sql v3 que usa VARCHAR(20) DEFAULT 'activo')
  estado: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'activo' }
}, {
  tableName: 'features',
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: 'actualizado_en'
});

module.exports = Feature;
