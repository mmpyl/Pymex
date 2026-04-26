const coreModels = require('../domains/core/models');
const { eventBus } = require('../domains/eventBus');

const { Producto, MovimientoInventario, sequelize } = coreModels;
const { Op } = require('sequelize');

const listar = async (req, res) => {
    try {
        const productos = await Producto.findAll({
            where: { empresa_id: req.usuario.empresa_id, estado: 'activo' },
            order: [['nombre', 'ASC']]
        });
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const registrarMovimiento = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { producto_id, tipo, cantidad, motivo } = req.body;

        const producto = await Producto.findOne({
            where: { id: producto_id, empresa_id: req.usuario.empresa_id },
            transaction: t
        });
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

        // Validar stock en salidas
        if (tipo === 'salida' && producto.stock < cantidad) {
            await t.rollback();
            return res.status(400).json({ error: 'Stock insuficiente' });
        }

        // Actualizar stock
        const nuevoStock = tipo === 'entrada'
            ? producto.stock + parseInt(cantidad)
            : producto.stock - parseInt(cantidad);

        await producto.update({ stock: nuevoStock }, { transaction: t });

        // Registrar movimiento
        const movimiento = await MovimientoInventario.create({
            empresa_id: req.usuario.empresa_id,
            producto_id,
            usuario_id: req.usuario.id,
            tipo,
            cantidad,
            motivo
        }, { transaction: t });

        await t.commit();

        // Publicar evento STOCK_UPDATED
        eventBus.publish('STOCK_UPDATED', {
            producto_id,
            empresa_id: req.usuario.empresa_id,
            tipo,
            cantidad,
            stock_anterior: producto.stock,
            stock_nuevo: nuevoStock,
            movimiento_id: movimiento.id
        }, 'CORE');

        // Verificar si alcanzó stock mínimo y publicar STOCK_LOW
        if (nuevoStock <= producto.stock_minimo) {
            eventBus.publish('STOCK_LOW', {
                producto_id,
                empresa_id: req.usuario.empresa_id,
                stock_actual: nuevoStock,
                stock_minimo: producto.stock_minimo
            }, 'CORE');
        }

        res.status(201).json({ movimiento, stock_actual: nuevoStock });
    } catch (error) {
        await t.rollback();
        res.status(400).json({ error: error.message });
    }
};

const historial = async (req, res) => {
    try {
        const movimientos = await MovimientoInventario.findAll({
            where: { empresa_id: req.usuario.empresa_id },
            include: [{ model: Producto, attributes: ['nombre'] }],
            order: [['fecha', 'DESC']],
            limit: 100
        });
        res.json(movimientos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const stockBajo = async (req, res) => {
    try {
        const productos = await Producto.findAll({
            where: {
                empresa_id: req.usuario.empresa_id,
                estado: 'activo',
                stock: { [Op.lte]: sequelize.col('stock_minimo') }
            }
        });
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { listar, registrarMovimiento, historial, stockBajo };