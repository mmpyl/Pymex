const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const Venta = sequelize.define('Venta', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    empresa_id: { type: DataTypes.INTEGER, allowNull: false },
    cliente_id: { type: DataTypes.INTEGER },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    total: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    metodo_pago: { type: DataTypes.STRING(30), defaultValue: 'efectivo' },
    estado: { type: DataTypes.STRING(20), defaultValue: 'completada' },
    notas: { type: DataTypes.TEXT },
    fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'ventas', timestamps: false });

module.exports = Venta;
