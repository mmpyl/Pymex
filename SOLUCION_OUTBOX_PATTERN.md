# Solución Crítica: Persistencia de Eventos con Outbox Pattern

## Problema

El eventBus no persistía eventos. Si el proceso moría durante `runBillingCollection`, los eventos publicados se perdían. Para billing esto es grave: una empresa puede quedar suspendida sin que AUTH reciba el evento para revocar tokens.

## Solución Implementada

Se implementó el **Outbox Pattern** para garantizar que los eventos no se pierdan incluso si el proceso muere.

### Cambios Realizados

#### 1. Nuevo Modelo: `DomainEvent` (Outbox)

**Archivo:** `/workspace/backend/src/domains/billing/models/DomainEvent.js`

Este modelo persiste los eventos en la base de datos antes de ser emitidos, con los siguientes estados:
- `pending`: Evento creado, pendiente de despacho
- `processing`: Evento siendo procesado (locked por worker)
- `delivered`: Evento entregado exitosamente
- `failed`: Evento falló después de múltiples reintentos

#### 2. Event Bus Mejorado con Outbox

**Archivo:** `/workspace/backend/src/domains/eventBus.js`

Cambios principales:
- El método `publish()` ahora es `async` y acepta un parámetro opcional `transaction`
- Los eventos se persisten en la tabla `domain_events` ANTES de ser emitidos
- Se agregaron métodos para procesar eventos pendientes: `processPendingEvents()`
- Soporte para reintentos automáticos de eventos fallidos
- Limpieza automática de eventos antiguos

#### 3. Worker de Procesamiento de Eventos

**Archivo:** `/workspace/backend/src/workers/eventProcessor.js`

Nuevo worker que:
- Procesa eventos pendientes cada 5 segundos (configurable)
- Reintenta eventos fallidos con backoff exponencial
- Limpia eventos antiguos periódicamente
- Manejo graceful de shutdown

#### 4. billingService Actualizado

**Archivo:** `/workspace/backend/src/services/billingService.js`

El método `runBillingCollection()` ahora:
- Publica el evento `SUBSCRIPTION_SUSPENDED` DENTRO de la transacción
- Si el proceso muere antes del commit, el evento NO se persiste
- Si el proceso muere después del commit pero antes de emitir, el outbox garantiza la entrega

```javascript
// OUTBOX PATTERN CRÍTICO: Publicar evento DENTRO de la transacción
if (affectedEmpresas.length) {
  await eventBus.publish('SUBSCRIPTION_SUSPENDED', {
    empresa_ids: affectedEmpresas,
    motivo: 'pago_vencido',
    grace_days: BILLING_GRACE_DAYS
  }, 'BILLING', tx); // <-- Pasar la transacción para atomicidad
}

await tx.commit();
```

## Cómo Funciona

### Flujo Normal

1. `runBillingCollection()` inicia una transacción
2. Suspende empresas en la DB
3. Publica evento `SUBSCRIPTION_SUSPENDED` CON la transacción
4. El evento se persiste en `domain_events` con estado `pending`
5. La transacción hace commit
6. El evento se emite a los listeners en memoria
7. AUTH recibe el evento y revoca tokens

### Si el Proceso Muere

#### Escenario A: Muerte ANTES del commit
- La transacción se hace rollback
- El evento NO se persiste
- Las empresas NO quedan suspendidas
- **Estado consistente: No hay problema**

#### Escenario B: Muerte DESPUÉS del commit, ANTES de emitir
- Las empresas están suspendidas en la DB
- El evento está persistido en `domain_events` con estado `pending`
- Al reiniciar, el worker procesa eventos pendientes
- El evento se emite y AUTH recibe la notificación
- **Estado consistente: El outbox garantiza la entrega**

## Configuración

### Variables de Entorno

```bash
# Intervalo para procesar eventos pendientes (default: 5000ms)
EVENT_PROCESS_INTERVAL_MS=5000

# Intervalo para limpiar eventos antiguos (default: 3600000ms = 1 hora)
EVENT_CLEANUP_INTERVAL_MS=3600000

# Cantidad de eventos a procesar por batch
EVENTS_PER_BATCH=100

# Días a mantener eventos en la DB
DAYS_TO_KEEP_EVENTS=30
```

## Uso

### Iniciar el Worker de Eventos

```bash
# En un proceso separado
node backend/src/workers/eventProcessor.js
```

### Opción: Integrar en el Servidor Principal

Si prefieres no tener un proceso separado, puedes iniciar el worker dentro del servidor principal:

```javascript
// backend/server.js
const { start: startEventWorker } = require('./src/workers/eventProcessor');

async function iniciar() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a PostgreSQL');
        
        // Iniciar worker de eventos
        await startEventWorker();
        
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error al conectar:', error.message);
    }
}
```

### API del Event Bus

```javascript
const eventBus = require('./src/domains/eventBus');

// Publicar evento (ahora es async y acepta transacción)
await eventBus.publish('COMPANY_SUSPENDED', payload, 'BILLING', transaction);

// Procesar eventos pendientes manualmente
const result = await eventBus.processPendingEvents(100);

// Obtener eventos fallidos
const failed = await eventBus.getFailedEvents();

// Reintentar un evento fallido
await eventBus.retryFailedEvent(eventId);

// Limpiar eventos antiguos
await eventBus.cleanupOldEvents(30);

// Deshabilitar outbox (para testing)
eventBus.disableOutbox();
```

## Migración de Base de Datos

Crear la tabla `domain_events`:

```sql
CREATE TABLE domain_events (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(120) NOT NULL UNIQUE,
  event_type VARCHAR(100) NOT NULL,
  source_domain VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMP,
  delivered_at TIMESTAMP,
  error_message TEXT,
  worker_id VARCHAR(100),
  metadata JSONB
);

-- Índices para rendimiento
CREATE INDEX idx_domain_events_status_created ON domain_events(status, created_at);
CREATE INDEX idx_domain_events_source_status ON domain_events(source_domain, status);
CREATE INDEX idx_domain_events_type_status ON domain_events(event_type, status);
```

## Beneficios

1. **Garantía de Entrega**: Los eventos no se pierden si el proceso muere
2. **Atomicidad**: Los eventos se persisten en la misma transacción que los cambios de estado
3. **Reintentos Automáticos**: Eventos fallidos se reintentan automáticamente
4. **Auditoría**: Historial completo de eventos en la DB
5. **Desacople Temporal**: Los consumidores pueden procesar eventos asíncronamente

## Consideraciones

- El worker debe ejecutarse continuamente para procesar eventos pendientes
- Monitorear la tabla `domain_events` para detectar eventos fallidos
- Configurar alertas si hay muchos eventos en estado `failed`
- La tabla debe limpiarse periódicamente para evitar crecimiento infinito
