const coreModels = require('../domains/core/models');

const { Alerta, Producto, Venta, sequelize } = coreModels;
const { Op } = require('sequelize');

// Genera alertas automáticas y las guarda en BD
const generarAlertas = async (empresa_id) => {
  const alertasNuevas = [];

  // 1. Productos con stock bajo
  const productosStockBajo = await Producto.findAll({
    where: {
      empresa_id,
      estado: 'activo',
      stock: { [Op.lte]: sequelize.col('stock_minimo') }
    }
  });

  for (const p of productosStockBajo) {
    const yaExiste = await Alerta.findOne({
      where: {
        empresa_id,
        tipo: 'stock_bajo',
        mensaje: { [Op.like]: `%${p.nombre}%` },
        leido: false
      }
    });
    if (!yaExiste) {
      alertasNuevas.push({
        empresa_id,
        tipo: 'stock_bajo',
        mensaje: `Stock bajo: "${p.nombre}" tiene ${p.stock} unidades (mínimo: ${p.stock_minimo})`
      });
    }
  }

  // 2. Ventas bajas este mes vs mes anterior
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
  const finMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0);

  const ventasMes = await Venta.sum('total', {
    where: { empresa_id, fecha: { [Op.gte]: inicioMes } }
  }) || 0;

  const ventasMesAnterior = await Venta.sum('total', {
    where: { empresa_id, fecha: { [Op.between]: [inicioMesAnterior, finMesAnterior] } }
  }) || 0;

  if (ventasMesAnterior > 0 && ventasMes < ventasMesAnterior * 0.7) {
    const yaExiste = await Alerta.findOne({
      where: { empresa_id, tipo: 'ventas_bajas', leido: false }
    });
    if (!yaExiste) {
      alertasNuevas.push({
        empresa_id,
        tipo: 'ventas_bajas',
        mensaje: `Las ventas de este mes (S/ ${ventasMes.toFixed(2)}) están 30% por debajo del mes anterior (S/ ${ventasMesAnterior.toFixed(2)})`
      });
    }
  }

  // Guardar alertas nuevas
  if (alertasNuevas.length > 0) {
    await Alerta.bulkCreate(alertasNuevas);
  }

  return alertasNuevas.length;
};

const listar = async (req, res) => {
  try {
    await generarAlertas(req.usuario.empresa_id);
    const alertas = await Alerta.findAll({
      where: { empresa_id: req.usuario.empresa_id },
      order: [['fecha', 'DESC']],
      limit: 50
    });
    res.json(alertas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const marcarLeido = async (req, res) => {
  try {
    await Alerta.update(
      { leido: true },
      { where: { id: req.params.id, empresa_id: req.usuario.empresa_id } }
    );
    res.json({ mensaje: 'Alerta marcada como leída' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const marcarTodasLeidas = async (req, res) => {
  try {
    await Alerta.update(
      { leido: true },
      { where: { empresa_id: req.usuario.empresa_id, leido: false } }
    );
    res.json({ mensaje: 'Todas las alertas marcadas como leídas' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const sinLeer = async (req, res) => {
  try {
    const count = await Alerta.count({
      where: { empresa_id: req.usuario.empresa_id, leido: false }
    });
    res.json({ sin_leer: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { listar, marcarLeido, marcarTodasLeidas, sinLeer, generarAlertas };
