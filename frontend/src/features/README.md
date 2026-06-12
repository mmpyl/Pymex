# Migración a Arquitectura DDD - Frontend

## Estructura de Directorios

La migración sigue el patrón **Domain-Driven Design (DDD)** con la siguiente estructura por feature:

```
features/
└── {feature}/
    ├── domain/           # Capa de Dominio
    │   ├── entities.js   # Entidades y objetos de valor del dominio
    │   └── repository.js # Interfaces de repositorio (contratos)
    ├── application/      # Capa de Aplicación
    │   └── service.js    # Servicios de aplicación (lógica de negocio)
    ├── infrastructure/   # Capa de Infraestructura
    │   └── repository.js # Implementación de repositorios (API calls)
    ├── presentation/     # Capa de Presentación
    │   └── Component.jsx # Componentes React
    └── index.js          # Punto de exportación del módulo
```

## Features Migrados

### ✅ Dashboard
- **Entities**: `ResumenDashboard`, `SerieFinanciera`, `ProductoPopular`, `Alerta`, `KPIDashboard`
- **Repository**: `DashboardRepository` (interface), `DashboardAPIRepository` (implementación)
- **Service**: `DashboardService` con métodos `loadDashboardData()`, `calculateKPIs()`, `calculateSerieFinanciera()`
- **Component**: `Dashboard.jsx` refactorizado

### ✅ Ventas
- **Entities**: `Venta`, `ItemVenta`, `ClienteVenta`, `ResumenVentas`
- **Repository**: `VentasRepository` (interface), `VentasAPIRepository` (implementación)
- **Service**: `VentasService` con métodos `loadVentasData()`, `registrarVenta()`, `calcularTotal()`, `filtrarVentas()`
- **Component**: `Ventas.jsx` refactorizado

## Features Pendientes de Migrar

Los siguientes features tienen la estructura de directorios creada pero requieren implementación:

1. **Inventario** (`/features/inventario/`)
2. **Gastos** (`/features/gastos/`)
3. **Facturación** (`/features/facturacion/`)
4. **Reportes** (`/features/reportes/`)
5. **Alertas** (`/features/alertas/`)
6. **Predicciones** (`/features/predicciones/`)

## Cómo Usar los Módulos Migrados

### Ejemplo: Dashboard

```jsx
// En tu archivo de rutas o layout principal
import { DashboardComponent } from '@/features/dashboard';

// O usar directamente el componente de presentación
import Dashboard from '@/features/dashboard/presentation/Dashboard.jsx';
```

### Ejemplo: Ventas

```jsx
import { VentasComponent } from '@/features/ventas';
// o
import Ventas from '@/features/ventas/presentation/Ventas.jsx';
```

## Beneficios de esta Arquitectura

1. **Separación de responsabilidades**: Cada capa tiene un propósito claro
2. **Testabilidad**: Los servicios de aplicación son fáciles de testear
3. **Mantenibilidad**: El código está organizado por feature, no por tipo técnico
4. **Independencia de frameworks**: El dominio no depende de React ni de la API
5. **Escalabilidad**: Nuevos features siguen el mismo patrón

## Próximos Pasos

1. Migrar los 6 features restantes siguiendo el mismo patrón
2. Actualizar el router para usar los nuevos componentes
3. Agregar tests unitarios para servicios y entidades
4. Considerar la creación de un README específico por feature
