# Fase 1: Modularización Interna con Domain-Driven Design (DDD)

## Resumen Ejecutivo

Este documento describe la implementación de la **Fase 1** del plan para mitigar el riesgo técnico del monolito backend, mediante la separación lógica de componentes usando Domain-Driven Design (DDD).

## Dominios Identificados

### 1. **Dominio AUTH** (Autenticación y Autorización)
- **Responsabilidades**: Login, registro, gestión de sesiones, RBAC (roles y permisos)
- **Modelos**: Usuario, Rol, Permiso, UsuarioAdmin, RevokedToken
- **APIs expuestas**: `/api/auth/*`, `/api/rbac/*`
- **Dependencias**: Ninguna (dominio base)

### 2. **Dominio BILLING** (Facturación y Pagos)
- **Responsabilidades**: Planes, suscripciones, pagos, facturación electrónica, feature flags
- **Modelos**: Plan, Feature, Suscripcion, Pago, Comprobante, PaymentEvent
- **APIs expuestas**: `/api/saas/*`, `/api/pagos/*`, `/api/facturacion/*`, `/api/features/*`
- **Dependencias**: AUTH (solo consulta de estado)

### 3. **Dominio ML** (Machine Learning Orchestration)
- **Responsabilidades**: Predicciones, modelos predictivos, análisis de tendencias
- **Modelos**: Prediccion, ModeloML (futuro), Entrenamiento (futuro)
- **APIs expuestas**: `/api/ml/*`
- **Dependencias**: CORE (solo lectura de datos históricos)

### 4. **Dominio CORE** (Negocio Principal)
- **Responsabilidades**: Gestión de empresas, productos, ventas, clientes, inventario
- **Modelos**: Empresa, Producto, Venta, Cliente, Proveedor, Inventario, etc.
- **APIs expuestas**: `/api/productos/*`, `/api/ventas/*`, `/api/inventario/*`, etc.
- **Dependencias**: AUTH (verificación de tenant), BILLING (verificación de features)

## Estructura de Directorios Implementada

```
backend/src/
├── domains/
│   ├── domainBoundaries.js      # Definición de límites entre dominios
│   ├── eventBus.js              # Bus de eventos para comunicación asíncrona
│   │
│   ├── auth/
│   │   ├── models/
│   │   │   └── index.js         # Modelos del dominio AUTH
│   │   ├── services/            # Servicios de autenticación
│   │   ├── controllers/         # Controladores de auth
│   │   └── routes/              # Rutas de auth
│   │
│   ├── billing/
│   │   ├── models/
│   │   │   └── index.js         # Modelos del dominio BILLING
│   │   ├── services/            # Servicios de billing
│   │   ├── controllers/         # Controladores de billing
│   │   └── routes/              # Rutas de billing
│   │
│   ├── ml/
│   │   ├── models/
│   │   │   └── index.js         # Modelos del dominio ML
│   │   ├── services/            # Servicios de ML
│   │   ├── controllers/         # Controladores de ML
│   │   └── routes/              # Rutas de ML
│   │
│   └── core/
│       ├── models/
│       │   └── index.js         # Modelos del dominio CORE
│       ├── services/            # Servicios del core
│       ├── controllers/         # Controladores del core
│       └── routes/              # Rutas del core
│
├── models/                      # Legacy (se mantendrá durante transición)
├── controllers/                 # Legacy (se migrará gradualmente)
├── routes/                      # Legacy (se migrará gradualmente)
└── services/                    # Legacy (se migrará gradualmente)
```

## Reglas de Acoplamiento

### ✅ Permitido
- Relaciones entre modelos **dentro del mismo dominio**
- Consultas de solo lectura a dominios permitidos según configuración
- Comunicación mediante **eventos asíncronos** entre dominios
- Referencias por ID a entidades de otros dominios (sin JOINs)

### ❌ No Permitido
- **JOINs directos** entre tablas de diferentes dominios
- Relaciones de Sequelize que crucen límites de dominio
- Importación directa de modelos entre dominios
- Dependencias circulares entre dominios

## Matriz de Dependencias

| Dominio Origen | Puede depender de | Tipo de dependencia |
|---------------|-------------------|---------------------|
| AUTH          | -                 | Ninguna             |
| BILLING       | AUTH              | Solo consulta       |
| ML            | CORE              | Solo lectura        |
| CORE          | AUTH, BILLING     | Verificación        |

## Eventos de Dominio

### AUTH Events
- `USER_CREATED` - Nuevo usuario registrado
- `USER_AUTHENTICATED` - Usuario autenticado
- `PERMISSION_CHANGED` - Permisos modificados

### BILLING Events
- `SUBSCRIPTION_ACTIVATED` - Suscripción activada
- `SUBSCRIPTION_CANCELLED` - Suscripción cancelada
- `PAYMENT_COMPLETED` - Pago completado
- `PAYMENT_FAILED` - Pago fallido
- `COMPANY_SUSPENDED` - Empresa suspendida

### CORE Events
- `COMPANY_CREATED` - Nueva empresa
- `SALE_COMPLETED` - Venta completada
- `INVENTORY_UPDATED` - Inventario actualizado
- `USAGE_THRESHOLD_REACHED` - Umbral alcanzado

### ML Events
- `PREDICTION_GENERATED` - Predicción generada
- `MODEL_TRAINED` - Modelo entrenado
- `ANOMALY_DETECTED` - Anomalía detectada

## Migración de Modelos

Los siguientes modelos han sido copiados a sus respectivos dominios:

### Dominio CORE (15 modelos)
- Empresa, Producto, Categoria, Cliente, Proveedor
- Venta, DetalleVenta, Gasto, MovimientoInventario
- Alerta, AuditLog, ApiKey
- Rubro, RubroFeature, EmpresaRubro

### Dominio AUTH (6 modelos)
- Usuario, Rol, Permiso, RolPermiso
- UsuarioAdmin, RevokedToken

### Dominio BILLING (9 modelos)
- Plan, Feature, PlanFeature, PlanLimit
- Suscripcion, FeatureOverride
- Pago, PaymentEvent, Comprobante

### Dominio ML (0 modelos actuales)
- Prediccion (pendiente de crear)

## Próximos Pasos (Fase 2)

1. **Actualizar controladores existentes** para usar los nuevos índices de modelos por dominio
2. **Implementar listeners de eventos** para reemplazar JOINs cruzados
3. **Crear servicios de aplicación** que orquesten operaciones entre dominios
4. **Establecer API Gateway** para enrutar tráfico según dominio
5. **Extraer primer servicio independiente** (recomendado: ML Orchestration)

## Métricas de Éxito

- [ ] Todos los modelos organizados por dominio
- [ ] Cero JOINs directos entre dominios en nuevas implementaciones
- [ ] 100% de comunicación cross-domain mediante eventos
- [ ] Documentación actualizada de límites de dominio
- [ ] Tests de integración verificando límites de dominio

## Referencias

- [Domain-Driven Design Fundamentals](https://martinfowler.com/tags/domain-driven-design.html)
- [Microservices Architecture Pattern](https://microservices.io/patterns/microservices.html)
- [Event-Driven Architecture](https://www.enterpriseintegrationpatterns.com/patterns/messaging/EventDrivenConsumer.html)
