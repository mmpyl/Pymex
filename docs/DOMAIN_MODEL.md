/**
 * Modelo de Dominio - SaPyme
 * Documentación del Domain Model basado en DDD (Domain-Driven Design)
 */

# 🏛️ MODELO DE DOMINIO - SaPyme

## Visión General del Dominio

SaPyme es un sistema ERP multi-tenant que gestiona operaciones comerciales de PYMEs. El dominio se divide en **4 Bounded Contexts** principales:

```
┌─────────────────────────────────────────────────────────────┐
│                    SaPyme Domain                             │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    CORE      │  │   VENTAS     │  │  INVENTARIO  │      │
│  │              │  │              │  │              │      │
│  │ • Empresas   │  │ • Ventas     │  │ • Productos  │      │
│  │ • Usuarios   │  │ • Clientes   │  │ • Stock      │      │
│  │ • Roles      │  │ • Pedidos    │  │ • Movimientos│      │
│  │ • Auth       │  │ • Facturación│  │ • Alertas    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│              ┌──────────────┐                               │
│              │  FINANZAS    │                               │
│              │              │                               │
│              │ • Gastos     │                               │
│              │ • Proveedores│                               │
│              │ • Reportes   │                               │
│              └──────────────┘                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. CORE DOMAIN

### Contexto: Gestión de Empresas y Usuarios

#### Entidades Principales

**Empresa** (Aggregate Root)
```typescript
interface Empresa {
  id: number;
  nombre: string;
  ruc: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  estado: 'activo' | 'inactivo' | 'suspendido';
  fecha_creacion: Date;
  configuracion: ConfiguracionEmpresa;
}

interface ConfiguracionEmpresa {
  moneda: string;
  zona_horaria: string;
  idioma: string;
  logo_url?: string;
}
```

**Usuario** (Entity)
```typescript
interface Usuario {
  id: number;
  empresa_id: number;
  email: string;
  password_hash: string;
  nombre: string;
  apellido: string;
  rol: Rol;
  estado: 'activo' | 'inactivo';
  ultimo_acceso?: Date;
  created_at: Date;
  updated_at: Date;
}
```

**Rol** (Value Object)
```typescript
type Rol = 'admin' | 'gerente' | 'vendedor' | 'inventario' | 'contador';

interface Permiso {
  recurso: string;
  acciones: ('crear' | 'leer' | 'actualizar' | 'eliminar')[];
}
```

#### Reglas de Negocio

1. **Multi-Tenancy**: Cada usuario pertenece exactamente a una empresa
2. **Isolación**: Usuarios de empresa A no pueden acceder a datos de empresa B
3. **Jerarquía de Roles**: Admin > Gerente > Vendedor/Inventario
4. **Email Único**: Email debe ser único dentro de la misma empresa

#### Eventos de Dominio

```typescript
// Cuando se crea empresa
EmpresaCreada {
  empresa_id: number;
  nombre: string;
  admin_usuario_id: number;
  timestamp: Date;
}

// Cuando se invita usuario
UsuarioInvitado {
  empresa_id: number;
  email: string;
  rol: Rol;
  invitado_por: number;
}

// Cuando usuario acepta invitación
UsuarioActivado {
  usuario_id: number;
  empresa_id: number;
}
```

---

## 2. VENTAS DOMAIN

### Contexto: Gestión de Ventas y Clientes

#### Entidades Principales

**Cliente** (Aggregate Root)
```typescript
interface Cliente {
  id: number;
  empresa_id: number;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ruc?: string;
  tipo: 'natural' | 'juridico';
  estado: 'activo' | 'inactivo';
  credito_limite?: number;
  saldo_pendiente: number;
}
```

**Venta** (Aggregate Root)
```typescript
interface Venta {
  id: number;
  empresa_id: number;
  numero_venta: string;  // VTA-2024-00001
  cliente_id: number;
  fecha_venta: Date;
  estado: 'pendiente' | 'completada' | 'cancelada' | 'reembolsada';
  
  detalles: DetalleVenta[];
  
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
  
  metodo_pago?: 'efectivo' | 'tarjeta' | 'transferencia' | 'credito';
  notas?: string;
  created_por: number;
}

interface DetalleVenta {
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}
```

#### Reglas de Negocio

1. **Secuencia Numérica**: Número de venta debe ser consecutivo por empresa
2. **Stock Validación**: No se puede vender más stock del disponible
3. **Precio Mínimo**: Precio de venta no puede ser menor al costo (configurable)
4. **Cliente Activo**: Solo se puede vender a clientes activos
5. **Inmutabilidad**: Venta completada no puede modificarse, solo anularse

#### Servicios de Dominio

```typescript
interface CalculadoraVentaService {
  calcularSubtotal(detalles: DetalleVenta[]): number;
  calcularImpuesto(subtotal: number, tasa: number): number;
  aplicarDescuento(total: number, descuento: number): number;
  validarStock(productos: ProductoDetalle[]): boolean;
}

interface GeneradorNumeroVentaService {
  generar(empresa_id: number): string;  // VTA-YYYY-NNNNN
}
```

#### Eventos de Dominio

```typescript
// Venta creada
VentaRegistrada {
  venta_id: number;
  empresa_id: number;
  cliente_id: number;
  total: number;
  productos_count: number;
}

// Venta completada
VentaCompletada {
  venta_id: number;
  metodo_pago: string;
  monto_pagado: number;
}

// Stock reservado para venta
StockReservado {
  producto_id: number;
  cantidad_reservada: number;
  venta_id: number;
}

// Venta cancelada (revertir stock)
VentaCancelada {
  venta_id: number;
  razon: string;
  stock_revertido: Array<{producto_id: number, cantidad: number}>;
}
```

---

## 3. INVENTARIO DOMAIN

### Contexto: Gestión de Productos y Stock

#### Entidades Principales

**Producto** (Aggregate Root)
```typescript
interface Producto {
  id: number;
  empresa_id: number;
  categoria_id?: number;
  nombre: string;
  descripcion?: string;
  sku: string;  // Unique per empresa
  codigo_barras?: string;
  
  precios: PreciosProducto;
  
  stock: StockProducto;
  
  unidad_medida: string;
  estado: 'activo' | 'inactivo';
  
  proveedor_id?: number;
  imagen_url?: string;
}

interface PreciosProducto {
  costo: number;
  venta: number;
  margen: number;  // calculado
}

interface StockProducto {
  actual: number;
  minimo: number;
  maximo?: number;
  reservado: number;
  disponible: number;  // calculado: actual - reservado
}
```

**Categoria** (Entity)
```typescript
interface Categoria {
  id: number;
  empresa_id: number;
  nombre: string;
  categoria_padre_id?: number;  // Para jerarquía
  nivel: number;
}
```

**MovimientoInventario** (Entity)
```typescript
interface MovimientoInventario {
  id: number;
  empresa_id: number;
  producto_id: number;
  tipo: 'entrada' | 'salida' | 'ajuste' | 'reserva' | 'liberacion';
  cantidad: number;
  stock_anterior: number;
  stock_nuevo: number;
  motivo: string;
  referencia_tipo?: 'venta' | 'compra' | 'devolucion';
  referencia_id?: number;
  created_por: number;
  fecha_movimiento: Date;
}
```

#### Reglas de Negocio

1. **SKU Único**: SKU debe ser único por empresa
2. **Precio Positivo**: Costo y venta deben ser > 0
3. **Stock No Negativo**: Stock actual nunca puede ser negativo
4. **Alerta Stock Bajo**: Cuando stock_actual <= stock_minimo
5. **Trazabilidad**: Todo movimiento debe quedar registrado

#### Servicios de Dominio

```typescript
interface GestionStockService {
  agregarStock(producto_id: number, cantidad: number, motivo: string): void;
  removerStock(producto_id: number, cantidad: number, motivo: string): void;
  reservarStock(producto_id: number, cantidad: number, venta_id: number): void;
  liberarStockReservado(producto_id: number, cantidad: number): void;
  verificarStockDisponible(producto_id: number, cantidad: number): boolean;
}

interface CalculadoraValorInventarioService {
  calcularValorTotal(empresa_id: number): number;
  calcularValorPorCategoria(empresa_id: number): Map<number, number>;
  calcularRotacion(producto_id: number, periodo_dias: number): number;
}
```

#### Eventos de Dominio

```typescript
// Producto creado
ProductoCreado {
  producto_id: number;
  empresa_id: number;
  nombre: string;
  sku: string;
  stock_inicial: number;
}

// Stock actualizado
StockActualizado {
  producto_id: number;
  cambio: number;  // positivo o negativo
  nuevo_stock: number;
  motivo: string;
}

// Alerta de stock bajo
StockBajoAlerta {
  producto_id: number;
  empresa_id: number;
  stock_actual: number;
  stock_minimo: number;
  diferencia: number;
}

// Movimiento registrado
MovimientoRegistrado {
  movimiento_id: number;
  producto_id: number;
  tipo: string;
  cantidad: number;
}
```

---

## 4. FINANZAS DOMAIN

### Contexto: Gestión de Gastos y Proveedores

#### Entidades Principales

**Proveedor** (Aggregate Root)
```typescript
interface Proveedor {
  id: number;
  empresa_id: number;
  nombre: string;
  contacto_nombre?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ruc?: string;
  estado: 'activo' | 'inactivo';
  condicion_pago?: 'contado' | 'credito_7' | 'credito_15' | 'credito_30';
}
```

**Gasto** (Aggregate Root)
```typescript
interface Gasto {
  id: number;
  empresa_id: number;
  categoria_id: number;
  proveedor_id?: number;
  descripcion: string;
  monto: number;
  fecha_gasto: Date;
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia';
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'pagado';
  comprobante_url?: string;
  created_por: number;
  aprobado_por?: number;
}
```

**CategoriaGasto** (Entity)
```typescript
interface CategoriaGasto {
  id: number;
  empresa_id: number;
  nombre: string;
  tipo: 'fijo' | 'variable';
  presupuesto_mensual?: number;
}
```

#### Reglas de Negocio

1. **Aprobación Requerida**: Gastos > $X requieren aprobación de gerente
2. **Comprobante**: Gastos > $Y requieren comprobante obligatorio
3. **Presupuesto**: Alertar si gasto mensual supera presupuesto categoría
4. **Proveedor Activo**: Solo se puede gastar con proveedores activos

#### Eventos de Dominio

```typescript
// Gasto registrado
GastoRegistrado {
  gasto_id: number;
  empresa_id: number;
  monto: number;
  categoria: string;
}

// Gasto aprobado
GastoAprobado {
  gasto_id: number;
  aprobado_por: number;
  fecha_aprobacion: Date;
}

// Presupuesto excedido
PresupuestoExcedido {
  categoria_id: number;
  empresa_id: number;
  presupuesto: number;
  gastado_acumulado: number;
  porcentaje_excedido: number;
}
```

---

## RELACIONES ENTRE CONTEXTOS

### Context Mapping

```
┌─────────────┐         ┌─────────────┐
│    CORE     │◄────────│   VENTAS    │
│             │  ACL    │             │
│  Empresa    │         │   Venta     │
│  Usuario    │         │   Cliente   │
└─────────────┘         └──────┬──────┘
        ▲                      │
        │                      │ Publica
        │                      ▼
┌─────────────┐         ┌─────────────┐
│  FINANZAS   │         │ INVENTARIO  │
│             │    ────►│             │
│   Gasto     │  ACL    │   Producto  │
│  Proveedor  │         │    Stock    │
└─────────────┘         └─────────────┘
```

### Tipos de Relación

| Contexto A | Contexto B | Tipo | Descripción |
|------------|------------|------|-------------|
| Core | Ventas | ACL | Ventas usa Usuario de Core como "created_por" |
| Ventas | Inventario | Partnership | Venta consume stock, Inventario notifica stock bajo |
| Inventario | Ventas | Published Language | Evento StockBajoAlerta consumido por Ventas |
| Finanzas | Core | ACL | Gastos referencia Usuario que creó |
| Finanzas | Inventario | ACL | Proveedor relacionado con Productos |

---

## PATRONES DE DDD IMPLEMENTADOS

### 1. Aggregate Roots
- `Empresa` - Raíz de Core
- `Venta` - Raíz de Ventas
- `Producto` - Raíz de Inventario
- `Gasto` - Raíz de Finanzas

### 2. Entities vs Value Objects

**Entities** (tienen identidad propia):
- Usuario, Cliente, Producto, Venta, Gasto

**Value Objects** (se definen por sus atributos):
- `Rol`, `PreciosProducto`, `StockProducto`, `Direccion`

### 3. Domain Services
- `CalculadoraVentaService`
- `GestionStockService`
- `CalculadoraValorInventarioService`
- `GeneradorNumeroVentaService`

### 4. Domain Events
Todos los eventos listados anteriormente siguen el patrón:
```typescript
interface DomainEvent {
  event_id: string;      // UUID
  occurred_on: Date;     // Timestamp
  aggregate_id: number;  // ID del aggregate que generó el evento
}
```

### 5. Repositories
Cada Aggregate Root tiene su repository:
```typescript
interface ProductoRepository {
  findById(id: number, empresa_id: number): Promise<Producto | null>;
  findAll(empresa_id: number, filtros: Filtros): Promise<Producto[]>;
  save(producto: Producto): Promise<void>;
  delete(producto: Producto): Promise<void>;
}
```

### 6. Factory Pattern
Para creación compleja de aggregates:
```typescript
interface VentaFactory {
  crearDesdeCarrito(
    cliente_id: number,
    items: CarritoItem[],
    usuario_id: number
  ): Venta;
}
```

---

## DIAGRAMA ER COMPLETO

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   EMPRESA    │       │    USUARIO   │       │      ROL     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │◄──────│ empresa_id   │       │ id (PK)      │
│ nombre       │       │ email        │───────│ nombre       │
│ ruc          │       │ password     │       │ permisos     │
│ plan         │       │ rol_id       │       └──────────────┘
│ estado       │       │ estado       │
└──────────────┘       └──────────────┘
                             
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  CATEGORIA   │       │   PRODUCTO   │       │  PROVEEDOR   │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │◄──────│ categoria_id │       │ id (PK)      │
│ empresa_id   │       │ empresa_id   │───────│ empresa_id   │
│ nombre       │       │ nombre       │       │ nombre       │
│ padre_id     │       │ sku          │       │ contacto     │
└──────────────┘       │ stock        │       └──────────────┘
                       └──────────────┘
                             
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   CLIENTE    │       │    VENTA     │       │DETALLE_VENTA │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │◄──────│ cliente_id   │───────│ venta_id     │
│ empresa_id   │       │ empresa_id   │       │ producto_id  │
│ nombre       │       │ numero       │       │ cantidad     │
│ email        │       │ total        │       │ precio       │
└──────────────┘       │ estado       │       └──────────────┘
                       └──────────────┘
                             
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│CAT_GASTO     │       │    GASTO     │       │MOVIMIENTO_INV│
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │◄──────│ categoria_id │       │ id (PK)      │
│ empresa_id   │       │ empresa_id   │       │ producto_id  │
│ nombre       │       │ monto        │       │ tipo         │
│ presupuesto  │       │ estado       │       │ cantidad     │
└──────────────┘       └──────────────┘       └──────────────┘
```

---

## REFERENCIAS

- [Domain-Driven Design Distilled](https://www.amazon.com/Domain-Driven-Design-Distilled-Vaughn-Vernon/dp/0134434420)
- [Implementing Domain-Driven Design](https://www.amazon.com/Implementing-Domain-Driven-Design-Vaughn-Vernon/dp/0321834577)
- [Microservices Patterns](https://www.amazon.com/Microservices-Patterns-design-implement-microservices/dp/1617294543)

---

**Versión**: 3.2.0  
**Última actualización**: 2024  
**Mantenido por**: Equipo de Arquitectura SaPyme
