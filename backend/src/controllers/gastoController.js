const coreModels = require('../domains/core/models');
const eventBus = require('../domains/eventBus');

const { Gasto } = coreModels;

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
        
        // Publicar evento para BILLING (tracking de gastos)
        eventBus.publish('EXPENSE_CREATED', {
            gastoId: gasto.id,
            empresa_id: gasto.empresa_id,
            monto: gasto.monto,
            categoria: gasto.categoria,
            timestamp: new Date()
        }, 'CORE');
        
        res.status(201).json(gasto);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { listar, crear };