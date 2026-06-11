# 🚀 GUÍA DE ONBOARDING - SaPyme

## Para Nuevos Desarrolladores

Esta guía te ayudará a configurar tu entorno de desarrollo y comenzar a contribuir al proyecto en menos de 30 minutos.

---

## 📋 Prerrequisitos

### Software Requerido
- [ ] **Node.js** v18.x o superior → `node --version`
- [ ] **npm** v9.x o superior → `npm --version`
- [ ] **PostgreSQL** v15.x o superior → `psql --version`
- [ ] **Redis** v7.x (opcional para cache) → `redis-cli --version`
- [ ] **Git** → `git --version`
- [ ] **Docker** (opcional pero recomendado) → `docker --version`

### Herramientas Recomendadas
- [ ] **VS Code** con extensiones:
  - ESLint
  - Prettier
  - PostgreSQL Explorer
  - Thunder Client o Postman
  - GitLens
- [ ] **DBeaver** o **pgAdmin** para gestión de BD

---

## ⚡ Instalación Rápida

### Paso 1: Clonar el Repositorio

```bash
cd /workspace
git clone <url-del-repositorio> sapyme
cd sapyme
```

### Paso 2: Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend (si existe)
cd ../frontend
npm install
```

### Paso 3: Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cd backend
cp .env.example .env

# Editar .env con tus credenciales locales
nano .env  # o usa tu editor preferido
```

#### Variables Mínimas Requeridas

```env
# Servidor
NODE_ENV=development
PORT=3000

# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sapyme_dev
DB_USER=tu_usuario
DB_PASSWORD=tu_password

# JWT Secret (genera uno único)
JWT_SECRET=tu_secret_muy_seguro_cambia_esto

# Redis (opcional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Paso 4: Crear Base de Datos

```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear database
CREATE DATABASE sapyme_dev;

# Crear usuario (opcional)
CREATE USER sapyme_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE sapyme_dev TO sapyme_user;

# Salir
\q
```

### Paso 5: Ejecutar Migraciones

```bash
cd backend

# Ejecutar todas las migraciones
npm run migrate

# O manualmente con psql
psql -U tu_usuario -d sapyme_dev -f database/migrations/v3.2_indices_criticos.sql
```

### Paso 6: Iniciar Servidor de Desarrollo

```bash
# Modo desarrollo con auto-reload
npm run dev

# El servidor estará en http://localhost:3000
```

---

## ✅ Verificación de Instalación

### Test 1: Health Check

```bash
curl http://localhost:3000/health
# Debería responder: {"status": "ok", "timestamp": "..."}
```

### Test 2: Conexión a BD

```bash
curl http://localhost:3000/health/db
# Debería responder: {"database": "connected"}
```

### Test 3: Ejecutar Tests Unitarios

```bash
npm test
# Debería pasar todos los tests (>90% coverage)
```

---

## 📁 Estructura del Proyecto

```
sapyme/
├── backend/                    # API REST (Node.js + TypeScript)
│   ├── src/
│   │   ├── controllers/        # Manejo de requests HTTP
│   │   │   ├── productoController.ts
│   │   │   ├── clienteController.ts
│   │   │   └── ...
│   │   ├── services/           # Lógica de negocio
│   │   ├── models/             # Modelos Sequelize
│   │   ├── middleware/         # Auth, validación, errores
│   │   ├── routes/             # Definición de rutas
│   │   ├── interfaces/         # Interfaces TypeScript
│   │   ├── types/              # Tipos y DTOs
│   │   └── server.ts           # Entry point
│   ├── database/
│   │   └── migrations/         # Scripts SQL
│   ├── tests/                  # Tests automatizados
│   └── docs/                   # Documentación
├── frontend/                   # Web App (React)
├── mobile/                     # App Móvil (React Native)
└── database/
    └── migrations/             # Migraciones compartidas
```

---

## 🔧 Comandos Útiles

### Desarrollo

```bash
# Iniciar servidor con auto-reload
npm run dev

# Compilar TypeScript a JavaScript
npm run build

# Verificar tipos sin compilar
npm run typecheck

# Corregir problemas de linting
npm run lint:fix
```

### Testing

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch (auto-rerun)
npm run test:watch

# Tests end-to-end
npm run test:e2e

# Coverage report
npm test -- --coverage
```

### Base de Datos

```bash
# Ejecutar migraciones
npm run migrate

# Seedear datos de prueba
npm run seed

# Resetear base de datos (¡CUIDADO!)
npm run db:reset
```

---

## 🎯 Primeras Tareas Sugeridas

### Día 1: Familiarización

1. [ ] Leer `docs/ARQUITECTURA.md`
2. [ ] Explorar la estructura de carpetas
3. [ ] Ejecutar tests y verificar que pasan
4. [ ] Hacer un cambio pequeño (ej: actualizar README)

### Día 2: Primer Feature

1. [ ] Elegir un ticket simple del backlog
2. [ ] Crear rama: `git checkout -b feature/tu-feature`
3. [ ] Implementar con TDD si es posible
4. [ ] Asegurar >90% coverage
5. [ ] Crear Pull Request

### Día 3: Profundización

1. [ ] Entender el flujo de autenticación
2. [ ] Revisar cómo funciona Event Bus
3. [ ] Estudiar patrones de diseño usados
4. [ ] Pair programming con otro dev

---

## 🐛 Troubleshooting Común

### Error: "Cannot find module"

```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: "Database connection failed"

```bash
# Verificar PostgreSQL está corriendo
sudo systemctl status postgresql

# Verificar credenciales en .env
# Verificar database existe
psql -l | grep sapyme_dev
```

### Error: "Port 3000 already in use"

```bash
# Matar proceso usando el puerto
lsof -ti:3000 | xargs kill -9

# O cambiar puerto en .env
PORT=3001
```

### Error: TypeScript compilation errors

```bash
# Verificar versión de TypeScript
npx tsc --version

# Regenerar tipos
npm run typecheck

# Revisar tsconfig.json
```

---

## 📚 Recursos de Aprendizaje

### Documentación Interna

| Documento | Descripción |
|-----------|-------------|
| `docs/ARQUITECTURA.md` | Visión general del sistema |
| `docs/API_REFERENCE.md` | Endpoints disponibles |
| `docs/DOMAIN_MODEL.md` | Modelo de dominio DDD |
| `docs/RUNBOOK.md` | Operaciones y troubleshooting |

### Enlaces Externos

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Sequelize ORM Docs](https://sequelize.org/)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)

---

## 👥 Equipo y Comunicación

### Canales de Slack

- `#dev-general` - Discusiones generales
- `#dev-help` - Pedir ayuda
- `#dev-releases` - Anuncios de releases
- `#dev-random` - Off-topic

### Reuniones Recurrentes

- **Daily Standup**: Lunes a Viernes, 10:00 AM
- **Planning**: Lunes, 2:00 PM
- **Retro**: Viernes, 4:00 PM
- **Tech Talk**: Miércoles, 3:00 PM (rotativo)

### Convenciones de Git

```bash
# Formato de commits
feat: agregar búsqueda de productos
fix: corregir cálculo de stock
docs: actualizar README
refactor: mejorar estructura de controladores
test: agregar tests para authController
chore: actualizar dependencias

# Ramas
feature/nombre-feature    # Nuevas funcionalidades
fix/nombre-fix            # Correcciones
hotfix/critico            # Urgentes en producción
release/vX.X.X            # Preparación release
```

---

## 🎓 Checklist de Onboarding

Marcar cuando se complete:

- [ ] Entorno configurado y funcionando
- [ ] Tests pasando localmente
- [ ] Primer commit realizado
- [ ] Primer PR mergeado
- [ ] Entendido flujo de CI/CD
- [ ] Conocido el equipo
- [ ] Leído documentación principal
- [ ] Completado primer feature independiente

---

## 📞 ¿Necesitas Ayuda?

1. **Revisa la documentación** - 80% de las dudas están respondidas aquí
2. **Busca en Slack** - Usa el search antes de preguntar
3. **Pregunta en #dev-help** - Incluye qué intentaste y errores
4. **Pair programming** - Agenda sesión con algún senior

**¡Bienvenido al equipo! 🎉**

---

**Versión**: 3.2.0  
**Última actualización**: 2024  
**Mantenido por**: Equipo de Desarrollo SaPyme
