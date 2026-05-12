// backend/src/services/billingService.js — versión corregida y migrada a dominios
// FIX: Suscripcion v3 no tiene 'estado: activa' para reactivar → se actualiza a 'activa'.
// FIX: Pago v3 usa 'creado_en' como timestamp (no 'fecha_creacion').
// FIX: El campo de búsqueda de pagos vencidos es fecha_vencimiento (correcto en v3).
// FIX: runBillingCollection suspende suscripciones por empresa_id, no por suscripcion_id.
// AÑADE: emailService para notificar a usuarios afectados.
// MIGRACIÓN: Imports separados por dominio (billingModels, coreModels)

const { Op } = require('sequelize');
const billingModels = require('../domains/billing/models');
const coreModels = require('../domains/core/models');
const eventBus = require('../domains/eventBus');

const { Suscripcion, Pago } = billingModels;
const { Empresa } = coreModels;
const { sequelize } = billingModels; // sequelize compartido

const sanitizePositiveInt = (value, fallback, { min = 1, max = 365 } = {}) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return fallback;
  if (parsed < min) return min;
  if (parsed > max) return max;
  return parsed;
};

const BILLING_GRACE_DAYS = sanitizePositiveInt(process.env.BILLING_GRACE_DAYS, 5);

// ─── applyPaymentAndReactivate ─────────────────────────────────────────────────
// Marca un pago como pagado y reactiva empresa + suscripción.
// Acepta una transacción externa (txExternal) para encadenarse con webhooks.
// Incluye retry logic con exponential backoff para manejar deadlocks/transient errors.
const applyPaymentAndReactivate = async (pagoId, referencia = null, txExternal = null) => {
  const pagoIdSafe = sanitizePositiveInt(pagoId, null, { min: 1, max: Number.MAX_SAFE_INTEGER });
  if (!pagoIdSafe) throw new Error('pagoId inválido');

  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const tx    = txExternal || await sequelize.transaction();
      const ownTx = !txExternal;

      try {
        const pago = await Pago.findByPk(pagoIdSafe, { transaction: tx });
        if (!pago) throw new Error(`Pago #${pagoIdSafe} no encontrado`);

        await pago.update({
          estado:     'pagado',
          fecha_pago: new Date(),
          referencia: referencia || pago.referencia
        }, { transaction: tx });

        // Reactivar empresa
        await Empresa.update(
          { estado: 'activo' },
          { where: { id: pago.empresa_id }, transaction: tx }
        );

        // Reactivar la suscripción asociada al pago
        await Suscripcion.update(
          { estado: 'activa' },
          { where: { id: pago.suscripcion_id }, transaction: tx }
        );

        if (ownTx) await tx.commit();
        
        // Publicar evento PAYMENT_COMPLETED
        eventBus.publish('PAYMENT_COMPLETED', {
          pago_id: pago.id,
          empresa_id: pago.empresa_id,
          suscripcion_id: pago.suscripcion_id,
          monto: pago.monto,
          moneda: pago.moneda,
          referencia: pago.referencia
        }, 'BILLING');
        
        return pago;
      } catch (error) {
        if (ownTx) await tx.rollback();
        throw error;
      }
    } catch (error) {
      attempt++;
      
      // Si es el último intento o no es un error transaccional, relanzar
      const isTransientError = 
        error.name === 'SequelizeDatabaseError' ||
        error.code === '40001' || // Serialization failure
        error.code === '40P01' || // Deadlock detected
        error.message.includes('deadlock') ||
        error.message.includes('transaction');
      
      if (attempt === MAX_RETRIES || !isTransientError) {
        throw error;
      }
      
      // Exponential backoff: 100ms, 200ms, 300ms...
      const delay = 100 * attempt;
      console.warn(`[billingService] Reintento ${attempt}/${MAX_RETRIES} para applyPaymentAndReactivate(${pagoId}). Esperando ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// ─── runBillingCollection ──────────────────────────────────────────────────────
// Proceso automático de cobranza:
//   1. Marca como 'vencido' los pagos 'pendiente' que superaron fecha_vencimiento.
//   2. Suspende empresas cuyos pagos llevan más de BILLING_GRACE_DAYS vencidos.
// Incluye retry logic para manejar errores transaccionales en procesos batch.
const runBillingCollection = async () => {
  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const now         = new Date();
      const graceCutoff = new Date(now);
      graceCutoff.setDate(graceCutoff.getDate() - BILLING_GRACE_DAYS);

      const tx = await sequelize.transaction();

      try {
        // Paso 1: marcar como vencidos los pendientes que ya pasaron su fecha
        const overdueRows = await Pago.findAll({
          where: {
            estado:            'pendiente',
            fecha_vencimiento: { [Op.lt]: now }
          },
          transaction: tx
        });

        const overdueIds = overdueRows.map(p => p.id);
        if (overdueIds.length) {
          await Pago.update(
            { estado: 'vencido' },
            { where: { id: { [Op.in]: overdueIds } }, transaction: tx }
          );
        }

        // Paso 2: suspender empresas con pagos vencidos > BILLING_GRACE_DAYS
        const hardOverdueRows = await Pago.findAll({
          where: {
            estado:            'vencido',
            fecha_vencimiento: { [Op.lt]: graceCutoff }
          },
          transaction: tx
        });

        const affectedEmpresas = [...new Set(hardOverdueRows.map(p => p.empresa_id))];

        if (affectedEmpresas.length) {
          await Empresa.update(
            { estado: 'suspendido' },
            { where: { id: { [Op.in]: affectedEmpresas } }, transaction: tx }
          );

          // FIX: suspender por empresa_id (no por id de suscripcion individual)
          await Suscripcion.update(
            { estado: 'suspendida' },
            {
              where: {
                empresa_id: { [Op.in]: affectedEmpresas },
                estado:     { [Op.in]: ['activa', 'trial'] }
              },
              transaction: tx
            }
          );
        }

        // OUTBOX PATTERN CRÍTICO: Publicar evento DENTRO de la transacción
        // Si el proceso muere antes del commit, el evento NO se persiste
        // Si el proceso muere después del commit pero antes de emitir, 
        // el outbox garantiza que el evento se entregue al reiniciar
        if (affectedEmpresas.length) {
          await eventBus.publish('SUBSCRIPTION_SUSPENDED', {
            empresa_ids: affectedEmpresas,
            motivo: 'pago_vencido',
            grace_days: BILLING_GRACE_DAYS
          }, 'BILLING', tx); // <-- Pasar la transacción para atomicidad
        }

        await tx.commit();

        // Intentar enviar emails de notificación (no bloquea si falla)
        if (affectedEmpresas.length) {
          try {
            const { emailPagoVencido } = require('../domains/shared-kernel/services/emailService');
            const authModels = require('../domains/auth/models');
            const { Usuario } = authModels;
            for (const empresaId of affectedEmpresas) {
              const admin = await Usuario.findOne({
                where: { empresa_id: empresaId, rol_id: 1, estado: 'activo' }
              });
              const pagoRef = hardOverdueRows.find(p => p.empresa_id === empresaId);
              if (admin && pagoRef) {
                await emailPagoVencido({
                  nombre:           admin.nombre,
                  email:            admin.email,
                  empresa:          `Empresa #${empresaId}`,
                  monto:            pagoRef.monto,
                  fechaVencimiento: pagoRef.fecha_vencimiento
                }).catch(() => {}); // silenciar errores de email
              }
            }
          } catch { /* emailService opcional */ }
        }

        return {
          vencidos_actualizados: overdueIds.length,
          empresas_suspendidas:  affectedEmpresas.length,
          grace_days:            BILLING_GRACE_DAYS,
          fecha_ejecucion:       now.toISOString()
        };
      } catch (error) {
        await tx.rollback();
        throw error;
      }
    } catch (error) {
      attempt++;
      
      // Si es el último intento o no es un error transaccional, relanzar
      const isTransientError = 
        error.name === 'SequelizeDatabaseError' ||
        error.code === '40001' || // Serialization failure
        error.code === '40P01' || // Deadlock detected
        error.message.includes('deadlock') ||
        error.message.includes('transaction');
      
      if (attempt === MAX_RETRIES || !isTransientError) {
        throw error;
      }
      
      // Exponential backoff: 500ms, 1000ms, 1500ms... (más tiempo para batch)
      const delay = 500 * attempt;
      console.warn(`[billingService] Reintento ${attempt}/${MAX_RETRIES} para runBillingCollection. Esperando ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

module.exports = { runBillingCollection, applyPaymentAndReactivate };
