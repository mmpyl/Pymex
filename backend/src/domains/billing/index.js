/**
 * Índice del Dominio BILLING
 * 
 * Este archivo centraliza y exporta las interfaces públicas del dominio BILLING.
 * Otros dominios deben importar desde este punto para mantener los límites claros.
 */

// Interfaces públicas para comunicación entre dominios
const publicInterfaces = require('./interfaces/public');

// Servicios de aplicación (uso interno del dominio)
const comprobanteService = require('./services/comprobanteService');
const billingService = require('./services/billingService');
const featureGateService = require('./services/featureGateService');

// Controladores
const comprobantePublicController = require('./controllers/comprobantePublicController');
const facturacionController = require('./controllers/facturacionController');
const saasController = require('./controllers/saasController');
const pagosController = require('./controllers/pagosController');
const featuresController = require('./controllers/featuresController');
const suspensionesController = require('./controllers/suspensionesController');

// Rutas
const facturacionRoutes = require('./routes/facturacion');
const saasRoutes = require('./routes/saas');
const pagosRoutes = require('./routes/pagos');
const featuresRoutes = require('./routes/features');
const suspensionesRoutes = require('./routes/suspensiones');

module.exports = {
  // Interfaces públicas para otros dominios
  interfaces: {
    public: publicInterfaces
  },
  
  // Servicios internos (solo uso dentro del dominio)
  services: {
    comprobante: comprobanteService,
    billing: billingService,
    featureGate: featureGateService
  },
  
  // Controladores
  controllers: {
    comprobantePublic: comprobantePublicController,
    facturacion: facturacionController,
    saas: saasController,
    pagos: pagosController,
    features: featuresController,
    suspensiones: suspensionesController
  },
  
  // Rutas
  routes: {
    facturacion: facturacionRoutes,
    saas: saasRoutes,
    pagos: pagosRoutes,
    features: featuresRoutes,
    suspensiones: suspensionesRoutes
  }
};
