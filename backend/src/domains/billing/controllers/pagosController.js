/**
 * Controlador de Pagos - Dominio BILLING
 * 
 * Maneja las operaciones relacionadas con pagos, checkout y webhooks.
 * NOTA: el checkout y webhook Stripe reales están en routes/payments.js.
 * Este archivo sirve el flujo legacy mock para tests/desarrollo.
 */

const crypto = require('crypto');
const { Op } = require('sequelize');
const { Empresa } = require('../../core/models');
const { Suscripcion, Pago } = require('../models');

class PagosController {
  /**
   * POST /api/pagos/checkout
   * Genera un checkout mock (desarrollo)
   */
  async crearCheckout(req, res, next) {
    try {
      const empresaId = req.usuario.empresa_id;

      // Buscar suscripción activa o trial
      const suscripcion = await Suscripcion.findOne({
        where: {
          empresa_id: empresaId,
          estado: { [Op.in]: ['activa', 'trial'] }
        },
        order: [['fecha_inicio', 'DESC']]
      });

      if (!suscripcion) {
        return res.status(404).json({ error: 'No hay suscripción activa para generar checkout' });
      }

      const monto = req.body.monto || 99.9;
      const moneda = req.body.moneda || 'PEN';
      const referencia = `chk_${crypto.randomBytes(8).toString('hex')}`;

      // Fecha de vencimiento: 30 días desde hoy
      const fechaVencimiento = new Date();
      fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);

      // Crear Pago con fecha_vencimiento requerida
      const pago = await Pago.create({
        empresa_id: empresaId,
        suscripcion_id: suscripcion.id,
        monto,
        moneda,
        estado: 'pendiente',
        fecha_vencimiento: fechaVencimiento,
        referencia
      });

      return res.json({
        checkout_url: `https://pay.mock/sapyme/${referencia}`,
        referencia,
        pago_id: pago.id,
        suscripcion_id: suscripcion.id
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/pagos/webhook
   * Webhook mock para desarrollo
   */
  async procesarWebhook(req, res, next) {
    try {
      const { referencia, status } = req.body;

      const pago = await Pago.findOne({ where: { referencia } });
      if (!pago) {
        return res.status(404).json({ error: 'Pago no encontrado' });
      }

      if (status === 'payment_succeeded') {
        await pago.update({ estado: 'pagado', fecha_pago: new Date() });
        
        // Reactivar empresa y suscripción
        await Empresa.update(
          { estado: 'activo' },
          { where: { id: pago.empresa_id } }
        );
        await Suscripcion.update(
          { estado: 'activa' },
          { where: { id: pago.suscripcion_id } }
        );
      }

      if (status === 'payment_failed') {
        await pago.update({ estado: 'vencido' });
      }

      return res.json({ mensaje: 'Webhook procesado', pago_id: pago.id });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new PagosController();
