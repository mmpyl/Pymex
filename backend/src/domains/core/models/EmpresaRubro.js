const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const EmpresaRubro = sequelize.define('EmpresaRubro', {
  empresa_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
  rubro_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true }
}, { tableName: 'empresa_rubro', timestamps: false });

module.exports = EmpresaRubro;
