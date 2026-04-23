# SaPyme SaaS Platform

## 🚀 Inicio rápido (desarrollo local)

```bash
# Clonar y entrar al proyecto
git clone <repo> SaPyme
cd SaPyme

# ⚠️ IMPORTANTE: Configurar variables de entorno seguras
cp backend/.env.example backend/.env
# Editar backend/.env con valores seguros únicos para tu instalación

# Para producción, usar .env.production.example como referencia
cp .env.production.example .env.production
# Editar .env.production con secrets generados criptográficamente
```

### Generar secrets seguros

```bash
# JWT_SECRET (mínimo 256 caracteres)
openssl rand -base64 64

# Passwords para PostgreSQL y Redis
openssl rand -base64 32

# BOOTSTRAP_SUPER_ADMIN_SECRET (solo setup inicial)
openssl rand -base64 32
```

### Docker Compose

```bash
# Desarrollo local
docker compose up -d

# Producción (con variables de entorno configuradas)
docker compose --env-file .env.production up -d
```

### URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- ML Service: http://localhost:8000/api
- Facturación SUNAT: http://localhost:9000/api
- Health Check: http://localhost:3000/health

## 🔒 Seguridad - Configuración Crítica

### 1. Credenciales NO hardcodeadas

El archivo `docker-compose.yml` ahora usa variables de entorno. **NUNCA** commits credenciales reales:

```yaml
# ✅ CORRECTO
POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?Error: POSTGRES_PASSWORD no configurada}
JWT_SECRET: ${JWT_SECRET:?Error: JWT_SECRET no configurada}

# ❌ INCORRECTO (nunca hacer esto)
POSTGRES_PASSWORD: admin123
JWT_SECRET: clave_super_secreta_saas_2024
```

### 2. Bootstrap Super Admin - Endpoint Crítico

El endpoint `/api/auth/bootstrap-super-admin` está **DESHABILITADO POR DEFECTO EN PRODUCCIÓN**:

```env
# En producción: SIEMPRE true
BOOTSTRAP_DISABLED=true

# En desarrollo (solo setup inicial):
BOOTSTRAP_DISABLED=false
BOOTSTRAP_SUPER_ADMIN_SECRET=<secret_seguro>
```

**Protecciones implementadas:**
- Bloqueado automáticamente si `NODE_ENV=production`
- Requiere `BOOTSTRAP_SUPER_ADMIN_SECRET` válido
- Log de auditoría para intentos fallidos
- Advertencia explícita en la respuesta

### 3. Blacklist de Tokens con Redis

El sistema usa Redis para blacklist distribuida de tokens (multi-instancia):

```yaml
services:
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
```

**Características:**
- ✅ Multi-instancia: logout funciona correctamente con load balancer
- ✅ TTL automático: los tokens expirados se limpian solos
- ✅ Persistencia: AOF habilitado para durability
- ⚠️ Fallback a memoria: solo para desarrollo o si Redis falla

**En producción, si Redis falla:**
- Se registra un error CRÍTICO en los logs
- El fallback a memoria NO es seguro en multi-instancia
- Considera alertas de monitoreo para `redis.fallbackActive: true`

### 4. Health Check Mejorado

```bash
curl http://localhost:3000/health
```

Respuesta incluye estado de Redis:
```json
{
  "estado": "ok",
  "version": "2.0",
  "service": "backend",
  "redis": {
    "useRedis": true,
    "redisConnectionFailed": false,
    "fallbackActive": false
  }
}
```

## 🏗️ Arquitectura

```
SaPyme (Multi-tenant SaaS)
├── Backend (Node/Sequelize/Postgres) — RBAC, Billing, Feature Flags
├── Frontend (React/Vite/Tailwind) — App SPA
├── ML Service (FastAPI) — Predicciones demanda/stock
├── Facturación (PHP/Greenter) — SUNAT CPE
├── Redis — Blacklist distribuida de tokens JWT
└── Docker Compose — Orquestación completa
```

## 📊 Checklist de Seguridad para Producción

- [ ] Generar `JWT_SECRET` único (mínimo 256 caracteres)
- [ ] Generar `POSTGRES_PASSWORD` seguro (mínimo 32 caracteres)
- [ ] Generar `REDIS_PASSWORD` seguro
- [ ] Establecer `BOOTSTRAP_DISABLED=true`
- [ ] Configurar `CORS_ALLOWED_ORIGINS` con dominios específicos
- [ ] Habilitar `REQUIRE_HTTPS=true` si hay reverse proxy HTTPS
- [ ] Rotar secrets del historial Git (ver abajo)
- [ ] Configurar monitoreo para `redis.fallbackActive`
- [ ] Revisar logs de auditoría de intentos de bootstrap

## 🧹 Limpiar Secrets del Historial Git

Si commits anteriores contienen secrets hardcodeados:

```bash
# ⚠️ ADVERTENCIA: Esto reescribe el historial Git
# Solo hacerlo en repositorios privados o coordinar con el equipo

# Opción 1: BFG Repo-Cleaner (recomendado)
bfg --delete-files .env
bfg --replace-text passwords.txt

# Opción 2: git filter-branch (nativo, más lento)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' \
  --prune-empty --tag-name-filter cat -- --all

# Forzar push después de limpiar
git push origin --force --all
git push origin --force --tags
```

## 🔧 Variables de Entorno Requeridas

Ver `backend/.env.example` para desarrollo y `.env.production.example` para producción.

**Mínimas para producción:**
```env
POSTGRES_PASSWORD=<seguro>
JWT_SECRET=<min_256_chars>
REDIS_PASSWORD=<seguro>
BOOTSTRAP_DISABLED=true
NODE_ENV=production
CORS_ALLOWED_ORIGINS=https://tudominio.com
```

## 📝 Estado Post-Correcciones

✅ **Crítico Resuelto:**
- [x] Credenciales removidas de docker-compose.yml
- [x] Variables de entorno obligatorias con validación
- [x] Bootstrap endpoint bloqueado en producción por defecto
- [x] Auditoría de intentos de bootstrap
- [x] Redis añadido para blacklist multi-instancia
- [x] Health check incluye estado de Redis
- [x] Alertas críticas cuando Redis falla en producción

✅ **Mejoras Adicionales:**
- [x] Archivos .env.example documentados
- [x] README actualizado con checklist de seguridad
- [x] Logs estructurados en producción
- [x] Rate limiting diferenciado para auth vs API

**Próximos pasos recomendados:**
1. Rotar todos los secrets que estuvieron en el historial Git
2. Configurar monitoreo/alertas para Redis
3. Implementar refresh tokens para sesiones largas
4. Revisar configuración de CORS por entorno
