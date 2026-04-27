# Documentación de API con Swagger/OpenAPI

## Descripción

La API SaPyme ahora incluye documentación interactiva utilizando **Swagger UI** basada en el estándar **OpenAPI 3.0.0**. Esto facilita la integración del frontend, el onboarding de nuevos desarrolladores y las pruebas de los endpoints.

## Acceso a la Documentación

Una vez iniciado el servidor backend, puedes acceder a la documentación interactiva en:

```
http://localhost:PORT/api-docs
```

Donde `PORT` es el puerto configurado para el servidor (por defecto usualmente 3000 o el definido en `process.env.PORT`).

## Características

### 1. Interfaz Interactiva
- Exploración visual de todos los endpoints disponibles
- Prueba directa de endpoints desde el navegador
- Autenticación integrada para endpoints protegidos

### 2. Esquemas de Datos
Se incluyen modelos reutilizables para:
- `Usuario` - Gestión de usuarios
- `Producto` - Catálogo de productos
- `Venta` - Registro de ventas
- `Cliente` - Base de clientes
- `Proveedor` - Gestión de proveedores
- `Categoria` - Categorización de productos
- `Gasto` - Control de gastos
- `Inventario` - Movimientos de inventario
- `Alerta` - Sistema de alertas
- `DashboardMetrica` - Métricas del dashboard
- `Reporte` - Generación de reportes
- `Feature` - Features por plan
- `Plan` - Planes de suscripción
- `Pago` - Procesamiento de pagos
- `Factura` - Facturación electrónica

### 3. Seguridad
La documentación incluye dos esquemas de autenticación:
- **Bearer Auth (JWT)**: Para autenticación de usuarios
- **API Key**: Para acceso B2B mediante header `x-api-key`

## Estructura de Archivos

```
backend/
├── src/
│   ├── config/
│   │   └── swagger.js          # Configuración principal de Swagger
│   ├── routes/
│   │   ├── auth.js             # Documentación de endpoints de autenticación
│   │   ├── productos.js        # Documentación de endpoints de productos
│   │   └── ...                 # Otros archivos de rutas (pendientes de documentar)
│   └── app.js                  # Punto de montaje de Swagger UI
└── package.json                # Dependencias: swagger-jsdoc, swagger-ui-express
```

## Cómo Agregar Documentación a Nuevos Endpoints

### Paso 1: Agregar comentarios JSDoc en el archivo de rutas

Ejemplo para un endpoint de productos:

```javascript
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
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Producto'
 */
router.get('/', listar);
```

### Paso 2: Definir schemas personalizados (opcional)

Si necesitas schemas adicionales, agrégalos en `/src/config/swagger.js`:

```javascript
schemas: {
  // ... schemas existentes
  MiNuevoSchema: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      nombre: { type: 'string' }
    }
  }
}
```

### Paso 3: Referenciar tags existentes o crear nuevos

Los tags están definidos en `/src/config/swagger.js`. Si creas un nuevo módulo, agrega su tag:

```javascript
tags: [
  // ... tags existentes
  { name: 'MiNuevoModulo', description: 'Descripción del módulo' }
]
```

## Endpoints Actualmente Documentados

### Auth (`/api/auth`)
- `POST /register` - Registrar nueva empresa
- `POST /login` - Iniciar sesión
- `GET /profile` - Obtener perfil del usuario
- `POST /logout` - Cerrar sesión
- `POST /admin/login` - Login de administrador
- `GET /admin/profile` - Perfil de administrador
- `POST /bootstrap-super-admin` - Crear super admin inicial

### Productos (`/api/productos`)
- `GET /` - Listar productos
- `POST /` - Crear producto
- `PUT /:id` - Actualizar producto
- `DELETE /:id` - Eliminar producto

## Uso desde Frontend

### Ejemplo con fetch y JWT:

```javascript
const token = localStorage.getItem('jwt_token');

// Listar productos
fetch('/api/productos', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log(data));

// Crear producto
fetch('/api/productos', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nombre: 'Nuevo Producto',
    precio: 99.99,
    stock: 100
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

## Consideraciones de Producción

1. **No exponer Swagger en producción**: En entornos productivos, considera deshabilitar o proteger con autenticación adicional el endpoint `/api-docs`.

2. **Actualizar versión**: Recuerda actualizar el número de versión en `/src/config/swagger.js` cuando haya cambios significativos en la API.

3. **Validar schemas**: Asegúrate de que los schemas reflejen fielmente la estructura real de datos.

## Troubleshooting

### La documentación no aparece
1. Verifica que las dependencias estén instaladas: `npm install`
2. Confirma que `/src/config/swagger.js` no tenga errores de sintaxis
3. Revisa que los paths en `apis` apunten a archivos existentes

### Los endpoints no se muestran actualizados
1. Limpia el caché del navegador
2. Reinicia el servidor backend
3. Verifica que los comentarios JSDoc estén correctamente formateados

## Recursos Adicionales

- [Documentación oficial de Swagger](https://swagger.io/docs/)
- [Especificación OpenAPI 3.0](https://swagger.io/specification/)
- [swagger-jsdoc npm](https://www.npmjs.com/package/swagger-jsdoc)
- [swagger-ui-express npm](https://www.npmjs.com/package/swagger-ui-express)

---

**Versión de la API**: 2.0.0  
**Última actualización**: 2026
