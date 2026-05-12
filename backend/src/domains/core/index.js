/**
 * Índice del Dominio CORE
 * 
 * Este archivo centraliza las exportaciones del dominio CORE.
 * El dominio CORE es responsable de:
 * - Gestión de productos, categorías e inventario
 * - Ventas y gastos
 * - Clientes y proveedores
 * - Dashboard y reportes
 * - Alertas del sistema
 * 
 * Estructura del dominio:
 * ├── controllers/   - Controladores HTTP
 * ├── routes/        - Definición de rutas
 * ├── services/      - Lógica de negocio
 * └── models/        - Modelos de datos
 */

// Rutas del dominio
const productosRoutes = require('./routes/productos');
const categoriasRoutes = require('./routes/categorias');
const ventasRoutes = require('./routes/ventas');
const gastosRoutes = require('./routes/gastos');
const clientesRoutes = require('./routes/clientes');
const proveedoresRoutes = require('./routes/proveedores');
const inventarioRoutes = require('./routes/inventario');
const dashboardRoutes = require('./routes/dashboard');
const alertasRoutes = require('./routes/alertas');
const reportesRoutes = require('./routes/reportes');

// Controladores
const productoController = require('./controllers/productoController');
const categoriaController = require('./controllers/categoriaController');
const ventaController = require('./controllers/ventaController');
const gastoController = require('./controllers/gastoController');
const clienteController = require('./controllers/clienteController');
const proveedorController = require('./controllers/proveedorController');
const inventarioController = require('./controllers/inventarioController');
const dashboardController = require('./controllers/dashboardController');
const alertaController = require('./controllers/alertaController');
const reporteController = require('./controllers/reporteController');

module.exports = {
  // Rutas del dominio
  routes: {
    productos: productosRoutes,
    categorias: categoriasRoutes,
    ventas: ventasRoutes,
    gastos: gastosRoutes,
    clientes: clientesRoutes,
    proveedores: proveedoresRoutes,
    inventario: inventarioRoutes,
    dashboard: dashboardRoutes,
    alertas: alertasRoutes,
    reportes: reportesRoutes
  },

  // Controladores del dominio
  controllers: {
    producto: productoController,
    categoria: categoriaController,
    venta: ventaController,
    gasto: gastoController,
    cliente: clienteController,
    proveedor: proveedorController,
    inventario: inventarioController,
    dashboard: dashboardController,
    alerta: alertaController,
    reporte: reporteController
  }
};
