const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

/**
 * PaymentEvent - Modelo para almacenar eventos de Stripe
 * 
 * Este modelo almacena todos los eventos recibidos desde Stripe,
 * permitiendo idempotencia y auditoría de eventos.
 */
const PaymentEvent = sequelize.define('PaymentEvent', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  proveedor: { 
    type: DataTypes.STRING(30), 
    allowNull: false,
    comment: 'Proveedor del evento (stripe, mock, etc.)'
  },
  event_id: { 
    type: DataTypes.STRING(120), 
    allowNull: false, 
    unique: true,
    comment: 'ID único del evento proporcionado por el proveedor'
  },
  tipo: { 
    type: DataTypes.STRING(80), 
    allowNull: false,
    comment: 'Tipo de evento (checkout.session.completed, payment_intent.succeeded, etc.)'
  },
  payload: { 
    type: DataTypes.JSONB, 
    allowNull: false,
    comment: 'Payload completo del evento'
  },
  procesado_en: { 
    type: DataTypes.DATE, 
    allowNull: false, 
    defaultValue: DataTypes.NOW,
    comment: 'Fecha de procesamiento del evento'
  }
}, { 
  tableName: 'payment_events', 
  timestamps: false,
  indexes: [
    { fields: ['event_id'], unique: true },
    { fields: ['tipo'] },
    { fields: ['proveedor'] },
    { fields: ['procesado_en'] }
  ]
});

module.exports = PaymentEvent;
