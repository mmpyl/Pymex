const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Alerta = sequelize.define('Alerta', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    empresa_id: { type: DataTypes.INTEGER, allowNull: false },
    tipo: { type: DataTypes.STRING(50), allowNull: false },
    mensaje: { type: DataTypes.TEXT, allowNull: false },
    leido: { type: DataTypes.BOOLEAN, defaultValue: false },
    fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'alertas', timestamps: false });

module.exports = Alerta;