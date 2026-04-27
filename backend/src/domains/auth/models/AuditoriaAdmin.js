const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditoriaAdmin = sequelize.define('AuditoriaAdmin', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  admin_usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  accion: { type: DataTypes.STRING(120), allowNull: false },
  entidad: { type: DataTypes.STRING(60), allowNull: false },
  entidad_id: { type: DataTypes.INTEGER },
  detalles: { type: DataTypes.JSONB },
  ip: { type: DataTypes.STRING(64) }
}, { tableName: 'auditoria_admin', timestamps: true, createdAt: 'creado_en', updatedAt: false });

module.exports = AuditoriaAdmin;
