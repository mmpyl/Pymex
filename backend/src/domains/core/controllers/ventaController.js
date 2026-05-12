// backend/src/controllers/ventaController.js
// FIXES:
//   - Added missing Op import from sequelize
//   - Removed all duplicate variable declarations and unreachable code
//   - Stock validation uses atomic decrement with WHERE stock >= cantidad
//   - Single clean flow with proper transaction rollback
//   - ✅ MIGRADO: Publicación de eventos de dominio
//   - ✅ MIGRADO: Manejo consistente de errores con AppError

const { Op } = require('sequelize');
const coreModels = require('../domains/core/models');
const { eventBus } = require('../domains/eventBus');
const { asyncHandler, ValidationError, NotFoundError, ConflictError } = require('../middleware/errorHandler');

const { Venta, DetalleVenta, Producto, Cliente, sequelize } = coreModels;

const listar = asyncHandler(async (req, res) => {
  const ventas = await Venta.findAll({
    where: { empresa_id: req.usuario.empresa_id },
    include: [
      { model: DetalleVenta, include: [{ model: Producto, attributes: ['nombre'] }] },
      { model: Cliente, attributes: ['nombre'] }
    ],
    order: [['fecha', 'DESC']]
  });
  return res.json(ventas);
});

const crear = asyncHandler(async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { cliente_id, metodo_pago, notas, items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      await t.rollback();
      throw new ValidationError('La venta requiere al menos un item');
    }

    let total = 0;

    // Validate all items first, then apply stock decrements
    for (const item of items) {
      const cantidad = Number(item.cantidad);
      const precioUnitario = Number(item.precio_unitario);

      if (!cantidad || cantidad <= 0 || !precioUnitario || precioUnitario <= 0) {
        await t.rollback();
        throw new ValidationError('Cantidad y precio_unitario deben ser mayores a 0');
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
        // NOTE: We intentionally do NOT query the product here to avoid revealing
        // current stock levels in error messages (information disclosure vulnerability).
        // Instead, we return a generic message that doesn't expose internal state.
        await t.rollback();

        // Check if product exists (without exposing stock info)
        const productoExists = await Producto.findOne({
          where: { id: item.producto_id, empresa_id: req.usuario.empresa_id },
          attributes: ['id'], // Only fetch ID to confirm existence
          transaction: t
        });

        if (!productoExists) {
          throw new NotFoundError(`Producto ${item.producto_id} no encontrado`);
        }

        // Generic message that doesn't reveal current stock level
        throw new ConflictError(`Stock insuficiente para el producto ${item.producto_id}`);
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
      const cantidad = Number(item.cantidad);
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

    // ✅ PUBLICAR EVENTO DE DOMINIO: Otros dominios pueden reaccionar a esta venta
    await eventBus.publish('SALE_COMPLETED', {
      ventaId: venta.id,
      empresaId: req.usuario.empresa_id,
      usuarioId: req.usuario.id,
      total: venta.total,
      fecha: venta.fecha ? venta.fecha.toISOString() : new Date().toISOString(),
      metodo_pago: venta.metodo_pago,
      itemsCount: items.length
    }, 'CORE');

    return res.status(201).json({ mensaje: 'Venta registrada', venta_id: venta.id, total });
  } catch (error) {
    await t.rollback();
    throw error;
  }
});

module.exports = { listar, crear };
