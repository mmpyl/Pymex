/**
 * Índice de Modelos del Dominio ML
 * 
 * Este archivo centraliza los modelos que pertenecen al dominio ML,
 * responsable de predicciones, modelos de machine learning y análisis predictivo.
 * 
 * REGLAS:
 * - Solo los modelos del dominio ML deben importarse aquí
 * - Las relaciones entre modelos del mismo dominio están permitidas
 * - NO se permiten relaciones directas con modelos de otros dominios
 * - Este dominio es principalmente de LECTURA sobre datos históricos del dominio CORE
 */

const sequelize = require('../../config/database');

// Importación de modelos del dominio ML
// Nota: El modelo Prediccion ya existe en la base de datos
// Los modelos ModeloML y Entrenamiento son propuestas para futura implementación

// Intentar importar el modelo Prediccion si existe
let Prediccion;
try {
  Prediccion = require('./Prediccion');
} catch (e) {
  // El modelo no existe aún, se puede crear posteriormente
  console.log('[ML Domain] Modelo Prediccion no encontrado, se puede agregar posteriormente');
}

// ═══════════════════════════════════════════════════════════════════════════════
// RELACIONES DENTRO DEL DOMINIO ML
// ═══════════════════════════════════════════════════════════════════════════════

// Nota: Las relaciones con Producto y Empresa (del dominio CORE) se manejan
// como referencias externas (producto_id, empresa_id) sin relaciones directas
// de Sequelize para mantener los límites del dominio.

// Futuras relaciones internas del dominio ML:
// - Prediccion.belongsTo(ModeloML)
// - ModeloML.hasMany(Entrenamiento)
// Estas relaciones se implementarán cuando se creen los modelos correspondientes.

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTACIÓN
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  sequelize,
  // Modelos actuales
  ...(Prediccion && { Prediccion }),
  // Modelos futuros (placeholders)
  // ModeloML,
  // Entrenamiento
};

// Alias para compatibilidad con código legacy
module.exports.default = module.exports;
