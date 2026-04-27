// backend/src/models/Suscripcion.js
// FIX: conflicto de merge resuelto.
// Se elige la versión consistente con database.sql v3:
//   - plan_id FK (no plan VARCHAR)
//   - fecha_inicio / fecha_fin (no periodo_inicio / periodo_fin)
//   - auto_renovacion BOOLEAN
//   - timestamps creado_en / actualizado_en
const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const Suscripcion = sequelize.define('Suscripcion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  empresa_id: { type: DataTypes.INTEGER, allowNull: false },
  plan_id: { type: DataTypes.INTEGER, allowNull: false },
  estado: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'activa' },
  // Estados válidos: activa | trial | cancelada | suspendida
  fecha_inicio: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  fecha_fin: { type: DataTypes.DATE, allowNull: true },
  auto_renovacion: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'suscripciones',
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: 'actualizado_en'
});

module.exports = Suscripcion;
