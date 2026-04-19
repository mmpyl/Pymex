

// backend/src/middleware/adminAuth.js
// Verifica que el request viene con un JWT de tipo 'admin'
// (emitido por loginAdmin, almacenado como admin_token en el frontend).


const { verificarTokenAdmin } = require('./auth');

const verificarAdminAccess = (req, res, next) => {
  verificarTokenAdmin(req, res, next);
};

module.exports = { verificarAdminAccess };
