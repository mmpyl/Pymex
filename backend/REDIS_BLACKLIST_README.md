# Blacklist de Tokens con Redis - Implementación

## Resumen de Cambios

Se ha implementado un sistema de blacklist de tokens distribuido usando Redis para resolver el problema de revocación de tokens en entornos multi-instancia con load balancer.

## Problema Resuelto

**Antes:** El logout en la instancia A no revocaba el token en la instancia B cuando hay múltiples instancias del backend detrás de un load balancer.

**Ahora:** La blacklist se comparte entre todas las instancias usando Redis como almacén centralizado.

## Archivos Modificados/Creados

### 1. `backend/src/config/redis.js` (NUEVO)
Configuración del cliente Redis con:
- Soporte para variables de entorno (REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB)
- Reconexión automática con backoff exponencial
- Funciones asíncronas para verificar y revocar tokens
- TTL automático basado en la expiración del JWT

### 2. `backend/src/middleware/auth.js` (MODIFICADO)
- Detección automática de Redis con fallback a memoria local
- Funciones `isBlacklisted()` y `revokeToken()` ahora son asíncronas
- Middlewares `verificarTokenEmpresa()` y `verificarTokenAdmin()` actualizados a async/await
- Logging detallado para debugging

### 3. `backend/src/routes/auth.js` (MODIFICADO)
- Rutas `/logout` y `/admin/logout` actualizadas para usar async/await
- Mejor manejo de errores con logging

### 4. `backend/.env.example` (NUEVO)
Variables de entorno requeridas para configurar Redis

### 5. `backend/package.json` (MODIFICADO)
Dependencias agregadas:
- `ioredis@^5.10.1` - Cliente Redis recomendado para producción
- `redis@^5.12.1` - Cliente Redis oficial (incluido como alternativa)

## Configuración Requerida

### Opción A: Con Redis (Recomendado para Producción)

1. Instalar Redis en tu servidor o usar un servicio gestionado:
   ```bash
   # Docker
   docker run -d --name redis -p 6379:6379 redis:latest
   
   # Ubuntu/Debian
   sudo apt-get install redis-server
   ```

2. Configurar variables de entorno en `.env`:
   ```env
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=tu_password_opcional
   REDIS_DB=0
   ```

3. Reiniciar el backend

### Opción B: Sin Redis (Desarrollo / Una Sola Instancia)

El sistema detecta automáticamente si Redis no está disponible y usa un fallback en memoria. **Nota:** Esto solo funciona correctamente con una sola instancia del backend.

## Cómo Funciona

1. **Login:** Se genera un JWT con un identificador único (`jti`)
2. **Logout:** El `jti` del token se guarda en Redis con TTL igual al tiempo restante de expiración
3. **Cada Request:** El middleware verifica si el `jti` está en la blacklist antes de permitir el acceso
4. **Limpieza Automática:** Redis elimina automáticamente las entradas expiradas gracias al TTL

## Ventajas

✅ **Multi-instancia:** El logout funciona correctamente con load balancers  
✅ **Sin DB adicional:** No requiere tabla en PostgreSQL  
✅ **Alto rendimiento:** Redis es extremadamente rápido para operaciones SET/GET  
✅ **Auto-limpieza:** TTL nativo de Redis evita acumulación de datos  
✅ **Graceful degradation:** Funciona sin Redis (modo desarrollo)  

## Consideraciones de Seguridad

- Los tokens JWT deben tener vida corta (recomendado: 15-60 minutos)
- Usar HTTPS en producción para proteger los tokens en tránsito
- Rotar `JWT_SECRET` periódicamente
- Considerar refresh tokens para sesiones largas

## Testing

```bash
# Verificar sintaxis
cd backend
node -c src/config/redis.js
node -c src/middleware/auth.js
node -c src/routes/auth.js

# Iniciar backend y verificar logs
npm start
# Deberías ver: "[Auth] Usando Redis para blacklist de tokens"
# o: "[Auth] Redis no disponible, usando fallback en memoria"
```

## Migración

No requiere migración de base de datos. El cambio es transparente para los usuarios existentes.
