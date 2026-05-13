// backend/src/domains/core/routes/productos.js  — con límites completos
const router  = require('express').Router();
const { listar, crear, actualizar, eliminar } = require('../controllers/productoController');

const { verificarToken } = require('../../../middleware/auth');
const { checkFeature, checkLimit } = require('../../../middleware/featureGate');
const { Producto } = require('../models');

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Gestión de productos del inventario
 */

/**
 * @swagger
 * /productos:
 *   get:
 *     summary: Listar todos los productos de la empresa
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoria_id
 *         schema:
 *           type: integer
 *         description: Filtrar por categoría
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre o descripción
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Cantidad de resultados por página
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 50
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 pages:
 *                   type: integer
 *                   example: 3
 *                 rows:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Producto'
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /productos:
 *   post:
 *     summary: Crear un nuevo producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - precio
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Producto A"
 *               descripcion:
 *                 type: string
 *                 example: "Descripción del producto"
 *               precio:
 *                 type: number
 *                 format: float
 *                 example: 99.99
 *               stock:
 *                 type: integer
 *                 example: 100
 *               categoria_id:
 *                 type: integer
 *                 example: 1
 *               sku:
 *                 type: string
 *                 example: "PROD-001"
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       400:
 *         description: Error en validación de datos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Límite de productos alcanzado o feature no disponible
 */

/**
 * @swagger
 * /productos/{id}:
 *   put:
 *     summary: Actualizar un producto existente
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Producto A Actualizado"
 *               descripcion:
 *                 type: string
 *                 example: "Nueva descripción"
 *               precio:
 *                 type: number
 *                 format: float
 *                 example: 149.99
 *               stock:
 *                 type: integer
 *                 example: 150
 *               categoria_id:
 *                 type: integer
 *                 example: 2
 *               activo:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       400:
 *         description: Error en validación de datos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Producto no encontrado
 */

/**
 * @swagger
 * /productos/{id}:
 *   delete:
 *     summary: Eliminar un producto (lógico)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto a eliminar
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Producto eliminado correctamente"
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Producto no encontrado
 */

const { ensureTenantAccess } = require('../../../middleware/tenant');

router.use(verificarToken);
// Asegurar aislamiento tenant en todas las operaciones de empresa
router.use(ensureTenantAccess());
router.use(checkFeature('inventario'));

router.get('/', listar);
router.post(
  '/',
  checkLimit('max_productos', async (req) => Producto.count({ where: { empresa_id: req.usuario.empresa_id, estado: 'activo' } })),
  crear
);
router.put('/:id', actualizar);
router.delete('/:id', eliminar);

module.exports = router;
