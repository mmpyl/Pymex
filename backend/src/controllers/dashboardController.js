const coreModels = require('../domains/core/models');

const { Venta, Gasto, Producto, DetalleVenta, sequelize } = coreModels;
const { Op } = require('sequelize');

const resumen = async (req, res) => {
    const empresa_id = req.usuario.empresa_id;
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
    const finMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0);

    try {
        // Ventas del mes actual
        const ventasMes = await Venta.sum('total', {
            where: { empresa_id, fecha: { [Op.gte]: inicioMes } }
        }) || 0;

        // Ventas mes anterior
        const ventasMesAnterior = await Venta.sum('total', {
            where: { empresa_id, fecha: { [Op.between]: [inicioMesAnterior, finMesAnterior] } }
        }) || 0;

        // Gastos del mes
        const gastosMes = await Gasto.sum('monto', {
            where: { empresa_id, fecha: { [Op.gte]: inicioMes } }
        }) || 0;

        // Total productos activos
        const totalProductos = await Producto.count({
            where: { empresa_id, estado: 'activo' }
        });

        // Productos con stock bajo
        const stockBajo = await Producto.count({
            where: {
                empresa_id,
                estado: 'activo',
                stock: { [Op.lte]: sequelize.col('stock_minimo') }
            }
        });

        // Crecimiento
        const crecimiento = ventasMesAnterior > 0
            ? (((ventasMes - ventasMesAnterior) / ventasMesAnterior) * 100).toFixed(1)
            : 0;

        res.json({
            ventas_mes: parseFloat(ventasMes),
            gastos_mes: parseFloat(gastosMes),
            utilidad_mes: parseFloat(ventasMes) - parseFloat(gastosMes),
            total_productos: totalProductos,
            stock_bajo: stockBajo,
            crecimiento_ventas: parseFloat(crecimiento)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const ventasMensuales = async (req, res) => {
    const empresa_id = req.usuario.empresa_id;
    try {
        const datos = await Venta.findAll({
            attributes: [
                [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('fecha')), 'mes'],
                [sequelize.fn('SUM', sequelize.col('total')), 'total'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad']
            ],
            where: {
                empresa_id,
                fecha: { [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 11)) }
            },
            group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('fecha'))],
            order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('fecha')), 'ASC']]
        });
        res.json(datos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const gastosMensuales = async (req, res) => {
    const empresa_id = req.usuario.empresa_id;
    try {
        const datos = await Gasto.findAll({
            attributes: [
                [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('fecha')), 'mes'],
                [sequelize.fn('SUM', sequelize.col('monto')), 'total']
            ],
            where: {
                empresa_id,
                fecha: { [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 11)) }
            },
            group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('fecha'))],
            order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('fecha')), 'ASC']]
        });
        res.json(datos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const topProductos = async (req, res) => {
    const empresa_id = req.usuario.empresa_id;
    try {
        const datos = await DetalleVenta.findAll({
            attributes: [
                'producto_id',
                [sequelize.fn('SUM', sequelize.col('cantidad')), 'total_vendido'],
                [sequelize.fn('SUM', sequelize.col('subtotal')), 'total_ingresos']
            ],
            include: [{
                model: Producto,
                attributes: ['nombre'],
                where: { empresa_id }
            }],
            group: ['producto_id', 'Producto.id', 'Producto.nombre'],
            order: [[sequelize.fn('SUM', sequelize.col('subtotal')), 'DESC']],
            limit: 5
        });
        res.json(datos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { resumen, ventasMensuales, gastosMensuales, topProductos };