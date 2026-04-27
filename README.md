# SaPyme - Plataforma SaaS Multi-Tenant para PYMES

[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-compose-ready-blue.svg)](https://docs.docker.com/compose/)
[![API Docs](https://img.shields.io/badge/API-Swagger-green.svg)](http://localhost:3000/api-docs)

Plataforma SaaS completa diseñada para pequeñas y medianas empresas, con gestión empresarial integral, facturación electrónica SUNAT (Perú), inteligencia artificial para predicción de demanda, y un sistema robusto de autenticación y autorización.

---

## 📑 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Requisitos Previos](#-requisitos-previos)
- [Inicio Rápido](#-inicio-rápido)
- [Configuración de Seguridad](#-configuración-de-seguridad)
- [Documentación API](#-documentación-api)
- [Servicios Incluidos](#-servicios-incluidos)
- [Despliegue en Producción](#-despliegue-en-producción)
- [Monitoreo y Health Checks](#-monitoreo-y-health-checks)
- [Solución de Problemas](#-solución-de-problemas)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## ✨ Características Principales

### Gestión Empresarial
- 📦 **Inventario y Productos** - Control completo de stock, categorías y proveedores
- 💰 **Ventas y Facturación** - Registro de ventas con integración SUNAT
- 👥 **Clientes y Proveedores** - CRM integrado
- 📊 **Dashboard y Reportes** - Métricas en tiempo real y reportes exportables (PDF/Excel)
- 💸 **Gastos** - Control financiero de egresos

### Seguridad y Autenticación
- 🔐 **RBAC (Role-Based Access Control)** - Sistema de roles y permisos granular
- 🎫 **JWT con Blacklist Distribuida** - Logout efectivo en arquitecturas multi-instancia
- 🛡️ **Rate Limiting** - Protección contra abuso y ataques DDoS
- 🔑 **API Keys B2B** - Autenticación para integraciones externas

### Inteligencia Artificial
- 🤖 **ML Service** - Predicción de demanda y optimización de stock usando XGBoost
- 📈 **Análisis Predictivo** - Recomendaciones basadas en datos históricos

### Facturación Electrónica (Perú)
- 📄 **SUNAT CPE** - Emisión de comprobantes electrónicos válidos
- 📋 **Greenter** - Librería oficial para facturación electrónica
- 📬 **Envío Automático** - Comunicación directa con SUNAT

### Multi-Tenancy
- 🏢 **Empresas Múltiples** - Cada cliente con su espacio aislado
- 💳 **Planes y Suscripciones** - Sistema de features por plan (Stripe ready)
- 👨‍💼 **Super Admin** - Panel de administración global

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         SaPyme SaaS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐   │
│  │   Frontend   │     │    Backend   │     │  ML Service  │   │
│  │ React + Vite │◄───►│ Node.js +    │◄───►│   FastAPI    │   │
│  │   Tailwind   │     │ Express.js   │     │  scikit-learn│   │
│  └──────────────┘     └──────────────┘     └──────────────┘   │
│         │                    │                      │          │
│         │                    ▼                      │          │
│         │            ┌──────────────┐               │          │
│         │            │  PostgreSQL  │◄──────────────┘          │
│         │            │   Database   │                          │
│         │            └──────────────┘                          │
│         │                    │                                  │
│         │                    ▼                                  │
│         │            ┌──────────────┐                          │
│         │            │    Redis     │                          │
│         │            │   Blacklist  │                          │
│         │            └──────────────┘                          │
│         │                                                      │
│         ▼                                                      │
│  ┌──────────────┐                                             │
│  │  Facturación │                                             │
│  │   Service    │                                             │
│  │ PHP + Slim   │                                             │
│  │  Greenter    │──────────────► SUNAT                        │
│  └──────────────┘                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Stack Tecnológico

| Servicio | Tecnología | Propósito |
|----------|-----------|-----------|
| **Frontend** | React 18, Vite, TailwindCSS, TypeScript | SPA moderna y responsiva |
| **Backend** | Node.js, Express, Sequelize | API RESTful |
| **Base de Datos** | PostgreSQL 16 | Persistencia multi-tenant |
| **Cache/Blacklist** | Redis 7 | Gestión de tokens y sesiones |
| **ML Service** | FastAPI, scikit-learn, XGBoost | Predicciones IA |
| **Facturación** | PHP 8.1+, Slim, Greenter | SUNAT CPE |
| **Orquestación** | Docker Compose | Contenerización completa |

---

## 📋 Requisitos Previos

### Para Desarrollo Local
- **Docker** ≥ 20.10.x ([Instalar](https://docs.docker.com/get-docker/))
- **Docker Compose** ≥ 2.0.x (incluido en Docker Desktop)
- **Git** ([Instalar](https://git-scm.com/downloads))
- **OpenSSL** (para generar secrets)

### Para Producción
- Servidor con mínimo 4GB RAM, 2 CPUs
- Dominio configurado con SSL/TLS
- Reverse proxy (nginx, Traefik, etc.)
- Backup automatizado de volúmenes Docker

---

## 🚀 Inicio Rápido

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-organizacion/sapyme.git
cd sapyme
```

### 2. Configurar Variables de Entorno

#### ⚠️ **IMPORTANTE**: Nunca uses credenciales por defecto en producción

```bash
# Copiar archivos de ejemplo
cp backend/.env.example backend/.env
cp .env.production.example .env.production
```

#### Generar Secrets Criptográficos

```bash
# JWT_SECRET (mínimo 256 caracteres)
openssl rand -base64 64

# Passwords para PostgreSQL y Redis
openssl rand -base64 32

# BOOTSTRAP_SUPER_ADMIN_SECRET (solo para setup inicial)
openssl rand -base64 32
```

Editar `backend/.env` y `.env.production` con los valores generados.

### 3. Iniciar Servicios con Docker

```bash
# Desarrollo local
docker compose up -d

# Ver logs en tiempo real
docker compose logs -f

# Detener servicios
docker compose down
```

### 4. Acceder a la Plataforma

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:5173 | Aplicación web |
| **Backend API** | http://localhost:3000/api | API REST |
| **Swagger Docs** | http://localhost:3000/api-docs | Documentación interactiva |
| **ML Service** | http://localhost:8000/api | Servicio de IA |
| **Facturación** | http://localhost:9000/api | SUNAT CPE |
| **Health Check** | http://localhost:3000/health | Estado del sistema |

---

## 🔒 Configuración de Seguridad

### Variables de Entorno Críticas

```env
# Base de Datos
POSTGRES_PASSWORD=<generado_con_openssl>

# JWT (mínimo 256 caracteres)
JWT_SECRET=<generado_con_openssl_rand_-base64_64>

# Redis
REDIS_PASSWORD=<generado_con_openssl>

# Bootstrap Admin (solo desarrollo/setup inicial)
BOOTSTRAP_DISABLED=true              # ← SIEMPRE en producción
BOOTSTRAP_SUPER_ADMIN_SECRET=<secreto>

# CORS (especificar dominios reales)
CORS_ALLOWED_ORIGINS=https://tudominio.com

# Entorno
NODE_ENV=production
REQUIRE_HTTPS=true
```

### Protección del Endpoint Bootstrap

El endpoint `/api/auth/bootstrap-super-admin` está **bloqueado por defecto en producción**:

```env
# Producción (RECOMENDADO)
BOOTSTRAP_DISABLED=true

# Desarrollo (solo para creación del primer super admin)
BOOTSTRAP_DISABLED=false
BOOTSTRAP_SUPER_ADMIN_SECRET=<tu_secreto_seguro>
```

**Protecciones implementadas:**
- ✅ Bloqueo automático si `NODE_ENV=production`
- ✅ Validación de secret mediante header
- ✅ Auditoría de intentos fallidos
- ✅ Rate limiting agresivo

### Blacklist Distribuida con Redis

El sistema utiliza Redis para invalidar tokens JWT en arquitecturas multi-instancia:

```yaml
services:
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data  # Persistencia AOF
```

**Características:**
- ✅ **Multi-instancia**: Logout funciona con load balancer
- ✅ **TTL automático**: Limpieza de tokens expirados
- ✅ **Persistencia**: AOF habilitado para durability
- ⚠️ **Fallback**: Solo para desarrollo (NO seguro en producción)

### Checklist de Seguridad para Producción

- [ ] Generar `JWT_SECRET` único (≥256 caracteres)
- [ ] Generar `POSTGRES_PASSWORD` seguro (≥32 caracteres)
- [ ] Generar `REDIS_PASSWORD` seguro
- [ ] Establecer `BOOTSTRAP_DISABLED=true`
- [ ] Configurar `CORS_ALLOWED_ORIGINS` con dominios específicos
- [ ] Habilitar `REQUIRE_HTTPS=true` con reverse proxy SSL
- [ ] Rotar secrets del historial Git (si hubo exposición)
- [ ] Configurar alertas para `redis.fallbackActive`
- [ ] Revisar logs de auditoría de bootstrap
- [ ] Configurar backups automáticos de PostgreSQL y Redis

---

## 📚 Documentación API

### Swagger/OpenAPI 3.0

La API incluye documentación interactiva accesible en:

```
http://localhost:3000/api-docs
```

**Características:**
- 📖 Exploración visual de todos los endpoints
- 🧪 Prueba directa desde el navegador
- 🔐 Autenticación integrada (JWT y API Keys)
- 📦 Esquemas de datos completos

### Endpoints Principales

#### Autenticación (`/api/auth`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/register` | Registrar nueva empresa |
| POST | `/login` | Iniciar sesión |
| POST | `/logout` | Cerrar sesión (blacklist JWT) |
| GET | `/profile` | Obtener perfil del usuario |
| POST | `/admin/login` | Login de administrador |
| POST | `/bootstrap-super-admin` | Crear super admin inicial |

#### Gestión Empresarial
| Módulo | Endpoint | Métodos |
|--------|----------|---------|
| Productos | `/api/productos` | GET, POST, PUT, DELETE |
| Ventas | `/api/ventas` | GET, POST, PUT |
| Clientes | `/api/clientes` | GET, POST, PUT, DELETE |
| Proveedores | `/api/proveedores` | GET, POST, PUT, DELETE |
| Categorías | `/api/categorias` | GET, POST, PUT, DELETE |
| Gastos | `/api/gastos` | GET, POST, PUT, DELETE |
| Inventario | `/api/inventario` | GET, POST |
| Dashboard | `/api/dashboard` | GET |
| Reportes | `/api/reportes` | GET, POST |

#### Inteligencia Artificial (`/api/ml`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/predict/demand` | Predecir demanda de producto |
| POST | `/predict/stock` | Optimizar nivel de stock |
| GET | `/models/status` | Estado de modelos entrenados |

#### Facturación SUNAT (`/api/facturacion`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/invoice` | Generar factura electrónica |
| POST | `/ticket` | Generar boleta de venta |
| GET | `/status/:cdR` | Consultar estado en SUNAT |
| GET | `/pdf/:invoiceId` | Descargar PDF del comprobante |

#### Multi-Tenancy (`/api/saas`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/plans` | Listar planes disponibles |
| POST | `/subscribe` | Suscribirse a un plan |
| GET | `/features` | Features activos por empresa |
| POST | `/payments/webhook` | Webhook de Stripe |

### Ejemplo de Uso con Fetch

```javascript
const token = localStorage.getItem('jwt_token');

// Listar productos con paginación
const response = await fetch('/api/productos?page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const products = await response.json();

// Crear nuevo producto
const newProduct = await fetch('/api/productos', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nombre: 'Producto Demo',
    precio: 99.99,
    stock: 100,
    categoria_id: 1
  })
});
```

---

## 🧩 Servicios Incluidos

### 1. Backend (Node.js/Express)
- **Ubicación**: `/backend`
- **Puerto**: 3000
- **Features**:
  - Autenticación JWT con blacklist en Redis
  - RBAC con roles personalizables
  - Rate limiting diferenciado
  - Logging estructurado con Winston
  - Health checks integrales
  - Circuit breaker para servicios externos

### 2. Frontend (React/Vite)
- **Ubicación**: `/frontend`
- **Puerto**: 5173 (dev), 80 (prod)
- **Features**:
  - SPA con React Router
  - State management con Zustand
  - Server state con TanStack Query
  - Formularios con React Hook Form + Zod
  - UI con TailwindCSS + Headless UI
  - Gráficos con Recharts
  - Notificaciones con Sonner

### 3. ML Service (FastAPI/Python)
- **Ubicación**: `/ml_service`
- **Puerto**: 8000
- **Features**:
  - Predicción de demanda con XGBoost
  - Optimización de stock
  - Modelos entrenables online
  - API RESTful con Pydantic validation

### 4. Facturación Service (PHP/Slim)
- **Ubicación**: `/facturacion-service`
- **Puerto**: 9000
- **Features**:
  - Integración con SUNAT Perú
  - Generación de XML UBL 2.1
  - Firma digital con certificados PFX
  - Envío automático de CPE
  - Generación de PDF (TCPDF)
  - Almacenamiento de XML y CDR

### 5. PostgreSQL
- **Imagen**: `postgres:16-alpine`
- **Puerto**: 5432
- **Volumen**: `pg_data`
- **Init**: Script SQL automático en `/database/database.sql`

### 6. Redis
- **Imagen**: `redis:7-alpine`
- **Puerto**: 6379
- **Volumen**: `redis_data`
- **Config**: AOF persistence, password protected

---

## 🌐 Despliegue en Producción

### 1. Preparar el Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Instalar Docker Compose (si no está incluido)
sudo apt install docker-compose-plugin
```

### 2. Configurar Variables de Producción

```bash
# Crear archivo .env.production
cat > .env.production << EOF
POSTGRES_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
REDIS_PASSWORD=$(openssl rand -base64 32)
BOOTSTRAP_DISABLED=true
NODE_ENV=production
CORS_ALLOWED_ORIGINS=https://tudominio.com
SUNAT_RUC=20123456789
SUNAT_USER=tu_usuario_sole
SUNAT_PASSWORD=tu_password_sole
EOF
```

### 3. Configurar Reverse Proxy (Ejemplo con nginx)

```nginx
server {
    listen 80;
    server_name tudominio.com;
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name tudominio.com;
    
    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. Desplegar con Docker Compose

```bash
# Iniciar en modo producción
docker compose --env-file .env.production up -d

# Verificar estado
docker compose ps

# Ver logs
docker compose logs -f backend
```

### 5. Configurar Backups Automáticos

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/sapyme/$DATE"

mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker exec sapyme_postgres pg_dump -U postgres saas_pymes > $BACKUP_DIR/db.sql

# Backup Redis
docker exec sapyme_redis redis-cli --pass $REDIS_PASSWORD SAVE
cp /var/lib/docker/volumes/sapyme_redis_data/_data/dump.rdb $BACKUP_DIR/

# Backup certificados SUNAT
cp -r ./facturacion-service/storage/certs $BACKUP_DIR/

# Comprimir
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR

# Subir a S3/cloud storage (opcional)
# aws s3 cp $BACKUP_DIR.tar.gz s3://tu-bucket/backups/

# Eliminar backups antiguos (>7 días)
find /backups/sapyme -type f -mtime +7 -delete
```

---

## 🏥 Monitoreo y Health Checks

### Health Check del Backend

```bash
curl http://localhost:3000/health
```

**Respuesta:**
```json
{
  "estado": "ok",
  "version": "2.0",
  "service": "backend",
  "timestamp": "2026-01-15T10:30:00.000Z",
  "uptime": 86400,
  "database": {
    "connected": true,
    "latency_ms": 5
  },
  "redis": {
    "useRedis": true,
    "redisConnectionFailed": false,
    "fallbackActive": false,
    "latency_ms": 2
  },
  "services": {
    "ml_service": "healthy",
    "facturacion_service": "healthy"
  }
}
```

### Health Checks de Todos los Servicios

```bash
# Backend
curl http://localhost:3000/health

# ML Service
curl http://localhost:8000/

# Facturación Service
curl http://localhost:9000/

# PostgreSQL
docker exec sapyme_postgres pg_isready -U postgres

# Redis
docker exec sapyme_redis redis-cli ping
```

### Monitoreo Recomendado

Configurar alertas para:
- ❌ `redis.fallbackActive: true` (Redis caído)
- ❌ `database.connected: false` (PostgreSQL caído)
- ⚠️ Latencia de Redis > 10ms
- ⚠️ Latencia de DB > 50ms
- ❌ Services no healthy por más de 3 retries
- ⚠️ Intentos fallidos de bootstrap (posible ataque)

---

## 🔧 Solución de Problemas

### Los servicios no inician

```bash
# Ver logs detallados
docker compose logs

# Reiniciar servicios
docker compose down
docker compose up -d

# Reconstruir contenedores
docker compose build --no-cache
docker compose up -d
```

### Error: POSTGRES_PASSWORD no configurada

```bash
# Exportar variable temporalmente
export POSTGRES_PASSWORD=tu_password

# O agregar al archivo .env
echo "POSTGRES_PASSWORD=tu_password" >> .env
```

### Redis connection failed

```bash
# Verificar que Redis esté corriendo
docker compose ps redis

# Ver logs de Redis
docker compose logs redis

# Probar conexión manual
docker exec sapyme_redis redis-cli -a $REDIS_PASSWORD ping
```

### Error de CORS en el frontend

```env
# En backend/.env
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://tudominio.com

# En facturacion-service/.env
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://tudominio.com
```

### Limpiar Secrets del Historial Git

⚠️ **ADVERTENCIA**: Esto reescribe el historial Git

```bash
# Opción 1: BFG Repo-Cleaner (recomendado)
bfg --delete-files .env
bfg --replace-text passwords.txt

# Opción 2: git filter-branch
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' \
  --prune-empty --tag-name-filter cat -- --all

# Forzar push después de limpiar
git push origin --force --all
git push origin --force --tags
```

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor sigue estos pasos:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código

- **Backend**: ESLint + Prettier configurados
- **Frontend**: ESLint + Prettier + TypeScript strict mode
- **Tests**: Jest (backend), Vitest (frontend)
- **Commits**: Conventional Commits ([convencionalcommits.org](https://www.conventionalcommits.org/))

### Ejecutar Tests

```bash
# Backend
cd backend
npm test
npm run test:e2e

# Frontend
cd frontend
npm run test
npm run test:coverage
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo `LICENSE` para más detalles.

---

## 📞 Soporte y Contacto

- **Documentación**: [Wiki del proyecto](../../wiki)
- **Issues**: [GitHub Issues](../../issues)
- **Email**: soporte@saas-pymes.com

---

<div align="center">

**Hecho con ❤️ para PYMES latinoamericanas**

[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

</div>
