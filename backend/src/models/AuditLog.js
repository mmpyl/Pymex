const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  empresa_id: { type: DataTypes.INTEGER, allowNull: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: true },
  metodo: { type: DataTypes.STRING(10), allowNull: false },
  ruta: { type: DataTypes.STRING(255), allowNull: false },
  estado_http: { type: DataTypes.INTEGER, allowNull: false },
  ip: { type: DataTypes.STRING(64), allowNull: true },
  user_agent: { type: DataTypes.STRING(300), allowNull: true },
  request_id: { type: DataTypes.STRING(64), allowNull: true },
  metadata: { type: DataTypes.JSONB, allowNull: true }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  createdAt: 'fecha',
  updatedAt: false
});

module.exports = AuditLog;
