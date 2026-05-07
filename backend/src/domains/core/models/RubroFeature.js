const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');
const Rubro = require('./Rubro');
const Feature = require('../../billing/models/Feature');

const RubroFeature = sequelize.define('RubroFeature', {
  rubro_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
  feature_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
  tableName: 'rubro_features',
  timestamps: false
});

// Definir relaciones para que los includes funcionen correctamente
RubroFeature.belongsTo(Rubro, { foreignKey: 'rubro_id', as: 'rubro' });
RubroFeature.belongsTo(Feature, { foreignKey: 'feature_id', as: 'feature' });

module.exports = RubroFeature;
