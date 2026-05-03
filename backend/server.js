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
        
        // Sincronizar base de datos (crear tablas si no existen) - solo en desarrollo
        if (process.env.NODE_ENV !== 'production') {
            console.log('🔄 Sincronizando modelos con la base de datos...');
            await sequelize.sync({ force: false, alter: true });
            console.log('✅ Modelos sincronizados correctamente');
            
            // Insertar datos de prueba si las tablas están vacías
            await seedDatabase();
        }
        
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error al conectar:', error.message);
    }
}

/**
 * Inserta datos de prueba en la base de datos si está vacía
 */
async function seedDatabase() {
    const { Rubro, EmpresaRubro, AuditLog } = require('./src/domains/core/models');
    const { Feature } = require('./src/domains/billing/models');
    
    try {
        // Verificar si ya hay rubros
        const rubrosCount = await Rubro.count();
        if (rubrosCount === 0) {
            console.log('📦 Insertando datos de prueba...');
            
            // Crear rubros de ejemplo
            await Rubro.bulkCreate([
                { nombre: 'Restaurante', descripcion: 'Empresas de comida y bebidas' },
                { nombre: 'Retail', descripcion: 'Tiendas y comercio minorista' },
                { nombre: 'Servicios', descripcion: 'Empresas de servicios profesionales' },
                { nombre: 'Manufactura', descripcion: 'Empresas de producción industrial' },
                { nombre: 'Salud', descripcion: 'Clínicas y centros médicos' }
            ]);
            console.log('✅ Rubros creados');
            
            // Crear features de ejemplo
            const featuresCount = await Feature.count();
            if (featuresCount === 0) {
                await Feature.bulkCreate([
                    { nombre: 'inventario_basico', descripcion: 'Gestión básica de inventario' },
                    { nombre: 'ventas_avanzadas', descripcion: 'Módulo avanzado de ventas' },
                    { nombre: 'reportes_pdf', descripcion: 'Generación de reportes en PDF' },
                    { nombre: 'multi_usuario', descripcion: 'Múltiples usuarios por empresa' },
                    { nombre: 'api_access', descripcion: 'Acceso a API REST' }
                ]);
                console.log('✅ Features creados');
            }
            
            // Crear relación Rubro-Feature para cada rubro
            const rubros = await Rubro.findAll();
            const features = await Feature.findAll();
            
            if (rubros.length > 0 && features.length > 0) {
                // Asignar todos los features a cada rubro (ejemplo)
                for (const rubro of rubros) {
                    await rubro.addFeatures(features);
                }
                console.log('✅ Relaciones Rubro-Feature creadas');
            }
            
            console.log('🎉 Datos de prueba insertados exitosamente');
        }
    } catch (error) {
        console.warn('⚠️ No se pudieron insertar datos de prueba:', error.message);
    }
}

iniciar();
