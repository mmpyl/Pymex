/**
 * Índice del Dominio AUTH
 * 
 * Este archivo centraliza y exporta las interfaces públicas del dominio AUTH.
 * Otros dominios deben importar desde este punto para mantener los límites claros.
 */

// Interfaces públicas para comunicación entre dominios
const publicInterfaces = require('./interfaces/public');

// Controladores
const authController = require('./controllers/authController');
const rbacController = require('./controllers/rbacController');

// Servicios de aplicación (uso interno del dominio)
const authService = require('./services/authService');

// Rutas del dominio
const authRoutes = require('./routes/auth');
const rbacRoutes = require('./routes/rbac');

// Modelos (exportados para uso interno del dominio)
const models = require('./models');

module.exports = {
  // Interfaces públicas para otros dominios
  interfaces: {
    public: publicInterfaces
  },
  
  // Controladores
  controllers: {
    auth: authController,
    rbac: rbacController
  },
  
  // Servicios internos (solo uso dentro del dominio)
  services: {
    auth: authService
  },
  
  // Rutas del dominio
  routes: {
    auth: authRoutes,
    rbac: rbacRoutes
  },
  
  // Modelos del dominio
  models
};
