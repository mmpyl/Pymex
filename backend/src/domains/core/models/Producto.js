const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const Producto = sequelize.define('Producto', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    empresa_id: { type: DataTypes.INTEGER, allowNull: false },
    categoria_id: { type: DataTypes.INTEGER },
    nombre: { type: DataTypes.STRING(150), allowNull: false },
    descripcion: { type: DataTypes.STRING(300) },
    precio_compra: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
    precio_venta: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    stock_minimo: { type: DataTypes.INTEGER, defaultValue: 5 },
    estado: { type: DataTypes.STRING(10), defaultValue: 'activo' }
}, { tableName: 'productos', timestamps: true, createdAt: 'fecha_registro', updatedAt: false });

module.exports = Producto;
