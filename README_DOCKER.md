# SaPyme - Guía de Despliegue con Docker Desktop

Esta guía te permitirá desplegar el proyecto SaPyme en Docker Desktop de manera sencilla.

## 📋 Requisitos Previos

- **Docker Desktop** instalado (versión 4.0 o superior)
  - [Descargar para Windows](https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe)
  - [Descargar para Mac](https://desktop.docker.com/mac/main/amd64/Docker.dmg)
  - [Descargar para Linux](https://docs.docker.com/desktop/install/linux-install/)

## 🚀 Inicio Rápido

### Paso 1: Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example backend/.env
```

> **Nota:** El archivo `backend/.env` ya está configurado con valores seguros para desarrollo local.

### Paso 2: Construir y Levantar los Servicios

Abre una terminal en la raíz del proyecto y ejecuta:

```bash
# Construir todas las imágenes
docker-compose build

# Levantar todos los servicios en segundo plano
docker-compose up -d
```

### Paso 3: Verificar el Estado

```bash
# Ver estado de todos los contenedores
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f
```

## 🌐 Acceder a los Servicios

Una vez que todos los servicios estén corriendo, podrás acceder a:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:3000 | Interfaz de usuario (React + Vite) |
| **Backend API** | http://localhost:3001 | API REST principal |
| **ML Service** | http://localhost:8000 | Servicio de Machine Learning |
| **Facturación Service** | http://localhost:8080 | Facturación electrónica |
| **PostgreSQL** | localhost:5432 | Base de datos |
| **Redis** | localhost:6379 | Caché y colas |

## 🔍 Comandos Útiles

### Ver Logs

```bash
# Logs de todos los servicios
docker-compose logs -f

# Logs de un servicio específico
docker-compose logs backend
docker-compose logs frontend
docker-compose logs ml_service
```

### Detener Servicios

```bash
# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (¡CUIDADO! Se pierden los datos)
docker-compose down -v
```

### Reiniciar Servicios

```bash
# Reiniciar un servicio específico
docker-compose restart backend

# Reconstruir y reiniciar
docker-compose up -d --build backend
```

### Acceder a la Base de Datos

```bash
# Conectarse a PostgreSQL desde el contenedor
docker-compose exec database psql -U postgres -d saas_pymes
```

### Ejecutar Tests

```bash
# Ejecutar tests del backend
docker-compose exec backend npm test

# Ejecutar tests del frontend
docker-compose exec frontend npm test
```

## 🏗️ Arquitectura de Servicios

```
┌─────────────────┐
│   Frontend      │ :3000 (Nginx sirviendo React build)
│   (React+Vite)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Backend      │ :3001 (Node.js + Express)
│   (Node.js)     │
└────────┬────────┘
         │
    ┌────┴────┬─────────────┬─────────────┐
    │         │             │             │
    ▼         ▼             ▼             ▼
┌───────┐ ┌──────┐   ┌────────────┐ ┌──────────┐
│Database│ │ Redis│   │ ML Service │ │Facturación│
│Postgres│ │Cache │   │ (FastAPI)  │ │  (PHP)   │
│ :5432 │ │:6379 │   │  :8000     │ │  :8080   │
└───────┘ └──────┘   └────────────┘ └──────────┘
```

## 🔧 Configuración Personalizada

### Cambiar Puertos

Edita `docker-compose.yml` y modifica los puertos:

```yaml
services:
  frontend:
    ports:
      - "80:80"  # Cambia 3000 por 80
```

### Variables de Entorno

Las variables críticas están en `backend/.env`:

- **JWT_SECRET**: Clave secreta para tokens JWT
- **DB_PASSWORD**: Contraseña de PostgreSQL
- **REDIS_PASSWORD**: Contraseña de Redis
- **ML_SERVICE_API_KEY**: API key para el servicio ML

## 🐛 Solución de Problemas

### Error: "Port already in use"

```bash
# Identificar qué proceso usa el puerto
# Windows (PowerShell):
netstat -ano | findstr :3000

# Mac/Linux:
lsof -i :3000

# O cambiar el puerto en docker-compose.yml
```

### Error: "Cannot connect to Docker daemon"

1. Asegúrate de que Docker Desktop esté ejecutándose
2. En Windows/Mac, verifica el ícono de Docker en la bandeja del sistema
3. Reinicia Docker Desktop

### Error: "Health check failed"

```bash
# Ver logs del servicio con problema
docker-compose logs <nombre-servicio>

# Inspeccionar el contenedor
docker inspect sapyme-backend

# Reiniciar el servicio
docker-compose restart <nombre-servicio>
```

### Los cambios no se reflejan

```bash
# Forzar reconstrucción sin caché
docker-compose build --no-cache

# Luego levantar
docker-compose up -d
```

## 📊 Monitoreo

### Ver Uso de Recursos

```bash
# Ver consumo de CPU y memoria
docker stats
```

### Ver Salud de los Servicios

```bash
# Estado de salud de cada contenedor
docker inspect --format='{{.State.Health.Status}}' sapyme-backend
docker inspect --format='{{.State.Health.Status}}' sapyme-database
docker inspect --format='{{.State.Health.Status}}' sapyme-redis
```

## 🔐 Seguridad para Producción

Antes de desplegar en producción:

1. ✅ Cambiar todas las contraseñas por defecto
2. ✅ Generar un nuevo `JWT_SECRET` seguro:
   ```bash
   openssl rand -base64 32
   ```
3. ✅ Configurar HTTPS con un reverse proxy (Nginx/Traefik)
4. ✅ Restringir acceso a puertos sensibles (5432, 6379)
5. ✅ Usar Docker secrets o vault para credenciales
6. ✅ Actualizar imágenes regularmente

## 📝 Notas Adicionales

- Los volúmenes `postgres_data` y `redis_data` persisten los datos entre reinicios
- Todos los servicios se reinician automáticamente si fallan (`restart: unless-stopped`)
- La red `sapyme-network` aísla los servicios del host
- El frontend está optimizado con Nginx para servir archivos estáticos

## 🤝 Soporte

Para más información, consulta:
- [Documentación oficial de Docker](https://docs.docker.com/)
- [Docker Compose reference](https://docs.docker.com/compose/compose-file/)
