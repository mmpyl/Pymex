# Plan de Limpieza de Migración DDD

## Problema Identificado
- Modelos duplicados: legacy (`src/models/`) y domains (`src/domains/*/models/`)
- Asociaciones de Sequelize definidas en múltiples lugares
- Deuda técnica activa: cambios en un lado no se reflejan en el otro
- Evidencia: comentarios FIX dispersos en el código

## Estado Actual

### Modelos Legacy (src/models/)
- 31 archivos de modelos + index.js
- Todas las asociaciones centralizadas en index.js

### Modelos por Dominio
- **AUTH** (6 modelos): Usuario, Rol, Permiso, RolPermiso, UsuarioAdmin, RevokedToken
- **CORE** (15 modelos): Empresa, Producto, Categoria, Cliente, Proveedor, Venta, DetalleVenta, Gasto, MovimientoInventario, Alerta, AuditLog, ApiKey, Rubro, RubroFeature, EmpresaRubro
- **BILLING** (9 modelos): Plan, Feature, PlanFeature, PlanLimit, Suscripcion, FeatureOverride, Pago, PaymentEvent, Comprobante

### Modelo No Migrado
- `AuditoriaAdmin.js` - Solo existe en legacy, usado en controllers

## Estrategia de Limpieza

### Fase 1: Completar Migración
1. Mover `AuditoriaAdmin.js` a `src/domains/auth/models/` (es un modelo de auditoría de admin)
2. Actualizar `src/domains/auth/models/index.js` para incluirlo

### Fase 2: Eliminar Archivos Legacy
1. Eliminar todos los archivos de modelos individuales en `src/models/` (excepto index.js temporalmente)
2. Eliminar `src/models/index.js`

### Fase 3: Crear Facade Legacy para Compatibilidad
1. Crear nuevo `src/models/index.js` que re-exporte desde los dominios
2. Esto mantiene compatibilidad con código existente mientras se migra gradualmente

### Fase 4: Actualizar Referencias Gradualmente
1. Middleware y routes que usan `../models` pueden seguir funcionando con el facade
2. Migrar progresivamente a imports directos de dominios

### Fase 5: Eliminar Facade Legacy
1. Cuando todo el código use imports de dominios, eliminar `src/models/` completamente

## Implementación

```bash
# 1. Mover AuditoriaAdmin
mv src/models/AuditoriaAdmin.js src/domains/auth/models/

# 2. Eliminar modelos legacy (manteniendo index.js temporalmente)
rm src/models/*.js  # Excepto si hay algo único

# 3. Crear facade legacy
# Ver archivo: src/models/index.js (nuevo)
```

## Cross-Domain Associations
Las asociaciones entre dominios deben manejarse cuidadosamente:
- AUTH ↔ CORE: Usuario-Empresa (referencia por ID, sin relación directa)
- CORE ↔ BILLING: Empresa-Plan/Suscripcion (referencia por ID)
- Usar eventos de dominio para comunicación cruzada

## Beneficios
- Single Source of Truth para cada modelo
- Límites de dominio claros
- Menor acoplamiento
- Más fácil mantener y evolucionar
