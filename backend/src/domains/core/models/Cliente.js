const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const Cliente = sequelize.define('Cliente', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    empresa_id: { type: DataTypes.INTEGER, allowNull: false },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    documento: { type: DataTypes.STRING(20) },
    email: { type: DataTypes.STRING(100) },
    telefono: { type: DataTypes.STRING(20) },
    direccion: { type: DataTypes.STRING(200) }
}, { tableName: 'clientes', timestamps: false });

module.exports = Cliente;
