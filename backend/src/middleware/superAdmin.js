const { Usuario, Rol } = require('../domains/auth/models');

const normalize = (value = '') => value
  .toString()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

/**
 * Middleware para verificar rol Super Admin en usuarios de empresa.
 * 
 * IMPORTANTE: Este middleware verifica el rol en la tabla de usuarios de EMPRESA,
 * NO debe usarse para rutas del panel admin (/api/admin/*).
 * 
 * Para rutas del panel admin que usan tokens de tipo 'admin' (tabla usuarios_admin),
 * usar directamente verificarTokenAdmin desde middleware/auth.js
 * 
 * @deprecated Para nuevas rutas de super admin, considerar migrar a tokens admin dedicados
 */
const checkSuperAdminRol = async (req, res, next) => {
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

// Alias para compatibilidad con código existente
const checkSuperAdmin = checkSuperAdminRol;

module.exports = { checkSuperAdminRol, checkSuperAdmin };
