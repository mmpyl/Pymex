/**
 * Rutas del Dominio AUTH para RBAC (Role-Based Access Control)
 */

const router = require('express').Router();
const { check } = require('express-validator');
const { validate } = require('../../../middleware/validation');
const { verificarToken } = require('../../../middleware/auth');
const { checkPermission } = require('../../../middleware/roles');

// Controladores del dominio
const rbacController = require('../controllers/rbacController');

// Todas las rutas requieren autenticación
router.use(verificarToken);

/**
 * @swagger
 * tags:
 *   name: RBAC
 *   description: Gestión de roles, permisos y usuarios
 */

/**
 * @swagger
 * /rbac/roles:
 *   get:
 *     summary: Obtener todos los roles con sus permisos
 *     tags: [RBAC]
 */
router.get('/roles', checkPermission('usuarios_gestionar'), rbacController.getRoles);

/**
 * @swagger
 * /rbac/permisos:
 *   get:
 *     summary: Obtener todos los permisos disponibles
 *     tags: [RBAC]
 */
router.get('/permisos', checkPermission('usuarios_gestionar'), rbacController.getPermisos);

/**
 * @swagger
 * /rbac/roles/:rolId/permisos:
 *   put:
 *     summary: Actualizar permisos de un rol
 *     tags: [RBAC]
 */
router.put('/roles/:rolId/permisos',
  checkPermission('usuarios_gestionar'),
  [
    check('permisos').isArray().withMessage('Permisos debe ser un array')
  ],
  validate,
  rbacController.updateRolPermisos
);

/**
 * @swagger
 * /rbac/usuarios:
 *   get:
 *     summary: Obtener todos los usuarios de la empresa
 *     tags: [RBAC]
 */
router.get('/usuarios', checkPermission('usuarios_gestionar'), rbacController.getUsuarios);

/**
 * @swagger
 * /rbac/usuarios:
 *   post:
 *     summary: Crear un nuevo usuario en la empresa
 *     tags: [RBAC]
 */
router.post('/usuarios',
  checkPermission('usuarios_gestionar'),
  [
    check('nombre').trim().notEmpty().withMessage('Nombre es requerido'),
    check('email').isEmail().withMessage('Email inválido'),
    check('password').isLength({ min: 6 }).withMessage('Password debe tener al menos 6 caracteres'),
    check('rol_id').isInt().withMessage('rol_id debe ser un número entero')
  ],
  validate,
  rbacController.createUsuario
);

/**
 * @swagger
 * /rbac/usuarios/:id/rol:
 *   put:
 *     summary: Actualizar el rol de un usuario
 *     tags: [RBAC]
 */
router.put('/usuarios/:id/rol',
  checkPermission('usuarios_gestionar'),
  [
    check('rol_id').isInt().withMessage('rol_id debe ser un número entero')
  ],
  validate,
  rbacController.updateUsuarioRol
);

module.exports = router;
