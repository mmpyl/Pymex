const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaymentEvent = sequelize.define('PaymentEvent', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  proveedor: { type: DataTypes.STRING(30), allowNull: false },
  event_id: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  tipo: { type: DataTypes.STRING(80), allowNull: false },
  payload: { type: DataTypes.JSONB, allowNull: false },
  procesado_en: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, { tableName: 'payment_events', timestamps: false });

module.exports = PaymentEvent;
