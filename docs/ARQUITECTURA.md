# 📚 ARQUITECTURA DEL SISTEMA - SaPyme

## Visión General

SaPyme es un sistema de gestión empresarial (ERP) multi-tenant diseñado para PYMEs, construido con arquitectura modular y escalable.

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTES                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │   Web    │  │  Móvil   │  │   API    │                  │
│  │  (React) │  │(React Nat)│  │Externa  │                  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                  │
└───────┼─────────────┼─────────────┼─────────────────────────┘
        │             │             │
        └─────────────┼─────────────┘
                      │ HTTPS/REST
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY                               │
│         • Autenticación JWT                                 │
│         • Rate Limiting                                     │
│         • Logging & Monitoreo                               │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND (Node.js + TypeScript)               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   CONTROLADORES                      │    │
│  │  • productoController.ts  • clienteController.ts    │    │
│  │  • ventaController.ts     • authController.ts       │    │
│  │  • dashboardController.ts • reporteController.ts    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    SERVICIOS                         │    │
│  │  • Lógica de negocio                                │    │
│  │  • Validaciones complejas                           │    │
│  │  • Orquestación de operaciones                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   MODELOS (Sequelize ORM)            │    │
│  │  • Usuario       • Producto      • Venta            │    │
│  │  • Cliente       • Proveedor     • Gasto            │    │
│  │  • Categoria     • Alerta        • Movimiento       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  EVENT BUS (Domain Events)           │    │
│  │  • PRODUCT_CREATED    • VENTA_COMPLETADA            │    │
│  │  • STOCK_BAJO         • USUARIO_NUEVO               │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS                             │
│                    PostgreSQL 15+                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Tablas     │  │  Índices    │  │  Vistas     │         │
│  │  Core       │  │  Optimizados│  │  Material.  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICIOS EXTERNOS                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Stripe  │  │  SendGrid│  │   AWS S3 │  │  Redis   │   │
│  │(Pagos)   │  │ (Email)  │  │(Archivos)│  │ (Cache)  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Estructura del Proyecto

```
/workspace
├── backend/
│   ├── src/
│   │   ├── controllers/       # Controladores HTTP (TypeScript)
│   │   ├── services/          # Lógica de negocio
│   │   ├── models/            # Modelos de base de datos
│   │   ├── middleware/        # Middleware (auth, validation, error handling)
│   │   ├── routes/            # Definición de rutas
│   │   ├── interfaces/        # Interfaces TypeScript
│   │   ├── types/             # Tipos y DTOs
│   │   ├── utils/             # Utilidades comunes
│   │   ├── domains/           # Dominios del negocio (DDD)
│   │   │   ├── core/          # Dominio core
│   │   │   ├── ventas/        # Dominio de ventas
│   │   │   ├── inventario/    # Dominio de inventario
│   │   │   └── eventBus/      # Sistema de eventos
│   │   └── server.ts          # Punto de entrada
│   ├── tests/                 # Tests unitarios y de integración
│   ├── database/
│   │   └── migrations/        # Migraciones de base de datos
│   ├── docs/                  # Documentación
│   ├── tsconfig.json          # Configuración TypeScript
│   └── package.json
├── frontend/
├── mobile/
└── database/
    └── migrations/
```

## 🔑 Principios de Diseño

### 1. **Multi-Tenancy**
- Cada empresa tiene sus datos aislados por `empresa_id`
- Todos los queries incluyen `WHERE empresa_id = ?`
- Índices compuestos optimizados para este patrón

### 2. **Domain-Driven Design (DDD)**
- Separación clara por dominios: Core, Ventas, Inventario, Finanzas
- Event Bus para comunicación entre dominios
- Agregados y entidades bien definidas

### 3. **Clean Architecture**
- Controladores delgados, servicios gruesos
- Dependencias apuntan hacia adentro
- Testing fácil en cada capa

### 4. **Security First**
- JWT para autenticación
- RBAC (Role-Based Access Control)
- Validación de entrada en todos los endpoints
- Rate limiting y protección contra ataques comunes

## 📊 Modelo de Datos Principal

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   EMPRESA   │       │   USUARIO   │       │    ROL      │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │◄──────│ empresa_id  │       │ id          │
│ nombre      │       │ email       │───────│ nombre      │
│ plan        │       │ rol_id      │       │ permisos    │
└─────────────┘       └─────────────┘       └─────────────┘
                             
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  CATEGORIA  │       │   PRODUCTO  │       │  PROVEEDOR  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │◄──────│ categoria_id│       │ id          │
│ empresa_id  │       │ empresa_id  │───────│ empresa_id  │
│ nombre      │       │ nombre      │       │ nombre      │
│ padre_id    │       │ precio      │       │ contacto    │
└─────────────┘       │ stock       │       └─────────────┘
                      └─────────────┘
                             
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   CLIENTE   │       │    VENTA    │       │ DETALLE_VTA │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │◄──────│ cliente_id  │───────│ venta_id    │
│ empresa_id  │       │ empresa_id  │       │ producto_id │
│ nombre      │       │ total       │       │ cantidad    │
│ email       │       │ estado      │       │ precio      │
└─────────────┘       │ fecha       │       └─────────────┘
                      └─────────────┘
```

## 🔄 Flujo de una Request Típica

```
1. Cliente → POST /api/productos
              ↓
2. Express Router → ruta definida
              ↓
3. Auth Middleware → valida JWT y extrae usuario
              ↓
4. Validation Middleware → valida body con express-validator
              ↓
5. Controller → recibe request tipada
              ↓
6. Service → ejecuta lógica de negocio
              ↓
7. Model → opera sobre base de datos
              ↓
8. Event Bus → publica evento PRODUCT_CREATED
              ↓
9. Controller → retorna ApiResponse tipada
              ↓
10. Cliente ← JSON response
```

## 🛡️ Seguridad

### Autenticación
- JWT con refresh tokens
- Tokens rotativos cada 15 minutos
- Blacklist de tokens revocados en Redis

### Autorización
- Roles: admin, gerente, vendedor, inventario
- Permisos granulares por endpoint
- Validación de propiedad de recursos

### Protección
- Rate limiting: 100 req/min por IP
- Helmet.js para headers de seguridad
- CORS configurado estrictamente
- SQL injection prevention (Sequelize ORM)
- XSS protection

## 📈 Escalabilidad

### Horizontal
- Stateless design → múltiples instancias
- Redis para sesiones compartidas
- Load balancer (Nginx/AWS ALB)

### Vertical
- Query optimization con índices
- Connection pooling (pgBouncer)
- Cache estratégico en Redis

### Base de Datos
- Read replicas para consultas
- Particionamiento por empresa_id (futuro)
- Archiving de datos históricos

## 🧪 Testing Strategy

```
┌─────────────────────────────────────────┐
│           Pirámide de Testing            │
│                                          │
│              /¯¯¯¯¯\                     │
│             / E2E   \     10%            │
│            /¯¯¯¯¯¯¯¯¯\                   │
│           /Integration\   30%            │
│          /¯¯¯¯¯¯¯¯¯¯¯¯¯\                 │
│         /    Unitarios   \  60%          │
│        /¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯\               │
└─────────────────────────────────────────┘
```

- **Unitarios**: Jest + supertest para controladores
- **Integración**: Tests con base de datos real (test DB)
- **E2E**: Cypress/Playwright para flujos completos

## 📝 Convenciones de Código

### Naming
- Archivos: `camelCase.ts` (controladores, servicios)
- Clases: `PascalCase`
- Interfaces: `PascalCase` con sufijo opcional `DTO`, `Response`
- Constantes: `UPPER_SNAKE_CASE`

### Respuestas API
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
  pagination?: PaginationInfo;
}
```

### Manejo de Errores
```typescript
try {
  // operación
} catch (error) {
  logger.error('Contexto', error);
  throw new AppError('Mensaje amigable', statusCode);
}
```

## 🚀 Deployment

### Entornos
- **Development**: Local con Docker Compose
- **Staging**: Réplica exacta de producción
- **Production**: AWS/GCP con auto-scaling

### CI/CD Pipeline
```
Git Push → Tests → Build → Security Scan → Deploy Staging → 
Tests E2E → Aprobación → Deploy Production → Smoke Tests
```

### Health Checks
- `/health` → Estado básico
- `/health/db` → Conexión a BD
- `/health/cache` → Conexión a Redis
- `/ready` → Listo para tráfico

---

**Versión**: 3.2.0  
**Última actualización**: 2024  
**Mantenido por**: Equipo de Desarrollo SaPyme
