// backend/src/models/PlanFeature.js
// FIX: conflicto de merge resuelto.
// Se elige la versión con id autoincrement, consistente con database.sql v3
// que define: id SERIAL PK, UNIQUE(plan_id, feature_id), timestamps
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlanFeature = sequelize.define('PlanFeature', {


  plan_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
  feature_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
  tableName: 'plan_features',
  timestamps: false
});

  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  plan_id: { type: DataTypes.INTEGER, allowNull: false },
  feature_id: { type: DataTypes.INTEGER, allowNull: false },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'plan_features', timestamps: true, createdAt: 'creado_en', updatedAt: 'actualizado_en' });


  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  plan_id:    { type: DataTypes.INTEGER, allowNull: false },
  feature_id: { type: DataTypes.INTEGER, allowNull: false },
  activo:     { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName:  'plan_features',
  timestamps: true,
  createdAt:  'creado_en',
  updatedAt:  'actualizado_en'
});


module.exports = PlanFeature;
