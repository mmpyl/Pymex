const coreModels = require('../domains/core/models');

const { Cliente } = coreModels;

const listar = async (req, res) => {
    try {
        const clientes = await Cliente.findAll({
            where: { empresa_id: req.usuario.empresa_id },
            order: [['nombre', 'ASC']]
        });
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crear = async (req, res) => {
    try {
        const cliente = await Cliente.create({
            ...req.body,
            empresa_id: req.usuario.empresa_id
        });
        res.status(201).json(cliente);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const actualizar = async (req, res) => {
    try {
        const cliente = await Cliente.findOne({
            where: { id: req.params.id, empresa_id: req.usuario.empresa_id }
        });
        if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
        await cliente.update(req.body);
        res.json(cliente);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const eliminar = async (req, res) => {
    try {
        const cliente = await Cliente.findOne({
            where: { id: req.params.id, empresa_id: req.usuario.empresa_id }
        });
        if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
        await cliente.destroy();
        res.json({ mensaje: 'Cliente eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { listar, crear, actualizar, eliminar };