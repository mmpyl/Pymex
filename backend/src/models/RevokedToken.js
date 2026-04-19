const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RevokedToken = sequelize.define('RevokedToken', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  token_hash: { type: DataTypes.STRING(128), allowNull: false, unique: true },
  token_type: { type: DataTypes.STRING(20), allowNull: false },
  revoked_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  expires_at: { type: DataTypes.DATE, allowNull: false }
}, { tableName: 'revoked_tokens', timestamps: false });

module.exports = RevokedToken;
