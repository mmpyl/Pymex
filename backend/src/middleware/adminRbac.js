// backend/src/middleware/adminRbac.js
// Middleware de control de acceso basado en roles (RBAC) para administradores del SaaS
// Exclusivo para el Super Admin Platform (/api/super-admin/*)
// Usa la tabla usuarios_admin, NO debe usarse para usuarios de empresa

const { UsuarioAdmin } = require('../domains/auth/models');
const logger = require('../utils/logger');

/**
 * Normaliza un valor para comparación case-insensitive sin acentos
 */
const normalize = (value = '') => value
  .toString()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

/**
 * Middleware para verificar rol de administrador del SaaS
 * 
 * @param  {...string} rolesPermitidos - Lista de roles permitidos (ej: 'super_admin', 'soporte')
 * @returns {Function} Middleware de Express
 */
const checkAdminRole = (...rolesPermitidos) => {
  const permitidos = rolesPermitidos.flat().map(normalize);

  return async (req, res, next) => {
    try {
      // Verificar que el token es de tipo admin
      if (!req.admin || req.admin.token_type !== 'admin') {
        return res.status(403).json({ error: 'Acceso restringido a administradores del SaaS' });
      }

      const adminId = req.admin.id;
      
      // Obtener el administrador desde la DB para verificar estado y rol
      const admin = await UsuarioAdmin.findByPk(adminId, {
        attributes: ['id', 'nombre', 'email', 'rol', 'estado']
      });

      if (!admin || admin.estado !== 'activo') {
        logger.warn('Acceso denegado: Administrador inactivo o no encontrado', {
          adminId,
          ruta: req.originalUrl,
          metodo: req.method
        });
        return res.status(403).json({ error: 'Administrador inactivo o no encontrado' });
      }

      const rolNormalizado = normalize(admin.rol);

      // Logging de auditoría
      logger.info('Intento de acceso de admin por rol', {
        adminId,
        email: admin.email,
        rol: rolNormalizado,
        ruta: req.originalUrl,
        metodo: req.method,
        rolesPermitidos: permitidos
      });

      // El rol super_admin tiene acceso total
      if (rolNormalizado === 'super_admin') {
        logger.info('Acceso concedido por super_admin', {
          adminId,
          ruta: req.originalUrl
        });
        return next();
      }

      // Verificar si el rol está en la lista de permitidos
      if (!permitidos.includes(rolNormalizado)) {
        logger.warn('Acceso denegado por rol insuficiente (admin)', {
          adminId,
          rol: rolNormalizado,
          ruta: req.originalUrl,
          rolesRequeridos: permitidos
        });
        return res.status(403).json({ 
          error: 'No tienes permiso por rol para esta acción',
          rol_requerido: permitidos.join(', ')
        });
      }

      logger.info('Acceso concedido por rol (admin)', {
        adminId,
        rol: rolNormalizado,
        ruta: req.originalUrl
      });

      next();
    } catch (error) {
      logger.error('Error verificando rol de administrador', {
        adminId: req.admin?.id,
        error: error.message,
        ruta: req.originalUrl
      });
      return res.status(500).json({ error: error.message });
    }
  };
};

/**
 * Middleware para verificar permisos específicos de administrador del SaaS
 * 
 * Nota: En esta versión, los permisos se basan en el rol.
 * Para una implementación más granular, se podría agregar una tabla de permisos para admins.
 * 
 * @param {string} permisoCodigo - Código del permiso requerido
 * @returns {Function} Middleware de Express
 */
const checkAdminPermission = (permisoCodigo) => {
  const permiso = normalize(permisoCodigo);

  return async (req, res, next) => {
    try {
      // Verificar que el token es de tipo admin
      if (!req.admin || req.admin.token_type !== 'admin') {
        return res.status(403).json({ error: 'Acceso restringido a administradores del SaaS' });
      }

      const adminId = req.admin.id;
      
      // Obtener el administrador desde la DB
      const admin = await UsuarioAdmin.findByPk(adminId, {
        attributes: ['id', 'nombre', 'email', 'rol', 'estado']
      });

      if (!admin || admin.estado !== 'activo') {
        logger.warn('Acceso denegado: Administrador inactivo o no encontrado', {
          adminId,
          ruta: req.originalUrl
        });
        return res.status(403).json({ error: 'Administrador inactivo o no encontrado' });
      }

      const rolNormalizado = normalize(admin.rol);

      // Logging de auditoría
      logger.info('Intento de acceso de admin por permiso', {
        adminId,
        email: admin.email,
        rol: rolNormalizado,
        permisoRequerido: permisoCodigo,
        ruta: req.originalUrl,
        metodo: req.method
      });

      // El rol super_admin tiene todos los permisos
      if (rolNormalizado === 'super_admin') {
        logger.info('Acceso concedido por super_admin (permiso)', {
          adminId,
          ruta: req.originalUrl
        });
        return next();
      }

      // Mapeo de roles a permisos implícitos
      // Se puede extender para incluir una tabla de permisos dedicada para admins
      const permisosPorRol = {
        'super_admin': ['*'], // Todos los permisos
        'soporte': ['empresas:ver', 'usuarios:ver', 'suscripciones:ver'],
        'ventas': ['empresas:ver', 'planes:ver', 'pagos:ver', 'suscripciones:gestionar'],
        'finanzas': ['pagos:ver', 'pagos:crear', 'reportes:financieros']
      };

      const permisosAdmin = permisosPorRol[rolNormalizado] || [];

      // Verificar si tiene permiso wildcard o el permiso específico
      if (!permisosAdmin.includes('*') && !permisosAdmin.includes(permiso)) {
        logger.warn('Acceso denegado por permiso insuficiente (admin)', {
          adminId,
          rol: rolNormalizado,
          permisoRequerido: permisoCodigo,
          permisosDisponibles: permisosAdmin,
          ruta: req.originalUrl
        });
        return res.status(403).json({
          error: 'Permiso denegado',
          permiso_requerido: permisoCodigo
        });
      }

      logger.info('Acceso concedido por permiso (admin)', {
        adminId,
        rol: rolNormalizado,
        permiso: permisoCodigo,
        ruta: req.originalUrl
      });

      next();
    } catch (error) {
      logger.error('Error verificando permiso de administrador', {
        adminId: req.admin?.id,
        error: error.message,
        ruta: req.originalUrl
      });
      return res.status(500).json({ error: error.message });
    }
  };
};

module.exports = { 
  checkAdminRole, 
  checkAdminPermission 
};
