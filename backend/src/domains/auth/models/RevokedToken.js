const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const RevokedToken = sequelize.define('RevokedToken', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { 
    type: DataTypes.INTEGER, 
    allowNull: true,
    comment: 'ID del usuario o admin propietario del token'
  },
  user_type: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'empresa',
    comment: 'Tipo de usuario: empresa o admin'
  },
  token_hash: { type: DataTypes.STRING(128), allowNull: false, unique: true },
  token_type: { 
    type: DataTypes.STRING(20), 
    allowNull: false,
    comment: 'Tipo de token: refresh, refresh_admin, access (revocado)'
  },
  revoked_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  expires_at: { type: DataTypes.DATE, allowNull: false },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Metadatos adicionales: email, ip, user_agent, etc.'
  }
}, { 
  tableName: 'revoked_tokens', 
  timestamps: false,
  indexes: [
    { fields: ['token_hash'] },
    { fields: ['user_id', 'token_type'] },
    { fields: ['expires_at'] }
  ]
});

module.exports = RevokedToken;
