# 📖 API REFERENCE - SaPyme

## Documentación Completa de Endpoints

**Base URL**: `http://localhost:3000/api`  
**Versión**: 3.2.0  
**Autenticación**: JWT Bearer Token

---

## 🔐 Autenticación

Todos los endpoints (excepto `/auth/login` y `/auth/register`) requieren autenticación.

### Headers Requeridos

```http
Authorization: Bearer <tu_jwt_token>
Content-Type: application/json
```

### Respuestas de Error Comunes

| Código | Significado |
|--------|-------------|
| `401` | Token ausente o inválido |
| `403` | Usuario no tiene permisos |
| `404` | Recurso no encontrado |
| `400` | Datos inválidos |
| `500` | Error interno del servidor |

---

## 📑 Tabla de Contenidos

1. [Autenticación](#autenticación)
2. [Usuarios](#usuarios)
3. [Productos](#productos)
4. [Clientes](#clientes)
5. [Proveedores](#proveedores)
6. [Categorías](#categorías)
7. [Ventas](#ventas)
8. [Gastos](#gastos)
9. [Alertas](#alertas)
10. [Dashboard](#dashboard)
11. [Reportes](#reportes)

---

## Autenticación

### POST `/auth/login`

Iniciar sesión y obtener token JWT.

**Body:**
```json
{
  "email": "usuario@empresa.com",
  "password": "contraseña_segura"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJl...",
    "expiresIn": 900,
    "usuario": {
      "id": 1,
      "email": "usuario@empresa.com",
      "nombre": "Juan",
      "apellido": "Pérez",
      "rol": "admin",
      "empresa_id": 1
    }
  },
  "message": "Login exitoso"
}
```

---

### POST `/auth/register`

Registrar nueva empresa y usuario admin.

**Body:**
```json
{
  "empresa": {
    "nombre": "Mi Empresa S.A.",
    "ruc": "12345678901",
    "direccion": "Av. Principal 123"
  },
  "usuario": {
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@empresa.com",
    "password": "contraseña_segura"
  }
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "empresa_id": 1,
    "usuario_id": 1,
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Registro exitoso"
}
```

---

### POST `/auth/refresh`

Refrescar token JWT.

**Headers:**
```http
Authorization: Bearer <refresh_token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  },
  "message": "Token refrescado"
}
```

---

## Productos

### GET `/productos`

Listar todos los productos de la empresa.

**Query Params:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `page` | number | Página (default: 1) |
| `limit` | number | Items por página (default: 20) |
| `sortBy` | string | Campo para ordenar (default: nombre) |
| `order` | ASC\|DESC | Orden (default: ASC) |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Producto A",
      "descripcion": "Descripción del producto",
      "sku": "PROD-001",
      "precio_costo": 10.00,
      "precio_venta": 15.00,
      "stock_actual": 100,
      "stock_minimo": 10,
      "estado": "activo",
      "categoria": {
        "id": 1,
        "nombre": "Electrónica"
      }
    }
  ],
  "message": "Productos listados exitosamente"
}
```

---

### GET `/productos/:id`

Obtener producto por ID.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Producto A",
    "precio_venta": 15.00,
    "stock_actual": 100,
    "categoria": {
      "id": 1,
      "nombre": "Electrónica"
    },
    "proveedor": {
      "id": 1,
      "nombre": "Proveedor XYZ"
    }
  }
}
```

**Response 404:**
```json
{
  "success": false,
  "message": "Producto no encontrado"
}
```

---

### POST `/productos`

Crear nuevo producto.

**Body:**
```json
{
  "nombre": "Nuevo Producto",
  "descripcion": "Descripción detallada",
  "sku": "PROD-002",
  "precio_costo": 12.00,
  "precio_venta": 18.00,
  "stock_minimo": 15,
  "categoria_id": 1,
  "proveedor_id": 1,
  "unidad_medida": "unidad"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "nombre": "Nuevo Producto",
    "precio_venta": 18.00,
    "stock_actual": 15,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Producto creado exitosamente"
}
```

**Response 400:**
```json
{
  "success": false,
  "message": "Nombre y precio de venta son requeridos",
  "errors": [
    { "field": "nombre", "message": "El nombre es requerido" },
    { "field": "precio_venta", "message": "El precio de venta es requerido" }
  ]
}
```

---

### PUT `/productos/:id`

Actualizar producto existente.

**Body:**
```json
{
  "nombre": "Producto Actualizado",
  "precio_venta": 20.00,
  "stock_minimo": 20
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Producto Actualizado",
    "precio_venta": 20.00,
    "updated_at": "2024-01-15T11:00:00Z"
  },
  "message": "Producto actualizado exitosamente"
}
```

---

### DELETE `/productos/:id`

Eliminar producto (borrado lógico).

**Response 200:**
```json
{
  "success": true,
  "data": {
    "mensaje": "Producto eliminado exitosamente"
  },
  "message": "Producto dado de baja correctamente"
}
```

---

### GET `/productos/buscar`

Búsqueda avanzada con filtros.

**Query Params:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `categoria_id` | number | Filtrar por categoría |
| `proveedor_id` | number | Filtrar por proveedor |
| `busqueda` | string | Buscar por nombre (LIKE) |
| `stock_bajo` | boolean | Productos con stock < mínimo |
| `sin_stock` | boolean | Productos con stock = 0 |
| `page` | number | Página |
| `limit` | number | Items por página |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "message": "Búsqueda completada exitosamente"
}
```

---

## Clientes

### GET `/clientes`

Listar clientes de la empresa.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Cliente ABC",
      "email": "cliente@abc.com",
      "telefono": "+51999999999",
      "direccion": "Av. Cliente 123",
      "estado": "activo"
    }
  ]
}
```

---

### POST `/clientes`

Crear nuevo cliente.

**Body:**
```json
{
  "nombre": "Nuevo Cliente",
  "email": "nuevo@cliente.com",
  "telefono": "+51999999999",
  "direccion": "Calle Nueva 456",
  "ruc": "20123456789"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "nombre": "Nuevo Cliente",
    "email": "nuevo@cliente.com"
  },
  "message": "Cliente creado exitosamente"
}
```

---

## Ventas

### POST `/ventas`

Registrar nueva venta.

**Body:**
```json
{
  "cliente_id": 1,
  "productos": [
    {
      "producto_id": 1,
      "cantidad": 2,
      "precio_unitario": 15.00
    },
    {
      "producto_id": 2,
      "cantidad": 1,
      "precio_unitario": 25.00
    }
  ],
  "descuento": 5.00,
  "notas": "Venta al contado"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "numero_venta": "VTA-2024-0001",
    "cliente_id": 1,
    "total": 50.00,
    "fecha_venta": "2024-01-15T12:00:00Z",
    "estado": "completada"
  },
  "message": "Venta registrada exitosamente"
}
```

---

### GET `/ventas`

Listar ventas con filtros.

**Query Params:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `fecha_desde` | date | Fecha inicio (YYYY-MM-DD) |
| `fecha_hasta` | date | Fecha fin (YYYY-MM-DD) |
| `estado` | string | completada\|pendiente\|cancelada |
| `cliente_id` | number | Filtrar por cliente |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "numero_venta": "VTA-2024-0001",
      "cliente": {
        "nombre": "Cliente ABC"
      },
      "total": 50.00,
      "estado": "completada",
      "fecha_venta": "2024-01-15T12:00:00Z"
    }
  ]
}
```

---

## Dashboard

### GET `/dashboard/resumen`

Obtener resumen ejecutivo del dashboard.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "ventas_hoy": 1250.00,
    "ventas_mes": 45000.00,
    "productos_stock_bajo": 15,
    "ventas_pendientes": 5,
    "clientes_nuevos_mes": 23,
    "grafico_ventas_7_dias": [
      { "fecha": "2024-01-09", "total": 5000 },
      { "fecha": "2024-01-10", "total": 6200 },
      { "fecha": "2024-01-11", "total": 4800 },
      { "fecha": "2024-01-12", "total": 7100 },
      { "fecha": "2024-01-13", "total": 8500 },
      { "fecha": "2024-01-14", "total": 6900 },
      { "fecha": "2024-01-15", "total": 6500 }
    ]
  }
}
```

---

## Alertas

### GET `/alertas`

Listar alertas del sistema.

**Query Params:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `estado` | string | pendiente\|leida\|archivada |
| `prioridad` | string | alta\|media\|baja |
| `tipo` | string | stock\|venta\|sistema |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titulo": "Stock bajo: Producto A",
      "mensaje": "El producto 'Producto A' tiene stock menor al mínimo",
      "tipo": "stock",
      "prioridad": "alta",
      "estado": "pendiente",
      "leido": false,
      "created_at": "2024-01-15T08:00:00Z"
    }
  ]
}
```

---

### PUT `/alertas/:id/leer`

Marcar alerta como leída.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "leido": true,
    "leido_at": "2024-01-15T14:00:00Z"
  },
  "message": "Alerta marcada como leída"
}
```

---

## Reportes

### GET `/reportes/ventas`

Reporte de ventas por período.

**Query Params:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `fecha_desde` | date | Requerido |
| `fecha_hasta` | date | Requerido |
| `agrupar_por` | string | dia\|semana\|mes |
| `formato` | string | json\|xlsx\|pdf |

**Response 200 (JSON):**
```json
{
  "success": true,
  "data": {
    "periodo": {
      "desde": "2024-01-01",
      "hasta": "2024-01-31"
    },
    "total_ventas": 125000.00,
    "total_transacciones": 450,
    "promedio_por_venta": 277.78,
    "por_categoria": [
      {
        "categoria": "Electrónica",
        "total": 75000.00,
        "porcentaje": 60
      },
      {
        "categoria": "Ropa",
        "total": 50000.00,
        "porcentaje": 40
      }
    ]
  }
}
```

---

## 📝 Errores Comunes y Soluciones

### Error 401 - Unauthorized

**Causa:** Token expirado o inválido  
**Solución:** Refrescar token o volver a loguearse

```json
{
  "success": false,
  "message": "Token inválido o expirado"
}
```

### Error 403 - Forbidden

**Causa:** Usuario no tiene permisos para el recurso  
**Solución:** Verificar rol del usuario

```json
{
  "success": false,
  "message": "No tienes permisos para realizar esta acción"
}
```

### Error 404 - Not Found

**Causa:** Recurso no existe o no pertenece a la empresa  
**Solución:** Verificar ID y empresa_id

```json
{
  "success": false,
  "message": "Recurso no encontrado"
}
```

### Error 400 - Bad Request

**Causa:** Datos inválidos en el body  
**Solución:** Revisar campo `errors` para detalles

```json
{
  "success": false,
  "message": "Datos inválidos",
  "errors": [
    { "field": "email", "message": "Email inválido" },
    { "field": "precio", "message": "Debe ser mayor a 0" }
  ]
}
```

---

## 🔧 Rate Limiting

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| `/auth/login` | 5 req | 15 min |
| `/auth/register` | 3 req | 1 hora |
| API General | 100 req | 1 min |

**Response 429:**
```json
{
  "success": false,
  "message": "Demasiadas solicitudes, intenta de nuevo más tarde",
  "retryAfter": 60
}
```

---

## 📞 Soporte

Para reportar bugs o solicitar nuevos endpoints:

- **GitHub Issues**: https://github.com/sapyme/api/issues
- **Email**: soporte@sapyme.com
- **Slack**: #api-support

---

**Versión**: 3.2.0  
**Última actualización**: 2024  
**Mantenido por**: Equipo de Desarrollo SaPyme
