/**
 * Worker de Procesamiento de Eventos - Outbox Pattern
 * 
 * Este worker se encarga de procesar eventos pendientes desde la tabla
 * domain_events (Outbox Pattern). Debe ejecutarse continuamente para
 * garantizar que los eventos persistidos sean entregados a los suscriptores.
 * 
 * USO:
 *   node src/workers/eventProcessor.js
 * 
 * El worker:
 * 1. Procesa eventos pendientes cada N segundos
 * 2. Reintenta eventos fallidos con backoff exponencial
 * 3. Limpia eventos antiguos periódicamente
 */

const eventBus = require('../domains/eventBus');
const { sequelize } = require('../domains/billing/models');

// Configuración
const PROCESS_INTERVAL_MS = parseInt(process.env.EVENT_PROCESS_INTERVAL_MS) || 5000; // 5 segundos
const CLEANUP_INTERVAL_MS = parseInt(process.env.EVENT_CLEANUP_INTERVAL_MS) || 3600000; // 1 hora
const EVENTS_PER_BATCH = parseInt(process.env.EVENTS_PER_BATCH) || 100;
const DAYS_TO_KEEP_EVENTS = parseInt(process.env.DAYS_TO_KEEP_EVENTS) || 30;

let isRunning = false;
let processInterval = null;
let cleanupInterval = null;

/**
 * Procesa un batch de eventos pendientes
 */
async function processBatch() {
  if (isRunning) {
    console.log('[EventWorker] Batch anterior aún en ejecución, saltando...');
    return;
  }

  isRunning = true;

  try {
    const result = await eventBus.processPendingEvents(EVENTS_PER_BATCH);
    
    if (result.total > 0) {
      console.log(`[EventWorker] Procesados: ${result.delivered} entregados, ${result.failed} fallidos de ${result.total} eventos`);
    }
  } catch (error) {
    console.error('[EventWorker] Error procesando batch:', error.message);
  } finally {
    isRunning = false;
  }
}

/**
 * Limpia eventos antiguos
 */
async function runCleanup() {
  try {
    await eventBus.cleanupOldEvents(DAYS_TO_KEEP_EVENTS);
  } catch (error) {
    console.error('[EventWorker] Error limpiando eventos:', error.message);
  }
}

/**
 * Inicia el worker de procesamiento de eventos
 */
async function start() {
  console.log('[EventWorker] Iniciando worker de procesamiento de eventos...');
  console.log(`[EventWorker] Configuración:`);
  console.log(`  - Intervalo de proceso: ${PROCESS_INTERVAL_MS}ms`);
  console.log(`  - Intervalo de limpieza: ${CLEANUP_INTERVAL_MS}ms`);
  console.log(`  - Eventos por batch: ${EVENTS_PER_BATCH}`);
  console.log(`  - Días a mantener: ${DAYS_TO_KEEP_EVENTS}`);

  // Verificar conexión a DB
  try {
    await sequelize.authenticate();
    console.log('[EventWorker] ✅ Conectado a PostgreSQL');
  } catch (error) {
    console.error('[EventWorker] ❌ Error conectando a PostgreSQL:', error.message);
    process.exit(1);
  }

  // Procesar eventos pendientes inmediatamente al iniciar
  console.log('[EventWorker] Procesando eventos pendientes acumulados...');
  await processBatch();

  // Iniciar intervalos
  processInterval = setInterval(processBatch, PROCESS_INTERVAL_MS);
  cleanupInterval = setInterval(runCleanup, CLEANUP_INTERVAL_MS);

  console.log('[EventWorker] Worker iniciado exitosamente');
}

/**
 * Detiene el worker gracefulmente
 */
function stop() {
  console.log('[EventWorker] Deteniendo worker...');
  
  if (processInterval) {
    clearInterval(processInterval);
    processInterval = null;
  }
  
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }

  console.log('[EventWorker] Worker detenido');
}

// Manejo de señales para shutdown graceful
process.on('SIGTERM', () => {
  console.log('[EventWorker] Señal SIGTERM recibida');
  stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[EventWorker] Señal SIGINT recibida');
  stop();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('[EventWorker] Excepción no capturada:', error);
  // No salir inmediatamente, intentar continuar
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[EventWorker] Promesa rechazada no manejada:', reason);
  // No salir inmediatamente, intentar continuar
});

// Iniciar si este es el script principal
if (require.main === module) {
  start().catch((error) => {
    console.error('[EventWorker] Error fatal al iniciar:', error);
    process.exit(1);
  });
}

module.exports = { start, stop, processBatch, runCleanup };
