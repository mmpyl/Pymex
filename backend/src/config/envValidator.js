// backend/src/config/envValidator.js
// Validador de variables de entorno críticas al inicio del servidor
// Previene fallos en runtime por configuración incompleta

const logger = require('../utils/logger');
const requiredEnvVars = {
  // Base de datos
  DB_HOST: 'Host de la base de datos PostgreSQL',
  DB_USER: 'Usuario de la base de datos',
  DB_PASSWORD: 'Contraseña de la base de datos (debe tener mínimo 16 caracteres)',
  DB_NAME: 'Nombre de la base de datos',
  
  // Seguridad
  JWT_SECRET: 'Secreto JWT (mínimo 32 caracteres,推荐使用 256+ bits)',
  
  // Entorno
  NODE_ENV: 'Entorno de ejecución (development/production)'
};

const recommendedEnvVars = {
  REDIS_HOST: 'Host de Redis para blacklist de tokens y caché',
  REDIS_PASSWORD: 'Contraseña de Redis',
  CORS_ALLOWED_ORIGINS: 'Orígenes permitidos para CORS',
  APP_URL: 'URL pública de la aplicación',
  REQUIRE_HTTPS: 'Forzar HTTPS en producción (true/false)',
  
  // Email
  EMAIL_HOST: 'Servidor SMTP para emails transaccionales',
  EMAIL_USER: 'Usuario SMTP',
  EMAIL_PASS: 'Contraseña SMTP',
  EMAIL_FROM: 'Remitente por defecto para emails',
  
  // Microservicios
  ML_SERVICE_URL: 'URL del servicio de Machine Learning',
  FACTURACION_SERVICE_URL: 'URL del servicio de facturación electrónica',
  
  // Pagos
  STRIPE_SECRET_KEY: 'Clave secreta de Stripe',
  STRIPE_WEBHOOK_SECRET: 'Secreto para webhooks de Stripe'
};

const validateEnv = () => {
  // Saltar validación en entorno de tests
  if (process.env.NODE_ENV === 'test') {
    return {
      missingRequired: [],
      missingRecommended: [],
      warnings: []
    };
  }

  const missingRequired = [];
  const missingRecommended = [];
  const warnings = [];

  // Validar variables requeridas
  for (const [varName, description] of Object.entries(requiredEnvVars)) {
    if (!process.env[varName]) {
      missingRequired.push(`${varName} - ${description}`);
    }
  }

  // Validar variables recomendadas (solo warning)
  for (const [varName, description] of Object.entries(recommendedEnvVars)) {
    if (!process.env[varName]) {
      missingRecommended.push(`${varName} - ${description}`);
    }
  }

  // Validaciones específicas
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    warnings.push('⚠️ JWT_SECRET debería tener al menos 32 caracteres para seguridad óptima');
  }

  if (process.env.DB_PASSWORD && process.env.DB_PASSWORD.length < 16) {
    warnings.push('⚠️ DB_PASSWORD debería tener al menos 16 caracteres');
  }

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.REQUIRE_HTTPS || process.env.REQUIRE_HTTPS !== 'true') {
      warnings.push('⚠️ En producción se recomienda REQUIRE_HTTPS=true');
    }
    if (!process.env.REDIS_HOST) {
      warnings.push('⚠️ En producción es altamente recomendado configurar Redis');
    }
  }

  // Reportar resultados
  if (missingRequired.length > 0) {
    logger.error('Variables de entorno requeridas faltantes', { component: 'envValidator', event: 'validation_error', missing: missingRequired });
    console.error('\n❌ ERROR: Variables de entorno requeridas faltantes:\n');
    missingRequired.forEach(msg => console.error(`  • ${msg}`));
    console.error('\nPor favor configura estas variables antes de iniciar el servidor.\n');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️ ADVERTENCIAS DE CONFIGURACIÓN:\n');
    logger.warn('Advertencias de configuración', { component: 'envValidator', event: 'validation_warning', warnings });
    warnings.forEach(warn => console.warn(`  ${warn}`));
    console.warn('');
  }

  if (missingRecommended.length > 0 && process.env.NODE_ENV === 'development') {
    console.log('\n💡 SUGERENCIA: Las siguientes variables de entorno no están configuradas (opcionales):\n');
    logger.info('Variables de entorno opcionales no configuradas', { component: 'envValidator', event: 'validation_info', missing: missingRecommended });
    missingRecommended.forEach(msg => console.log(`  • ${msg}`));
    console.log('');
  }

  console.log('✅ Validación de variables de entorno completada exitosamente\n');
  logger.info('Validación de variables de entorno completada exitosamente', { component: 'envValidator', event: 'validation_success' });
  
  return {
    missingRequired,
    missingRecommended,
    warnings
  };
};

// Ejecutar validación inmediatamente al importar
validateEnv();

module.exports = { validateEnv, requiredEnvVars, recommendedEnvVars };
