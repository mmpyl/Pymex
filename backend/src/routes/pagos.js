
const router = require('express').Router();
const crypto = require('crypto');
const { verificarToken } = require('../middleware/auth');
const { Suscripcion, Empresa } = require('../models');

router.use(verificarToken);

router.post('/checkout', async (req, res) => {
  try {
    const empresaId = req.usuario.empresa_id;
    const { plan = 'pro', monto_mensual = 99.9, moneda = 'PEN', proveedor = 'mockpay' } = req.body;

    const referencia = `chk_${crypto.randomBytes(8).toString('hex')}`;

    const periodoInicio = new Date();
    const periodoFin = new Date(periodoInicio);
    periodoFin.setMonth(periodoFin.getMonth() + 1);

    const suscripcion = await Suscripcion.create({
      empresa_id: empresaId,
      plan,
      monto_mensual,
      moneda,
      estado: 'pendiente_pago',
      periodo_inicio: periodoInicio,
      periodo_fin: periodoFin,
      proveedor_pago: proveedor,
      referencia_pago: referencia
    });

    res.json({
      checkout_url: `https://pay.mock/${referencia}`,
      referencia,
      suscripcion_id: suscripcion.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const { referencia, status } = req.body;
    const suscripcion = await Suscripcion.findOne({ where: { referencia_pago: referencia } });
    if (!suscripcion) return res.status(404).json({ error: 'Suscripción no encontrada' });

    if (status === 'payment_succeeded') {
      await suscripcion.update({ estado: 'activa' });
      await Empresa.update({ estado: 'activo', plan: suscripcion.plan }, { where: { id: suscripcion.empresa_id } });
    }

    if (status === 'payment_failed') {
      await suscripcion.update({ estado: 'vencida' });
    }

    res.json({ mensaje: 'Webhook procesado' });
  } catch (error) {
    res.status(500).json({ error: error.message });

// backend/src/routes/pagos.js — versión corregida
// FIX: el modelo Pago v3 requiere fecha_vencimiento y usa estado 'pendiente' por defecto.
//      El webhook del modelo viejo usaba referencia_pago/periodo_fin del modelo Suscripcion
//      que ya no existe. Se reemplaza por el nuevo flujo de billingService.
// NOTA: el checkout y webhook Stripe reales están en routes/payments.js.
//       Este archivo sirve el flujo legacy mock para tests/desarrollo.

const router = require('express').Router();
const crypto = require('crypto');
const { verificarToken } = require('../middleware/auth');
const { Suscripcion, Empresa, Pago } = require('../models');

router.use(verificarToken);

// POST /api/pagos/checkout — genera un checkout mock (desarrollo)
router.post('/checkout', async (req, res) => {
  try {
    const empresaId = req.usuario.empresa_id;

    // Buscar suscripción activa o trial
    const suscripcion = await Suscripcion.findOne({
      where: {
        empresa_id: empresaId,
        estado:     { [require('sequelize').Op.in]: ['activa', 'trial'] }
      },
      order: [['fecha_inicio', 'DESC']]
    });

    if (!suscripcion) {
      return res.status(404).json({ error: 'No hay suscripción activa para generar checkout' });
    }

    const monto      = req.body.monto    || 99.9;
    const moneda     = req.body.moneda   || 'PEN';
    const referencia = `chk_${crypto.randomBytes(8).toString('hex')}`;

    // Fecha de vencimiento: 30 días desde hoy
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);

    // FIX: crear Pago con el modelo v3 (fecha_vencimiento requerida)
    const pago = await Pago.create({
      empresa_id:        empresaId,
      suscripcion_id:    suscripcion.id,
      monto,
      moneda,
      estado:            'pendiente',
      fecha_vencimiento: fechaVencimiento,
      referencia
    });

    return res.json({
      checkout_url:   `https://pay.mock/sapyme/${referencia}`,
      referencia,
      pago_id:        pago.id,
      suscripcion_id: suscripcion.id
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/pagos/webhook — webhook mock para desarrollo
router.post('/webhook', async (req, res) => {
  try {
    const { referencia, status } = req.body;

    const pago = await Pago.findOne({ where: { referencia } });
    if (!pago) return res.status(404).json({ error: 'Pago no encontrado' });

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
});

module.exports = router;
