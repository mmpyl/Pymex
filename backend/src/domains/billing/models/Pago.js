// backend/src/models/Pago.js
// FIX: conflicto de merge resuelto.
// Se elige la versión consistente con database.sql v3 y billingService.js:
//   - fecha_vencimiento requerida (billingService la necesita para calcular mora)
//   - estado: pendiente | pagado | vencido (no 'pagado' como default)
//   - sin campo 'metodo' ni 'registrado_por' (los del modelo viejo)
const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const Pago = sequelize.define('Pago', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  empresa_id: { type: DataTypes.INTEGER, allowNull: false },
  suscripcion_id: { type: DataTypes.INTEGER, allowNull: false },
  monto: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  moneda: { type: DataTypes.STRING(5), allowNull: false, defaultValue: 'PEN' },
  estado: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'pendiente' },
  // estados válidos: pendiente | pagado | vencido
  fecha_vencimiento: { type: DataTypes.DATE, allowNull: false },
  fecha_pago: { type: DataTypes.DATE, allowNull: true },
  referencia: { type: DataTypes.STRING(120), allowNull: true }
}, {
  tableName: 'pagos',
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: 'actualizado_en'
});

module.exports = Pago;
