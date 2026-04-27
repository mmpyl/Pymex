const { ApiKey } = require('../domains/core/models');

const verificarApiKey = async (req, res, next) => {
  try {
    const token = req.headers['x-api-key'];
    if (!token) return res.status(401).json({ error: 'API key requerida' });

    const apiKey = await ApiKey.findOne({ where: { token, estado: 'activa' } });
    if (!apiKey) return res.status(403).json({ error: 'API key inválida o inactiva' });

    req.apiKey = apiKey;
    await apiKey.update({ ultimo_uso: new Date() });
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { verificarApiKey };
