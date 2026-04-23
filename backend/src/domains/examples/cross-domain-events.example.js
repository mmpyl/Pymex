/**
 * CÓMO SUSCRIBIRSE A EVENTOS DE OTROS DOMINIOS
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Guía para implementar comunicación entre dominios usando Domain Events.
 * Basado en principios de Domain-Driven Design (DDD).
 * 
 * REGLAS IMPORTANTES:
 * 1. Los dominios NO pueden hacer JOINs directos entre tablas de otros dominios
 * 2. La comunicación debe ser asíncrona a través del EventBus
 * 3. Cada dominio debe declarar qué eventos consume en domainBoundaries.js
 */

// ═══════════════════════════════════════════════════════════════════════════════
// EJEMPLO 1: BILLING escucha ventas para tracking de límites
// ═══════════════════════════════════════════════════════════════════════════════

const { eventBus } = require('../eventBus');

/**
 * El dominio BILLING se suscribe al evento SALE_COMPLETED del dominio CORE
 * 
 * Parámetros de subscribe():
 * - 'SALE_COMPLETED': Nombre del evento a escuchar
 * - async (eventRecord) => {...}: Handler del evento
 * - 'BILLING': Dominio que se SUSCRIBE (quien escucha)
 */
eventBus.subscribe('SALE_COMPLETED', async (eventRecord) => {
  const { ventaId, empresaId, total } = eventRecord.payload;

  console.log(`[BILLING] Venta detectada: ${ventaId} - Empresa: ${empresaId} - Total: ${total}`);

  // Actualizar contadores de uso para verificar límites del plan
  await verificarLimiteVentas(empresaId, total);
  
  // Verificar si superó el umbral y emitir evento si es necesario
  const limiteSuperado = await verificarSiSuperoLimite(empresaId);
  if (limiteSuperado) {
    const { publish } = require('../eventBus');
    publish('USAGE_THRESHOLD_REACHED', { empresaId, tipo: 'ventas' }, 'BILLING');
  }
}, 'BILLING');

// ═══════════════════════════════════════════════════════════════════════════════
// EJEMPLO 2: ML escucha ventas para generar predicciones
// ═══════════════════════════════════════════════════════════════════════════════

eventBus.subscribe('SALE_COMPLETED', async (eventRecord) => {
  const { ventaId, empresaId, productos, total } = eventRecord.payload;

  console.log(`[ML] Nueva venta para análisis: ${ventaId}`);

  // Generar predicción de demanda basada en la venta
  await generarPrediccionDemanda(empresaId, productos);
  
  // Detectar anomalías en el patrón de compra
  await detectarAnomalia(empresaId, total);
}, 'ML');

// ═══════════════════════════════════════════════════════════════════════════════
// EJEMPLO 3: AUTH escucha suspensión de empresas
// ═══════════════════════════════════════════════════════════════════════════════

eventBus.subscribe('COMPANY_SUSPENDED', async (eventRecord) => {
  const { empresaId, motivo } = eventRecord.payload;

  console.log(`[AUTH] Empresa suspendida: ${empresaId} - Motivo: ${motivo}`);

  // Revocar tokens de acceso de la empresa suspendida
  await revocarTokensEmpresa(empresaId);
  
  // Notificar a usuarios activos
  await notificarUsuariosSuspendidos(empresaId);
}, 'AUTH');

// ═══════════════════════════════════════════════════════════════════════════════
// EJEMPLO 4: Suscribirse a TODOS los eventos de un dominio específico
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Suscribirse a todos los eventos del dominio BILLING
 * Útil para auditoría o logging centralizado
 */
eventBus.subscribeToDomain('BILLING', async (eventRecord) => {
  console.log(`[AUDIT] Evento de BILLING: ${eventRecord.event}`, eventRecord.payload);
  
  // Guardar en log de auditoría
  await guardarEnAuditoria(eventRecord);
}, 'CORE');

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN REQUERIDA EN domainBoundaries.js
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Para que un dominio pueda consumir eventos, debe estar configurado en:
 * backend/src/domains/domainBoundaries.js
 * 
 * Ejemplo de configuración para BILLING:
 * 
 * BILLING: {
 *   name: 'billing',
 *   // ... otras configuraciones
 *   events: {
 *     produced: ['SUBSCRIPTION_ACTIVATED', 'PAYMENT_COMPLETED', ...],
 *     consumed: ['COMPANY_CREATED', 'SALE_COMPLETED', 'USAGE_THRESHOLD_REACHED']
 *   }
 * }
 * 
 * Si el evento no está en la lista 'consumed', el EventBus rechazará el listener.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCIONES AUXILIARES DE EJEMPLO
// ═══════════════════════════════════════════════════════════════════════════════

async function verificarLimiteVentas(empresaId, total) {
  // Implementación real iría aquí
  console.log(`Verificando límite para empresa ${empresaId} con venta de ${total}`);
}

async function verificarSiSuperoLimite(empresaId) {
  // Implementación real iría aquí
  return false;
}

async function generarPrediccionDemanda(empresaId, productos) {
  // Implementación real iría aquí
  console.log(`Generando predicción para empresa ${empresaId}`);
}

async function detectarAnomalia(empresaId, total) {
  // Implementación real iría aquí
}

async function revocarTokensEmpresa(empresaId) {
  // Implementación real iría aquí
  console.log(`Revocando tokens para empresa ${empresaId}`);
}

async function notificarUsuariosSuspendidos(empresaId) {
  // Implementación real iría aquí
}

async function guardarEnAuditoria(eventRecord) {
  // Implementación real iría aquí
  console.log(`Guardando auditoría: ${eventRecord.id}`);
}

module.exports = {
  // Este archivo es principalmente de referencia/documentation
  // Las funciones auxiliares son solo ejemplos
};
