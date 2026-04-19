const { Gasto } = require('../models');

const listar = async (req, res) => {
    try {
        const gastos = await Gasto.findAll({
            where: { empresa_id: req.usuario.empresa_id },
            order: [['fecha', 'DESC']]
        });
        res.json(gastos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crear = async (req, res) => {
    try {
        const gasto = await Gasto.create({
            ...req.body,
            empresa_id: req.usuario.empresa_id,
            usuario_id: req.usuario.id
        });
        res.status(201).json(gasto);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { listar, crear };