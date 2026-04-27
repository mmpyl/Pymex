const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const ApiKey = sequelize.define('ApiKey', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  empresa_id: { type: DataTypes.INTEGER, allowNull: false },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  token: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  estado: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'activa' },
  ultimo_uso: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'api_keys',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: false
});

module.exports = ApiKey;
