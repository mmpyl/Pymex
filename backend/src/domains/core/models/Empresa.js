const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const Empresa = sequelize.define('Empresa', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: true },
    ruc: { type: DataTypes.STRING(20), unique: true },
    plan_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'planes', key: 'id' } },
    plan: { type: DataTypes.STRING(20), defaultValue: 'basico' },
    estado: { type: DataTypes.STRING(10), defaultValue: 'activo' }
}, { tableName: 'empresas', timestamps: true, createdAt: 'fecha_registro', updatedAt: false });

module.exports = Empresa;
