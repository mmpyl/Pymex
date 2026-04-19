const { Usuario, Rol } = require('../models');

const normalize = (value = '') => value
  .toString()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

const checkSuperAdmin = async (req, res, next) => {
  try {
    const userId = req.usuario?.id;
    if (!userId) return res.status(401).json({ error: 'Token inválido' });

    const usuario = await Usuario.findByPk(userId, {
      include: [{ model: Rol, attributes: ['nombre'] }],
      attributes: ['id', 'estado']
    });

    if (!usuario || usuario.estado !== 'activo' || !usuario.Rol) {
      return res.status(403).json({ error: 'Acceso restringido a super admin' });
    }

    const rol = normalize(usuario.Rol.nombre);
    if (!['super admin', 'super_admin'].includes(rol)) {
      return res.status(403).json({ error: 'Acceso restringido a super admin' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { checkSuperAdmin };
