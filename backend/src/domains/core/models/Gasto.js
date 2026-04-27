const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const Gasto = sequelize.define('Gasto', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    empresa_id: { type: DataTypes.INTEGER, allowNull: false },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    categoria: { type: DataTypes.STRING(100), allowNull: false },
    descripcion: { type: DataTypes.STRING(300) },
    monto: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'gastos', timestamps: false });

module.exports = Gasto;
