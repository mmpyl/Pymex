# SaPyme - Archivos de Despliegue

Este directorio contiene todos los archivos necesarios para desplegar la aplicación SaPyme usando Docker y Docker Compose.

## 📁 Estructura de Archivos

```
/workspace/
├── docker-compose.yml          # Orquestación de todos los servicios
├── .env.example                # Plantilla de variables de entorno
├── README_DEPLOYMENT.md        # Este archivo
├── backend/
│   ├── Dockerfile              # Imagen del backend (Node.js)
│   └── .dockerignore
├── database/
│   ├── Dockerfile              # Imagen de PostgreSQL con inicialización
│   ├── init/
│   │   └── database.sql        # Script de inicialización
│   └── .dockerignore
├── facturacion-service/
│   ├── Dockerfile              # Imagen del servicio de facturación (PHP)
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile              # Imagen del frontend (React + Nginx)
│   ├── nginx.conf              # Configuración de Nginx
│   └── .dockerignore
└── ml_service/
    ├── Dockerfile              # Imagen del servicio ML (FastAPI)
    └── .dockerignore
```

## 🚀 Servicios Incluidos

| Servicio | Tecnología | Puerto | Descripción |
|----------|-----------|--------|-------------|
| **database** | PostgreSQL 16 | 5432 | Base de datos principal |
| **backend** | Node.js 20 | 3000 | API REST principal |
| **frontend** | React + Vite + Nginx | 80 | Interfaz de usuario |
| **facturacion-service** | PHP 8.2 + Greenter | 8080 | Facturación electrónica |
| **ml_service** | FastAPI + Python 3.11 | 8000 | Servicio de Machine Learning |
| **redis** | Redis 7 | 6379 | Caché y colas |

## 🔧 Requisitos Previos

- Docker (versión 20.10 o superior)
- Docker Compose (versión 2.0 o superior)
- Al menos 4GB de RAM disponible
- 10GB de espacio en disco

## 📋 Instrucciones de Despliegue

### 1. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo .env con tus valores
# ¡IMPORTANTE! Cambiar JWT_SECRET en producción
```

### 2. Construir y Levantar Servicios

```bash
# Construir todas las imágenes
docker-compose build

# Levantar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f
```

### 3. Verificar Estado de los Servicios

```bash
# Ver estado de todos los contenedores
docker-compose ps

# Ver logs específicos de un servicio
docker-compose logs backend
docker-compose logs frontend
docker-compose logs ml_service
```

### 4. Acceder a los Servicios

Una vez levantados, puedes acceder a:

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **Facturación Service**: http://localhost:8080
- **ML Service**: http://localhost:8000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 🔍 Health Checks

Todos los servicios incluyen health checks automáticos:

```bash
# Ver salud de los contenedores
docker inspect --format='{{.State.Health.Status}}' sapyme-backend
docker inspect --format='{{.State.Health.Status}}' sapyme-frontend
docker inspect --format='{{.State.Health.Status}}' sapyme-database
```

## 🛑 Detener Servicios

```bash
# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (¡CUIDADO! Se pierden los datos)
docker-compose down -v

# Detener, eliminar volúmenes y eliminar imágenes
docker-compose down -v --rmi all
```

## 🔄 Actualizar Servicios

```bash
# Reconstruir y reiniciar un servicio específico
docker-compose up -d --build backend

# Actualizar todos los servicios
docker-compose up -d --build
```

## 📊 Comandos Útiles

```bash
# Ejecutar comando dentro de un contenedor
docker-compose exec backend npm run test
docker-compose exec ml_service python --version

# Ver uso de recursos
docker stats

# Acceder a la base de datos
docker-compose exec database psql -U postgres -d sapyme_db

# Reiniciar un servicio
docker-compose restart backend
```

## 🔐 Consideraciones de Seguridad

### Para Producción:

1. **Cambiar contraseñas por defecto** en el archivo `.env`
2. **Generar un JWT_SECRET seguro**:
   ```bash
   openssl rand -base64 32
   ```
3. **Usar HTTPS** configurando un reverse proxy (Nginx/Traefik)
4. **Restringir acceso** a puertos sensibles (5432, 6379)
5. **Configurar firewall** para solo permitir tráfico necesario
6. **Actualizar imágenes regularmente** para parches de seguridad

## 🐛 Troubleshooting

### Error: "Cannot start service"
```bash
# Limpiar redes y volúmenes huérfanos
docker network prune
docker volume prune
```

### Error: "Port already in use"
```bash
# Identificar proceso usando el puerto
lsof -i :3000

# O cambiar el puerto en docker-compose.yml
```

### Error: "Health check failed"
```bash
# Ver logs del servicio
docker-compose logs <nombre-servicio>

# Reiniciar el servicio
docker-compose restart <nombre-servicio>
```

## 📝 Notas Adicionales

- Los volúmenes `postgres_data` y `redis_data` persisten los datos entre reinicios
- El frontend está configurado como SPA con soporte para routing del lado del cliente
- Todos los servicios se reinician automáticamente si fallan (`restart: unless-stopped`)
- La red `sapyme-network` aísla los servicios del host

## 🤝 Soporte

Para más información, consultar la documentación de cada servicio en sus respectivos directorios.
