// backend/src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SaPyme API',
      version: '2.0.0',
      description: 'API para la gestión de PYMES - Sistema SaaS de administración empresarial',
      contact: {
        name: 'Soporte SaPyme',
        email: 'soporte@sapyme.com'
      },
      license: {
        name: 'ISC'
      }
    },
    servers: [
      {
        url: '/api',
        description: 'Servidor de API'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT de autenticación'
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API Key para acceso B2B'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', description: 'Mensaje de error' },
            code: { type: 'string', description: 'Código de error' },
            request_id: { type: 'string', description: 'ID único de la solicitud' }
          }
        },
        Usuario: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID del usuario' },
            nombre: { type: 'string', description: 'Nombre completo' },
            email: { type: 'string', format: 'email', description: 'Correo electrónico' },
            rol: { type: 'string', enum: ['super_admin', 'admin', 'usuario', 'cliente'], description: 'Rol del usuario' },
            empresa_id: { type: 'integer', description: 'ID de la empresa' },
            activo: { type: 'boolean', description: 'Estado del usuario' },
            creado_en: { type: 'string', format: 'date-time', description: 'Fecha de creación' }
          }
        },
        Producto: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID del producto' },
            nombre: { type: 'string', description: 'Nombre del producto' },
            descripcion: { type: 'string', description: 'Descripción del producto' },
            precio: { type: 'number', format: 'float', description: 'Precio unitario' },
            stock: { type: 'integer', description: 'Cantidad en stock' },
            categoria_id: { type: 'integer', description: 'ID de la categoría' },
            empresa_id: { type: 'integer', description: 'ID de la empresa' },
            activo: { type: 'boolean', description: 'Estado del producto' }
          }
        },
        Venta: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID de la venta' },
            cliente_id: { type: 'integer', description: 'ID del cliente' },
            total: { type: 'number', format: 'float', description: 'Total de la venta' },
            estado: { type: 'string', enum: ['pendiente', 'completada', 'cancelada'], description: 'Estado de la venta' },
            fecha: { type: 'string', format: 'date-time', description: 'Fecha de la venta' },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/VentaItem' }
            }
          }
        },
        VentaItem: {
          type: 'object',
          properties: {
            producto_id: { type: 'integer', description: 'ID del producto' },
            cantidad: { type: 'integer', description: 'Cantidad' },
            precio_unitario: { type: 'number', format: 'float', description: 'Precio unitario' },
            subtotal: { type: 'number', format: 'float', description: 'Subtotal' }
          }
        },
        Cliente: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID del cliente' },
            nombre: { type: 'string', description: 'Nombre del cliente' },
            email: { type: 'string', format: 'email', description: 'Correo electrónico' },
            telefono: { type: 'string', description: 'Teléfono' },
            direccion: { type: 'string', description: 'Dirección' },
            empresa_id: { type: 'integer', description: 'ID de la empresa' }
          }
        },
        Categoria: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID de la categoría' },
            nombre: { type: 'string', description: 'Nombre de la categoría' },
            descripcion: { type: 'string', description: 'Descripción' },
            empresa_id: { type: 'integer', description: 'ID de la empresa' }
          }
        },
        Proveedor: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID del proveedor' },
            nombre: { type: 'string', description: 'Nombre del proveedor' },
            contacto: { type: 'string', description: 'Persona de contacto' },
            email: { type: 'string', format: 'email', description: 'Correo electrónico' },
            telefono: { type: 'string', description: 'Teléfono' },
            empresa_id: { type: 'integer', description: 'ID de la empresa' }
          }
        },
        Gasto: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID del gasto' },
            concepto: { type: 'string', description: 'Concepto del gasto' },
            monto: { type: 'number', format: 'float', description: 'Monto del gasto' },
            fecha: { type: 'string', format: 'date-time', description: 'Fecha del gasto' },
            categoria: { type: 'string', description: 'Categoría del gasto' },
            empresa_id: { type: 'integer', description: 'ID de la empresa' }
          }
        },
        Inventario: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID del registro' },
            producto_id: { type: 'integer', description: 'ID del producto' },
            tipo_movimiento: { type: 'string', enum: ['entrada', 'salida', 'ajuste'], description: 'Tipo de movimiento' },
            cantidad: { type: 'integer', description: 'Cantidad' },
            fecha: { type: 'string', format: 'date-time', description: 'Fecha del movimiento' },
            usuario_id: { type: 'integer', description: 'ID del usuario que registró' }
          }
        },
        Alerta: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID de la alerta' },
            tipo: { type: 'string', enum: ['stock_bajo', 'venta_alta', 'gasto_elevado', 'vencimiento'], description: 'Tipo de alerta' },
            mensaje: { type: 'string', description: 'Mensaje de la alerta' },
            nivel: { type: 'string', enum: ['info', 'warning', 'error'], description: 'Nivel de severidad' },
            leida: { type: 'boolean', description: 'Si la alerta fue leída' },
            fecha: { type: 'string', format: 'date-time', description: 'Fecha de la alerta' }
          }
        },
        DashboardMetrica: {
          type: 'object',
          properties: {
            ventas_totales: { type: 'number', format: 'float', description: 'Total de ventas' },
            gastos_totales: { type: 'number', format: 'float', description: 'Total de gastos' },
            ganancias: { type: 'number', format: 'float', description: 'Ganancias netas' },
            clientes_nuevos: { type: 'integer', description: 'Clientes nuevos' },
            productos_vendidos: { type: 'integer', description: 'Productos vendidos' }
          }
        },
        Reporte: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID del reporte' },
            tipo: { type: 'string', enum: ['ventas', 'gastos', 'inventario', 'clientes'], description: 'Tipo de reporte' },
            formato: { type: 'string', enum: ['pdf', 'excel', 'csv'], description: 'Formato de salida' },
            fecha_inicio: { type: 'string', format: 'date', description: 'Fecha de inicio' },
            fecha_fin: { type: 'string', format: 'date', description: 'Fecha de fin' },
            generado_en: { type: 'string', format: 'date-time', description: 'Fecha de generación' }
          }
        },
        Feature: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID del feature' },
            nombre: { type: 'string', description: 'Nombre del feature' },
            habilitado: { type: 'boolean', description: 'Si está habilitado' },
            plan_requerido: { type: 'string', enum: ['free', 'basic', 'pro', 'enterprise'], description: 'Plan requerido' }
          }
        },
        Plan: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID del plan' },
            nombre: { type: 'string', enum: ['free', 'basic', 'pro', 'enterprise'], description: 'Nombre del plan' },
            precio: { type: 'number', format: 'float', description: 'Precio mensual' },
            features: { type: 'array', items: { type: 'string' }, description: 'Features incluidos' }
          }
        },
        Pago: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID del pago' },
            monto: { type: 'number', format: 'float', description: 'Monto del pago' },
            metodo: { type: 'string', enum: ['tarjeta', 'transferencia', 'efectivo'], description: 'Método de pago' },
            estado: { type: 'string', enum: ['pendiente', 'aprobado', 'rechazado', 'reembolsado'], description: 'Estado del pago' },
            fecha: { type: 'string', format: 'date-time', description: 'Fecha del pago' }
          }
        },
        Factura: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID de la factura' },
            numero: { type: 'string', description: 'Número de factura' },
            cliente_id: { type: 'integer', description: 'ID del cliente' },
            total: { type: 'number', format: 'float', description: 'Total de la factura' },
            estado: { type: 'string', enum: ['borrador', 'emitida', 'pagada', 'cancelada'], description: 'Estado de la factura' },
            fecha_emision: { type: 'string', format: 'date-time', description: 'Fecha de emisión' },
            fecha_vencimiento: { type: 'string', format: 'date-time', description: 'Fecha de vencimiento' }
          }
        },
        Comprobante: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID del comprobante' },
            tipo: { type: 'string', enum: ['factura', 'boleta', 'nota_credito', 'nota_debito'], description: 'Tipo de comprobante' },
            serie: { type: 'string', description: 'Serie del comprobante (ej: F001, B001)' },
            correlativo: { type: 'integer', description: 'Número correlativo' },
            numero: { type: 'string', description: 'Número completo del comprobante' },
            ruc_cliente: { type: 'string', description: 'RUC del cliente' },
            razon_social: { type: 'string', description: 'Razón social del cliente' },
            total: { type: 'number', format: 'float', description: 'Monto total' },
            moneda: { type: 'string', enum: ['PEN', 'USD'], description: 'Moneda' },
            estado: { type: 'string', enum: ['pendiente', 'emitido', 'anulado', 'rechazado'], description: 'Estado del comprobante' },
            sunat_estado: { type: 'string', description: 'Estado en SUNAT' },
            fecha_emision: { type: 'string', format: 'date-time', description: 'Fecha de emisión' }
          }
        },
        ApiKeyResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', description: 'Si la operación fue exitosa' },
            data: { type: 'array', items: { $ref: '#/components/schemas/Comprobante' }, description: 'Lista de comprobantes' },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'integer', description: 'Total de registros' },
                limit: { type: 'integer', description: 'Límite aplicado' }
              }
            }
          }
        }
      }
    },
    tags: [
      { name: 'Auth', description: 'Autenticación y autorización' },
      { name: 'Usuarios', description: 'Gestión de usuarios' },
      { name: 'Productos', description: 'Gestión de productos' },
      { name: 'Categorías', description: 'Gestión de categorías' },
      { name: 'Ventas', description: 'Gestión de ventas' },
      { name: 'Gastos', description: 'Gestión de gastos' },
      { name: 'Clientes', description: 'Gestión de clientes' },
      { name: 'Proveedores', description: 'Gestión de proveedores' },
      { name: 'Inventario', description: 'Gestión de inventario' },
      { name: 'Dashboard', description: 'Métricas y estadísticas' },
      { name: 'Alertas', description: 'Sistema de alertas' },
      { name: 'Reportes', description: 'Generación de reportes' },
      { name: 'ML', description: 'Servicios de Machine Learning' },
      { name: 'Facturación', description: 'Facturación electrónica' },
      { name: 'SaaS', description: 'Gestión de planes y suscripciones' },
      { name: 'Pagos', description: 'Procesamiento de pagos' },
      { name: 'Features', description: 'Gestión de features por plan' },
      { name: 'RBAC', description: 'Control de acceso basado en roles' },
      { name: 'Admin', description: 'Endpoints de administración' },
      { name: 'Super Admin', description: 'Endpoints exclusivos para super administradores' },
      { name: 'Public', description: 'API Pública con autenticación por API Key' }
    ]
  },
  apis: ['./src/routes/*.js', './src/routes/admin/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
