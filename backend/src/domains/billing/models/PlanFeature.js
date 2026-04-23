// backend/src/models/PlanFeature.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlanFeature = sequelize.define('PlanFeature', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  plan_id: { type: DataTypes.INTEGER, allowNull: false },
  feature_id: { type: DataTypes.INTEGER, allowNull: false },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'plan_features',
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: 'actualizado_en'
});

module.exports = PlanFeature;
