// backend/src/services/billingService.js — versión corregida
// FIX: Suscripcion v3 no tiene 'estado: activa' para reactivar → se actualiza a 'activa'.
// FIX: Pago v3 usa 'creado_en' como timestamp (no 'fecha_creacion').
// FIX: El campo de búsqueda de pagos vencidos es fecha_vencimiento (correcto en v3).
// FIX: runBillingCollection suspende suscripciones por empresa_id, no por suscripcion_id.
// AÑADE: emailService para notificar a usuarios afectados.

const { Op }    = require('sequelize');
const { Empresa, Suscripcion, Pago, sequelize } = require('../models');

const BILLING_GRACE_DAYS = Number(process.env.BILLING_GRACE_DAYS || 5);

// ─── applyPaymentAndReactivate ─────────────────────────────────────────────────
// Marca un pago como pagado y reactiva empresa + suscripción.
// Acepta una transacción externa (txExternal) para encadenarse con webhooks.
const applyPaymentAndReactivate = async (pagoId, referencia = null, txExternal = null) => {
  const tx    = txExternal || await sequelize.transaction();
  const ownTx = !txExternal;

  try {
    const pago = await Pago.findByPk(pagoId, { transaction: tx });
    if (!pago) throw new Error(`Pago #${pagoId} no encontrado`);

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
    return pago;
  } catch (error) {
    if (ownTx) await tx.rollback();
    throw error;
  }
};

// ─── runBillingCollection ──────────────────────────────────────────────────────
// Proceso automático de cobranza:
//   1. Marca como 'vencido' los pagos 'pendiente' que superaron fecha_vencimiento.
//   2. Suspende empresas cuyos pagos llevan más de BILLING_GRACE_DAYS vencidos.
const runBillingCollection = async () => {
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

    await tx.commit();

    // Intentar enviar emails de notificación (no bloquea si falla)
    if (affectedEmpresas.length) {
      try {
        const { emailPagoVencido } = require('./emailService');
        const { Usuario }          = require('../models');
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
};

module.exports = { runBillingCollection, applyPaymentAndReactivate };
