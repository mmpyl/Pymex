# 🏃 RUNBOOK OPERACIONAL - SaPyme

## Guía de Operaciones y Troubleshooting

**Propósito**: Este documento proporciona procedimientos paso a paso para operaciones comunes, resolución de incidentes y mantenimiento del sistema.

---

## 📋 Tabla de Contenidos

1. [Operaciones Diarias](#operaciones-diarias)
2. [Monitoreo](#monitoreo)
3. [Troubleshooting](#troubleshooting)
4. [Backup y Recovery](#backup-y-recovery)
5. [Deployments](#deployments)
6. [Escalamiento](#escalamiento)
7. [Contactos de Emergencia](#contactos-de-emergencia)

---

## Operaciones Diarias

### ✅ Checklist Matutino

Realizar cada día al iniciar jornada:

- [ ] Verificar health checks de todos los servicios
- [ ] Revisar logs de errores críticos (últimas 24h)
- [ ] Verificar uso de disco en servidores
- [ ] Revisar alertas de stock bajo
- [ ] Confirmar backups nocturnos exitosos
- [ ] Verificar métricas de rendimiento (response time < 200ms)

```bash
# Health check rápido
curl http://localhost:3000/health
curl http://localhost:3000/health/db
curl http://localhost:3000/health/cache

# Verificar logs de errores
tail -n 100 /var/log/sapyme/error.log | grep "ERROR"

# Uso de disco
df -h

# Backups
ls -lah /backups/sapyme/$(date +%Y-%m-%d)
```

---

### 📊 Revisión de Métricas

#### Dashboard Principal

Acceder a: `http://dashboard.sapyme.internal`

**Métricas Clave:**
| Métrica | Umbral Alerta | Umbral Crítico |
|---------|---------------|----------------|
| Response Time | > 500ms | > 2000ms |
| Error Rate | > 1% | > 5% |
| CPU Usage | > 70% | > 90% |
| Memory Usage | > 75% | > 90% |
| Disk Usage | > 80% | > 95% |
| DB Connections | > 80% | > 95% |

---

## Monitoreo

### Herramientas de Monitoreo

| Herramienta | URL | Propósito |
|-------------|-----|-----------|
| Grafana | http://grafana.sapyme.internal | Dashboards y métricas |
| Prometheus | http://prometheus.sapyme.internal | Métricas time-series |
| ELK Stack | http://kibana.sapyme.internal | Logs centralizados |
| pgAdmin | http://pgadmin.sapyme.internal | Monitoreo PostgreSQL |
| Redis Commander | http://redis.sapyme.internal | Monitoreo Redis |

### Alertas Configuradas

#### Nivel CRÍTICO (Página inmediata)

- [ ] Servicio caído (> 5 min sin respuesta)
- [ ] Error rate > 10% en últimos 5 min
- [ ] Database down
- [ ] Disco > 95% utilizado
- [ ] Memoria > 95% utilizada

#### Nivel WARNING (Revisar en < 1 hora)

- [ ] Response time > 1s promedio
- [ ] Error rate > 2% en últimos 30 min
- [ ] Disco > 80% utilizado
- [ ] Backups fallidos
- [ ] Stock crítico en productos clave

---

## Troubleshooting

### 🔴 Incidente: Servicio Caído

**Síntomas:**
- Health check retorna error
- Usuarios reportan servicio no disponible
- Monitor muestra servicio down

**Procedimiento:**

```bash
# 1. Verificar estado del servicio
systemctl status sapyme-backend

# 2. Revisar logs recientes
journalctl -u sapyme-backend --since "10 minutes ago"

# 3. Intentar reiniciar
sudo systemctl restart sapyme-backend

# 4. Verificar si levanta
sleep 10
curl http://localhost:3000/health

# 5. Si falla, revisar logs detallados
tail -f /var/log/sapyme/error.log
```

**Posibles Causas y Soluciones:**

| Causa | Síntoma | Solución |
|-------|---------|----------|
| OOM Killer | Service killed, dmesg muestra OOM | Aumentar memoria o optimizar código |
| Puerto ocupado | Error "EADDRINUSE" | `lsof -ti:3000 \| xargs kill` |
| DB connection | Error de conexión a BD | Verificar PostgreSQL, credenciales |
| Config inválida | Error al iniciar | Revisar .env, validar sintaxis |

---

### 🟡 Incidente: Lentitud en Respuestas

**Síntomas:**
- Response time > 2s
- Timeouts en frontend
- Queries lentas en DB

**Procedimiento:**

```bash
# 1. Identificar queries lentas
psql -U postgres -d sapyme_prod -c "
  SELECT query, calls, total_time, mean_time 
  FROM pg_stat_statements 
  ORDER BY mean_time DESC 
  LIMIT 10;
"

# 2. Verificar índices faltantes
psql -U postgres -d sapyme_prod -c "
  SELECT schemaname, tablename, seq_scan, idx_scan
  FROM pg_stat_user_tables
  WHERE seq_scan > idx_scan * 2
  ORDER BY seq_scan DESC;
"

# 3. Revisar locks en DB
psql -U postgres -d sapyme_prod -c "
  SELECT blocked_locks.pid     AS blocked_pid,
         blocking_locks.pid    AS blocking_pid,
         blocked_activity.query AS blocked_statement,
         blocking_activity.query AS current_statement_in_blocking_process
  FROM pg_catalog.pg_locks blocked_locks
  JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
  JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
  WHERE NOT blocked_locks.GRANTED;
"

# 4. Verificar uso de CPU/Memoria
top -bn1 | head -20
free -h
```

**Soluciones Comunes:**

1. **Queries sin índice**: Ejecutar migración de índices
   ```bash
   psql -U postgres -d sapyme_prod -f /workspace/database/migrations/v3.2_indices_criticos.sql
   ```

2. **Locks bloqueantes**: Matar procesos problemáticos
   ```sql
   SELECT pg_terminate_backend(blocking_pid);
   ```

3. **Cache inefectivo**: Limpiar y recalibrar Redis
   ```bash
   redis-cli FLUSHDB
   # Recargar datos frecuentes
   ```

---

### 🟠 Incidente: Errores de Base de Datos

**Error: "too many connections"**

```bash
# 1. Verificar conexiones actuales
psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# 2. Identificar conexiones idle
psql -U postgres -c "
  SELECT state, count(*) 
  FROM pg_stat_activity 
  GROUP BY state;
"

# 3. Matar conexiones idle antiguas
psql -U postgres -c "
  SELECT pg_terminate_backend(pid) 
  FROM pg_stat_activity 
  WHERE state = 'idle' 
  AND state_change < now() - interval '30 minutes';
"

# 4. Ajustar max_connections (si es necesario)
# Editar /etc/postgresql/15/main/postgresql.conf
# max_connections = 200
sudo systemctl reload postgresql
```

**Error: "disk full"**

```bash
# 1. Verificar espacio
df -h /var/lib/postgresql

# 2. Identificar tablas grandes
psql -U postgres -d sapyme_prod -c "
  SELECT table_name, pg_size_pretty(pg_total_relation_size(table_name))
  FROM information_schema.tables
  WHERE table_schema = 'public'
  ORDER BY pg_total_relation_size(table_name) DESC
  LIMIT 10;
"

# 3. Archivar datos antiguos (ej: logs > 1 año)
# Crear script de archiving

# 4. Vacuum para liberar espacio
psql -U postgres -d sapyme_prod -c "VACUUM FULL;"
```

---

### 🔵 Incidente: Memory Leak

**Síntomas:**
- Uso de memoria crece continuamente
- Reinicio temporalmente soluciona
- OOM killer eventualmente mata proceso

**Diagnóstico:**

```bash
# 1. Monitorear crecimiento
watch -n 5 'ps aux | grep node | grep -v grep'

# 2. Heap snapshot con clinic
npm install -g clinic
clinic doctor -- node dist/server.js

# 3. Revisar event listeners
# Agregar en código:
process.on('warning', (warning) => {
  console.warn(warning.stack);
});
```

**Soluciones:**

1. Identificar y fixear leaks en código
2. Implementar restart automático cada 24h (workaround)
   ```bash
   # Cron job
   0 3 * * * systemctl restart sapyme-backend
   ```
3. Aumentar límites de memoria (no fixea root cause)
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   ```

---

## Backup y Recovery

### 📦 Backup Automático

Los backups se ejecutan diariamente a las 2:00 AM:

```bash
# Script: /opt/sapyme/scripts/backup.sh
#!/bin/bash
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="/backups/sapyme/$DATE"

mkdir -p $BACKUP_DIR

# Backup PostgreSQL
pg_dump -U sapyme_user -d sapyme_prod -F c -f $BACKUP_DIR/db.dump

# Backup archivos estáticos
tar -czf $BACKUP_DIR/uploads.tar.gz /var/www/sapyme/uploads

# Backup variables de entorno
cp /opt/sapyme/backend/.env $BACKUP_DIR/env.backup

# Subir a S3 (opcional)
aws s3 cp $BACKUP_DIR s3://sapyme-backups/$DATE --recursive

# Mantener últimos 30 días
find /backups/sapyme -type d -mtime +30 -exec rm -rf {} \;
```

### 🔄 Procedimiento de Recovery

**Escenario: Restaurar desde backup**

```bash
# 1. Detener aplicación
sudo systemctl stop sapyme-backend

# 2. Identificar backup a restaurar
ls -lah /backups/sapyme/

# 3. Restaurar base de datos
pg_restore -U sapyme_user -d sapyme_prod -c /backups/sapyme/YYYY-MM-DD/db.dump

# 4. Restaurar archivos
tar -xzf /backups/sapyme/YYYY-MM-DD/uploads.tar.gz -C /

# 5. Restaurar .env
cp /backups/sapyme/YYYY-MM-DD/env.backup /opt/sapyme/backend/.env

# 6. Iniciar aplicación
sudo systemctl start sapyme-backend

# 7. Verificar
curl http://localhost:3000/health
```

---

## Deployments

### 🚀 Deployment Manual

```bash
# 1. Pull latest code
cd /opt/sapyme
git pull origin main

# 2. Instalar dependencias
cd backend
npm ci --production

# 3. Compilar TypeScript
npm run build

# 4. Ejecutar migraciones (si hay)
npm run migrate

# 5. Restart service
sudo systemctl restart sapyme-backend

# 6. Verificar logs
journalctl -u sapyme-backend -f

# 7. Health check
curl http://localhost:3000/health

# 8. Notificar canal Slack
# (manual o automático vía webhook)
```

### 🔄 Rollback Rápido

```bash
# 1. Identificar último commit estable
git log --oneline -10

# 2. Revertir
git revert HEAD
# O hacer checkout a tag específico
git checkout tags/v3.1.0

# 3. Re-deployar
npm run build
sudo systemctl restart sapyme-backend

# 4. Verificar
curl http://localhost:3000/health
```

---

## Escalamiento

### ⬆️ Escalamiento Vertical (Rápido)

```bash
# Aumentar recursos del servidor
# AWS Console → EC2 → Stop → Change Instance Type → Start

# O ajustar límites de contenedor Docker
docker update --memory=4g --cpus=2.0 sapyme-backend
```

### ➡️ Escalamiento Horizontal (Auto-scaling)

```yaml
# Kubernetes HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: sapyme-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: sapyme-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### 🗄️ Escalamiento de Base de Datos

```sql
-- Read replicas para consultas
-- Configurar en .env
DB_READ_REPLICA_HOST=replica1.sapyme.internal
DB_READ_REPLICA_HOST_2=replica2.sapyme.internal

-- Particionamiento (futuro)
-- Por empresa_id o por fecha
CREATE TABLE ventas_2024 PARTITION OF ventas
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

---

## Contactos de Emergencia

### 📞 Equipo de Guardia

| Rol | Nombre | Teléfono | Email |
|-----|--------|----------|-------|
| On-call Primary | Juan Pérez | +1-555-0101 | juan@sapyme.com |
| On-call Secondary | María García | +1-555-0102 | maria@sapyme.com |
| Tech Lead | Carlos López | +1-555-0103 | carlos@sapyme.com |
| CTO | Ana Martínez | +1-555-0104 | ana@sapyme.com |

### 🔗 Canales de Comunicación

- **Slack Emergency**: #incidents-critical
- **PagerDuty**: https://sapyme.pagerduty.com
- **Status Page**: https://status.sapyme.com
- **Post-mortems**: #incidents-postmortem

### 📋 Plantilla de Reporte de Incidentes

```markdown
## Incidente: [Título breve]

**Fecha/Hora**: YYYY-MM-DD HH:MM UTC
**Severidad**: Critical/High/Medium/Low
**Estado**: Investigating/Identified/Monitoring/Resolved

### Impacto
- Usuarios afectados: X%
- Servicios impactados: [lista]
- Duración: X minutos/horas

### Timeline
- HH:MM - Alerta recibida
- HH:MM - Equipo notificado
- HH:MM - Root cause identificado
- HH:MM - Fix implementado
- HH:MM - Servicio restaurado

### Root Cause
[Descripción técnica]

### Acciones Correctivas
- [ ] Short-term fix
- [ ] Long-term prevention
- [ ] Monitoring improvements

### Post-mortem Meeting
Programado para: YYYY-MM-DD HH:MM
```

---

## Apéndices

### A. Comandos Útiles

```bash
# Ver todas las tablas y su tamaño
psql -U postgres -d sapyme_prod -c "\dt+"

# Exportar datos a CSV
psql -U postgres -d sapyme_prod -c "COPY (SELECT * FROM ventas WHERE fecha > '2024-01-01') TO '/tmp/ventas_2024.csv' WITH CSV HEADER;"

# Importar CSV
psql -U postgres -d sapyme_prod -c "\copy ventas FROM '/tmp/ventas.csv' WITH CSV HEADER;"

# Analizar query plan
psql -U postgres -d sapyme_prod -c "EXPLAIN ANALYZE SELECT * FROM productos WHERE empresa_id = 1 AND stock_actual < 10;"

# Resetear secuencia de ID
psql -U postgres -d sapyme_prod -c "SELECT setval('productos_id_seq', (SELECT MAX(id) FROM productos));"
```

### B. Variables de Entorno Críticas

```env
# NO MODIFICAR SIN APROBACIÓN
NODE_ENV=production
PORT=3000
DB_HOST=db-primary.sapyme.internal
DB_PORT=5432
DB_NAME=sapyme_prod
DB_USER=sapyme_user
DB_MAX_CONNECTIONS=50
REDIS_HOST=redis.sapyme.internal
JWT_SECRET=<secret-en-vault>
AWS_ACCESS_KEY_ID=<en-vault>
AWS_SECRET_ACCESS_KEY=<en-vault>
STRIPE_SECRET_KEY=<en-vault>
```

### C. Checklists de Mantenimiento

#### Semanal
- [ ] Revisar slow queries
- [ ] Actualizar dependencias de seguridad
- [ ] Rotar logs
- [ ] Verificar certificados SSL

#### Mensual
- [ ] Test de recovery de backup
- [ ] Revisar y limpiar datos temporales
- [ ] Actualizar documentación
- [ ] Reunión de revisión de incidentes

#### Trimestral
- [ ] Penetration testing
- [ ] Load testing
- [ ] Revisar arquitectura y deuda técnica
- [ ] Plan de capacidad

---

**Versión**: 3.2.0  
**Última actualización**: 2024  
**Próxima revisión**: 2024-Q2  
**Mantenido por**: Equipo de DevOps SaPyme
