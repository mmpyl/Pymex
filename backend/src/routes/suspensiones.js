// backend/src/routes/suspensiones.js — versión corregida
// FIX: el modelo Suscripcion v3 usa fecha_fin (no periodo_fin).
//      También se agrega BILLING_GRACE_DAYS para ser consistente con billingService.
// FIX: verificarRol importado del middleware corregido.

const router = require('express').Router();
const { Op } = require('sequelize');
const { verificarToken } = require('../middleware/auth');
const { verificarRol } = require('../middleware/roles');
const { Empresa, sequelize } = require('../domains/core/models');
const { Suscripcion } = require('../domains/billing/models');

router.use(verificarToken, verificarRol('admin', 'super_admin'));

router.post('/ejecutar', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const hoy = new Date();
    const graceDays = Number(process.env.BILLING_GRACE_DAYS || 0);
    // Con período de gracia: solo suspender si venció hace más de N días
    const corte = new Date(hoy);
    corte.setDate(corte.getDate() - graceDays);

    // FIX: campo correcto es fecha_fin (no periodo_fin)
    const vencidas = await Suscripcion.findAll({
      where: {
        estado: { [Op.in]: ['activa', 'trial'] },
        fecha_fin: { [Op.lt]: corte }
      },
      transaction: t
    });

    let totalSuspendidas = 0;
    for (const suscripcion of vencidas) {
      await suscripcion.update({ estado: 'suspendida' }, { transaction: t });
      await Empresa.update(
        { estado: 'suspendido' },
        { where: { id: suscripcion.empresa_id }, transaction: t }
      );
      totalSuspendidas += 1;
    }

    await t.commit();

    return res.json({
      mensaje: 'Suspensión automática ejecutada',
      total_suspendidas: totalSuspendidas,
      grace_days: graceDays,
      fecha_ejecucion: hoy.toISOString()
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
