const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Empresa = sequelize.define('Empresa', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    ruc: { type: DataTypes.STRING(20), unique: true },
    email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    plan: { type: DataTypes.STRING(20), defaultValue: 'basico' },
    plan_id: { type: DataTypes.INTEGER, allowNull: true },
    rubro_id: { type: DataTypes.INTEGER, allowNull: true },
    estado: { type: DataTypes.STRING(10), defaultValue: 'activo' }
}, { tableName: 'empresas', timestamps: true, createdAt: 'fecha_registro', updatedAt: false });

module.exports = Empresa;