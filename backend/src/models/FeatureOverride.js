// backend/src/models/FeatureOverride.js
// FIX: conflicto de merge resuelto.
// Se elige la versión con id autoincrement + campo motivo, consistente con database.sql v3
// que define: id SERIAL PK, motivo VARCHAR(300), UNIQUE(empresa_id, feature_id)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FeatureOverride = sequelize.define('FeatureOverride', {

  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  empresa_id: { type: DataTypes.INTEGER, allowNull: false },
  feature_id: { type: DataTypes.INTEGER, allowNull: false },
  activo: { type: DataTypes.BOOLEAN, allowNull: false },
  motivo: { type: DataTypes.STRING(300) }
}, { tableName: 'feature_overrides', timestamps: true, createdAt: 'creado_en', updatedAt: 'actualizado_en' });

module.exports = FeatureOverride;
