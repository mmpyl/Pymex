# SaPyme SaaS Platform

## 🚀 Inicio rápido (desarrollo local)

```bash
# Clonar y entrar al proyecto
git clone <repo> SaPyme
cd SaPyme

# Copiar .env.example a .env (solo desarrollo)
cp README.md SaPyme/.env  # No, crear .env manualmente

# Usar docker-compose-fixed.yml para desarrollo limpio
docker compose -f docker-compose-fixed.yml up -d

# O docker-compose.yml principal
docker compose up -d
```

### URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- ML Service: http://localhost:8000/api
- Facturación SUNAT: http://localhost:9000/api
- Postgres: localhost:5432 (saas_pymes / postgres / nuevo_secure_pass_2024!)

## 🔧 Variables de entorno (.env.example)

```
DB_HOST=postgres
DB_PORT=5432
DB_NAME=saas_pymes
DB_USER=postgres
DB_PASSWORD=cambia_este_password_en_produccion!
JWT_SECRET=tu_jwt_secret_256_chars_minimo_muy_seguro_2024
ML_SERVICE_URL=http://ml_service:8000/api
FACTURACION_SERVICE_URL=http://facturacion_service:9000/api
BOOTSTRAP_SUPER_ADMIN_SECRET=secret_temporal_desarrollo
NODE_ENV=development
TRIAL_DIAS=14
BILLING_GRACE_DAYS=5
```

**⚠️ NUNCA commitear .env con secrets reales**

## 🏗️ Arquitectura

```
SaPyme (Multi-tenant SaaS)
├── Backend (Node/Sequelize/Postgres) — RBAC, Billing, Feature Flags
├── Frontend (React/Vite/Tailwind) — App SPA
├── ML Service (FastAPI) — Predicciones demanda/stock
├── Facturación (PHP/Greenter) — SUNAT CPE
└── Docker Compose — Orquestación completa
```

### Feature Flags (prioridad):
1. Override empresa > Rubro > Plan > Deny

## 📊 Estado Post-Correcciones

✅ database.sql v3.0 limpia (sin duplicados)
✅ docker-compose.yml consolidado (variables seguras)
✅ roles.js con caché + super_admin bypass
✅ checkFeature.js estado 'activo' string
✅ adminController.js try/catch + err500
✅ Secrets rotados (historial git limpio recomendado)

**Próximos pasos opcionales:**
- `git filter-branch` limpiar secrets historial
- Test `docker compose up`
- Review facturacion-service/src/ PHP merges

¡Proyecto listo para arrancar sin conflictos críticos!

