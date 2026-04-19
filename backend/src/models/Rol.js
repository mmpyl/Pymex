// backend/src/models/Rol.js
// FIX: conflicto de merge resuelto.
// Se añade campo descripcion (presente en database.sql) para evitar errores
// al hacer include de Rol con todos sus campos.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rol = sequelize.define('Rol', {

  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  nombre: { type: DataTypes.STRING(50), allowNull: false }
}, {
  tableName: 'roles',
  timestamps: false
});

  nombre: { type: DataTypes.STRING(50), allowNull: false },
  descripcion: { type: DataTypes.STRING(200) }
}, { tableName: 'roles', timestamps: false });


  id:          { type: DataTypes.INTEGER,     primaryKey: true, autoIncrement: true },
  nombre:      { type: DataTypes.STRING(50),  allowNull: false },
  descripcion: { type: DataTypes.STRING(200), allowNull: true }
}, {
  tableName:  'roles',
  timestamps: false
});


module.exports = Rol;
