const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlanLimit = sequelize.define('PlanLimit', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  plan_id: { type: DataTypes.INTEGER, allowNull: false },
  limite: { type: DataTypes.STRING(80), allowNull: false },
  valor: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
}, { tableName: 'plan_limits', timestamps: true, createdAt: 'creado_en', updatedAt: 'actualizado_en' });

module.exports = PlanLimit;
