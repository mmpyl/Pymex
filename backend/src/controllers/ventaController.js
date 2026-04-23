// backend/src/controllers/ventaController.js
// FIXES:
//   - Added missing Op import from sequelize
//   - Removed all duplicate variable declarations and unreachable code
//   - Stock validation uses atomic decrement with WHERE stock >= cantidad
//   - Single clean flow with proper transaction rollback

const { Op } = require('sequelize');
const coreModels = require('../domains/core/models');

const { Venta, DetalleVenta, Producto, Cliente, sequelize } = coreModels;

const listar = async (req, res) => {
  try {
    const ventas = await Venta.findAll({
      where: { empresa_id: req.usuario.empresa_id },
      include: [
        { model: DetalleVenta, include: [{ model: Producto, attributes: ['nombre'] }] },
        { model: Cliente, attributes: ['nombre'] }
      ],
      order: [['fecha', 'DESC']]
    });
    return res.json(ventas);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const crear = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { cliente_id, metodo_pago, notas, items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: 'La venta requiere al menos un item' });
    }

    let total = 0;

    // Validate all items first, then apply stock decrements
    for (const item of items) {
      const cantidad = Number(item.cantidad);
      const precioUnitario = Number(item.precio_unitario);

      if (!cantidad || cantidad <= 0 || !precioUnitario || precioUnitario <= 0) {
        await t.rollback();
        return res.status(400).json({ error: 'Cantidad y precio_unitario deben ser mayores a 0' });
      }

      // Lock the product row and validate stock atomically
      const [updatedRows] = await Producto.update(
        { stock: sequelize.literal(`stock - ${cantidad}`) },
        {
          where: {
            id:         item.producto_id,
            empresa_id: req.usuario.empresa_id,
            stock:      { [Op.gte]: cantidad }
          },
          transaction: t
        }
      );

      if (updatedRows === 0) {
        // Either product not found or insufficient stock
        const producto = await Producto.findOne({
          where: { id: item.producto_id, empresa_id: req.usuario.empresa_id },
          transaction: t
        });
        await t.rollback();
        if (!producto) {
          return res.status(404).json({ error: `Producto ${item.producto_id} no encontrado` });
        }
        return res.status(409).json({
          error: `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}, requerido: ${cantidad}`
        });
      }

      total += cantidad * precioUnitario;
    }

    const venta = await Venta.create({
      empresa_id: req.usuario.empresa_id,
      usuario_id: req.usuario.id,
      cliente_id: cliente_id || null,
      metodo_pago: metodo_pago || 'efectivo',
      notas:      notas || null,
      total
    }, { transaction: t });

    for (const item of items) {
      const cantidad      = Number(item.cantidad);
      const precioUnitario = Number(item.precio_unitario);
      await DetalleVenta.create({
        venta_id:        venta.id,
        producto_id:     item.producto_id,
        cantidad,
        precio_unitario: precioUnitario,
        subtotal:        cantidad * precioUnitario
      }, { transaction: t });
    }

    await t.commit();
    return res.status(201).json({ mensaje: 'Venta registrada', venta_id: venta.id, total });
  } catch (error) {
    await t.rollback();
    return res.status(400).json({ error: error.message });
  }
};

module.exports = { listar, crear };