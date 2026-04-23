// backend/src/models/Rubro.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rubro = sequelize.define('Rubro', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  descripcion: { type: DataTypes.STRING(300), allowNull: true }
}, {
  tableName: 'rubros',
  timestamps: false
});

module.exports = Rubro;
