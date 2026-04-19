// backend/src/models/Rubro.js
// FIX: conflicto de merge resuelto.
// Se elige la versión consistente con database.sql v3:
//   - solo nombre UNIQUE + descripcion (sin codigo ni estado)
//   - coincide con los INSERT en database.sql v3 que no usan codigo
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rubro = sequelize.define('Rubro', {

  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  nombre: { type: DataTypes.STRING(80), allowNull: false },
  codigo: { type: DataTypes.STRING(30), allowNull: false, unique: true },
  descripcion: { type: DataTypes.STRING(300), allowNull: true },
  estado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
  tableName: 'rubros',
  timestamps: false
});

  nombre: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  descripcion: { type: DataTypes.STRING(300), allowNull: true }
}, { tableName: 'rubros', timestamps: false });


  id:          { type: DataTypes.INTEGER,     primaryKey: true, autoIncrement: true },
  nombre:      { type: DataTypes.STRING(100), allowNull: false, unique: true },
  descripcion: { type: DataTypes.STRING(300), allowNull: true }
}, {
  tableName:  'rubros',
  timestamps: false
});


module.exports = Rubro;
