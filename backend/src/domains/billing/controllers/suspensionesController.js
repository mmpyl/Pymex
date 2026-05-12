/**
 * Controlador de Suspensiones - Dominio BILLING
 * 
 * Maneja las operaciones relacionadas con suspensión automática
 * de empresas y suscripciones por pagos vencidos.
 */

const { Op } = require('sequelize');
const { Empresa, sequelize } = require('../../core/models');
const { Suscripcion } = require('../models');

class SuspensionesController {
  /**
   * POST /api/suspensiones/ejecutar
   * Ejecuta el proceso de suspensión automática de empresas con pagos vencidos
   */
  async ejecutarSuspension(req, res, next) {
    const t = await sequelize.transaction();
    
    try {
      const hoy = new Date();
      const graceDays = Number(process.env.BILLING_GRACE_DAYS || 0);
      
      // Con período de gracia: solo suspender si venció hace más de N días
      const corte = new Date(hoy);
      corte.setDate(corte.getDate() - graceDays);

      // Buscar suscripciones activas/trial vencidas
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
  }
}

module.exports = new SuspensionesController();
