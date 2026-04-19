const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comprobante = sequelize.define('Comprobante', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  empresa_id: { type: DataTypes.INTEGER, allowNull: false },
  venta_id: { type: DataTypes.INTEGER, allowNull: true },
  tipo: { type: DataTypes.STRING(10), allowNull: false },
  serie: { type: DataTypes.STRING(5), allowNull: false },
  correlativo: { type: DataTypes.INTEGER, allowNull: false },
  numero: { type: DataTypes.STRING(20), allowNull: false },
  ruc_cliente: { type: DataTypes.STRING(11), allowNull: true },
  razon_social: { type: DataTypes.STRING(200), allowNull: true },
  direccion: { type: DataTypes.STRING(300), allowNull: true },
  subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  igv: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  total: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  moneda: { type: DataTypes.STRING(3), defaultValue: 'PEN' },
  estado: { type: DataTypes.STRING(20), defaultValue: 'pendiente' },
  sunat_estado: { type: DataTypes.STRING(50), allowNull: true },
  sunat_descripcion: { type: DataTypes.TEXT, allowNull: true },
  xml_path: { type: DataTypes.STRING(300), allowNull: true },
  cdr_path: { type: DataTypes.STRING(300), allowNull: true },
  pdf_path: { type: DataTypes.STRING(300), allowNull: true },
  hash: { type: DataTypes.STRING(100), allowNull: true },
  fecha_envio: { type: DataTypes.DATE, allowNull: true },
  entorno: { type: DataTypes.STRING(15), defaultValue: 'beta' }
}, {
  tableName: 'comprobantes',
  timestamps: true,
  createdAt: 'fecha_emision',
  updatedAt: false
});

module.exports = Comprobante;
