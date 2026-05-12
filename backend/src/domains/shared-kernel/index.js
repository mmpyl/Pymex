/**
 * Shared Kernel Domain
 * 
 * Este dominio contiene servicios y utilidades compartidos entre múltiples dominios.
 * Según DDD, el Shared Kernel es un conjunto de modelos, servicios y lógica que
 * es compartido por varios bounded contexts.
 * 
 * Responsabilidades:
 * - EmailService: Servicio transversal de notificaciones por email
 * - Otros servicios compartidos futuros (logging, auditoría transversal, etc.)
 * 
 * Reglas:
 * - NO puede depender de otros dominios específicos (AUTH, BILLING, CORE, ML)
 * - Solo puede depender de infraestructura base (database, redis, eventBus)
 * - Es dependido por múltiples dominios
 */

const services = {
  emailService: require('./services/emailService')
};

module.exports = {
  services
};
