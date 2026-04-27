const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const RubroFeature = sequelize.define('RubroFeature', {
  rubro_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
  feature_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
  tableName: 'rubro_features',
  timestamps: false
});

module.exports = RubroFeature;
