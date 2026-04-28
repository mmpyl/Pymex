
// backend/src/middleware/adminAuth.js
// Verifica que el request viene con un JWT de tipo 'admin'
// (emitido por loginAdmin, almacenado como admin_token en el frontend).
//
// ESTE MIDDLEWARE ES EXCLUSIVO PARA EL PANEL DE ADMINISTRACION DEL SAAS (/api/admin/*)
// Usa tokens de la tabla usuarios_admin, NO debe usarse para usuarios de empresa.


const { verificarTokenAdmin } = require('./auth');

/**
 * Middleware que verifica acceso al panel admin usando tokens JWT de tipo 'admin'.
 * 
 * IMPORTANTE: Este middleware es exclusivo para rutas del panel de administración del SaaS.
 * Verifica tokens emitidos para la tabla usuarios_admin, NO para usuarios de empresa.
 * 
 * Para verificar rol super_admin en usuarios de empresa, usar checkSuperAdminRol desde superAdmin.js
 */
const verificarAdminAccess = (req, res, next) => {
  verificarTokenAdmin(req, res, next);
};

module.exports = { verificarAdminAccess };
