const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const Usuario = sequelize.define('Usuario', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    empresa_id: { type: DataTypes.INTEGER, allowNull: false },
    rol_id: { type: DataTypes.INTEGER, allowNull: false },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: false },
    password: { type: DataTypes.STRING(255), allowNull: false },
    estado: { type: DataTypes.STRING(10), defaultValue: 'activo' }
}, { tableName: 'usuarios', timestamps: true, createdAt: 'fecha_registro', updatedAt: false });

module.exports = Usuario;
