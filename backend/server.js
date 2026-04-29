const app = require('./src/app');
const { sequelize } = require('./src/domains/core/models');
require('dotenv').config();
// Validar variables de entorno críticas antes de iniciar
require('./src/config/envValidator');

const PORT = process.env.PORT || 3000;

/**
 * Inicialización explícita de servicios
 * 
 * Esta función centraliza la inicialización de todos los servicios que requieren
 * configuración explícita (suscripciones a eventBus, relaciones cross-domain, etc.)
 */
const initializeServices = () => {
  // 1. Inicializar relaciones cross-domain entre dominios
  const coreModels = require('./src/domains/core/models');
  const authModels = require('./src/domains/auth/models');
  
  coreModels.initializeCrossDomainRelations();
  authModels.initializeCrossDomainRelations();
  
  // 2. Inicializar servicio de feature gate (suscripciones al eventBus)
  const featureGateService = require('./src/services/featureGateService');
  featureGateService.initialize();
  
  // 3. Inicializar servicio de email (suscripciones al eventBus y transporter)
  const emailService = require('./src/services/emailService');
  emailService.initialize();
};

async function iniciar() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a PostgreSQL');
        
        // Inicializar servicios explícitamente antes de empezar a aceptar requests
        initializeServices();
        console.log('✅ Servicios inicializados (featureGate, email, cross-domain relations)');
        
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error al conectar:', error.message);
    }
}

iniciar();
