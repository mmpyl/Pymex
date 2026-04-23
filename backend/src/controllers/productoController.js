const coreModels = require('../domains/core/models');

const { Producto } = coreModels;

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

const crear = async (req, res) => {
    try {
        const producto = await Producto.create({
            ...req.body,
            empresa_id: req.usuario.empresa_id // siempre del token, nunca del body
        });
        res.status(201).json(producto);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const actualizar = async (req, res) => {
    try {
        const producto = await Producto.findOne({
            where: { id: req.params.id, empresa_id: req.usuario.empresa_id }
        });
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
        await producto.update(req.body);
        res.json(producto);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const eliminar = async (req, res) => {
    try {
        const producto = await Producto.findOne({
            where: { id: req.params.id, empresa_id: req.usuario.empresa_id }
        });
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
        await producto.update({ estado: 'inactivo' }); // borrado lógico
        res.json({ mensaje: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { listar, crear, actualizar, eliminar };