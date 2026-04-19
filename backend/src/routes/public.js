const router = require('express').Router();
const { verificarApiKey } = require('../middleware/apiKey');
const { Comprobante } = require('../models');

router.use(verificarApiKey);

router.get('/v1/comprobantes', async (req, res) => {
  try {
    const empresaId = req.apiKey.empresa_id;
    const limit = Math.min(Number(req.query.limit || 50), 200);

    const comprobantes = await Comprobante.findAll({
      where: { empresa_id: empresaId },
      order: [['fecha_emision', 'DESC']],
      limit,
      attributes: ['id', 'tipo', 'serie', 'correlativo', 'numero', 'total', 'moneda', 'estado', 'fecha_emision']
    });

    res.json({ data: comprobantes, total: comprobantes.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
