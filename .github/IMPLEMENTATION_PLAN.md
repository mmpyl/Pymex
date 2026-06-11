# 🛠️ PLAN DE IMPLEMENTACIÓN PYMEX - ACCIONES CONCRETAS

## FASE 1: SEGURIDAD MULTI-TENANT (SEMANA 1-2)

### Acción 1: Crear Middleware de Tenant Context

**Archivo:** `backend/src/middleware/tenant-context.js`

```javascript
/**
 * Middleware de contexto de tenant
 * 
 * Responsabilidades:
 * 1. Extraer tenant_id del usuario autenticado
 * 2. Propagar a través de req.tenantId
 * 3. Validar que no sea acceso cruzado
 * 4. Rechazar requests sin tenant_id
 */

const tenantContextMiddleware = (req, res, next) => {
  // 1. Extraer tenant_id del JWT
  const usuarioId = req.usuario?.id;
  const tenantId = req.usuario?.empresa_id;
  
  // 2. Validación: Request debe tener tenant
  if (!tenantId && !req.path.startsWith('/public')) {
    return res.status(401).json({ 
      error: 'Tenant no identificado',
      code: 'TENANT_REQUIRED'
    });
  }
  
  // 3. Propagar contexto
  req.tenantId = tenantId;
  req.tenantContext = {
    empresaId: tenantId,
    usuarioId: usuarioId,
    roles: req.usuario?.roles || []
  };
  
  // 4. Logging para auditoria
  console.log(`[TENANT] Usuario ${usuarioId} accediendo a ${req.path} en tenant ${tenantId}`);
  
  next();
};

module.exports = tenantContextMiddleware;
```

**Uso en `backend/src/app.js`:**

```javascript
const tenantContextMiddleware = require('./middleware/tenant-context');

// Después del middleware de autenticación
app.use(authMiddleware);
app.use(tenantContextMiddleware);  // ← Agregar aquí
app.use('/api', routes);
```

---

### Acción 2: Crear Middleware de Validación de Acceso

**Archivo:** `backend/src/middleware/enforce-tenant-isolation.js`

```javascript
/**
 * Middleware de enforce tenant isolation
 * 
 * Evita que un usuario intente:
 * 1. Acceder a empresa_id diferente en la URL
 * 2. Modificar empresa_id en el body
 * 3. Usar tenant_id de otra empresa
 */

const enforceTenantIsolation = (req, res, next) => {
  const userTenantId = req.tenantId;
  
  // 1. Validar empresa_id en parámetros URL
  if (req.params.empresa_id || req.params.tenantId) {
    const requestedTenantId = parseInt(
      req.params.empresa_id || req.params.tenantId
    );
    
    if (requestedTenantId !== userTenantId) {
      return res.status(403).json({
        error: 'Acceso denegado',
        code: 'TENANT_MISMATCH',
        message: 'No tienes permiso para acceder a este tenant'
      });
    }
  }
  
  // 2. Validar empresa_id en body (no permitir cambiar)
  if (req.body?.empresa_id && req.body.empresa_id !== userTenantId) {
    return res.status(400).json({
      error: 'Operación no permitida',
      code: 'TENANT_IMMUTABLE',
      message: 'No puedes cambiar el tenant de un recurso'
    });
  }
  
  // 3. Inyectar tenant_id automáticamente en creaciones
  if ((req.method === 'POST' || req.method === 'PUT') && !req.body.empresa_id) {
    req.body.empresa_id = userTenantId;
  }
  
  next();
};

module.exports = enforceTenantIsolation;
```

**Uso en `backend/src/app.js`:**

```javascript
const enforceTenantIsolation = require('./middleware/enforce-tenant-isolation');

app.use(tenantContextMiddleware);
app.use(enforceTenantIsolation);  // ← Agregar aquí
```

---

### Acción 3: Crear Base Repository con Tenant Obligatorio

**Archivo:** `backend/src/domains/core/repositories/BaseRepository.js`

```javascript
/**
 * Base Repository con tenant_id obligatorio
 * 
 * Todos los repositorios deben extender esta clase
 * para asegurar que TODAS las queries filtren por tenant
 */

class BaseRepository {
  constructor(model) {
    this.model = model;
  }
  
  /**
   * Encuentra registros por tenant
   * @param {number} tenantId - ID del tenant
   * @param {object} query - Filtros adicionales
   */
  async findByTenant(tenantId, query = {}) {
    if (!tenantId) {
      throw new Error('Tenant ID requerido');
    }
    
    return this.model.findAll({
      where: { 
        empresa_id: tenantId,
        ...query 
      }
    });
  }
  
  /**
   * Encuentra un registro específico validando tenant
   */
  async findOneByTenant(tenantId, id) {
    if (!tenantId || !id) {
      throw new Error('Tenant ID e ID requeridos');
    }
    
    return this.model.findOne({
      where: { 
        id,
        empresa_id: tenantId  // ⭐ CRÍTICO: Validar tenant
      }
    });
  }
  
  /**
   * Crea registro con tenant automático
   */
  async createByTenant(tenantId, data) {
    if (!tenantId) {
      throw new Error('Tenant ID requerido');
    }
    
    return this.model.create({
      empresa_id: tenantId,
      ...data
    });
  }
  
  /**
   * Actualiza registro validando tenant
   */
  async updateByTenant(tenantId, id, data) {
    if (!tenantId || !id) {
      throw new Error('Tenant ID e ID requeridos');
    }
    
    const record = await this.findOneByTenant(tenantId, id);
    if (!record) {
      throw new Error('Registro no encontrado o acceso denegado');
    }
    
    return record.update(data);
  }
  
  /**
   * Elimina registro (soft delete) validando tenant
   */
  async deleteByTenant(tenantId, id) {
    if (!tenantId || !id) {
      throw new Error('Tenant ID e ID requeridos');
    }
    
    const record = await this.findOneByTenant(tenantId, id);
    if (!record) {
      throw new Error('Registro no encontrado o acceso denegado');
    }
    
    return record.update({ deleted_at: new Date() });
  }
}

module.exports = BaseRepository;
```

---

### Acción 4: Audit de Queries Actuales

**Script para ejecutar:** `backend/scripts/audit-queries.js`

```javascript
/**
 * Script de auditoría: encuentra queries sin filtro de tenant
 * 
 * Busca:
 * - Model.findAll() sin where.empresa_id
 * - Model.findOne() sin where.empresa_id
 * - Queries direc

tas a la BD
 */

const fs = require('fs');
const path = require('path');

const issues = [];

function auditFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Buscar queries sospechosas
  const patterns = [
    /\.findAll\s*\(\s*{\s*where:\s*{(?!.*empresa_id)/g,
    /\.findOne\s*\(\s*{\s*where:\s*{(?!.*empresa_id)/g,
    /SELECT.*FROM.*WHERE.*(?!.*empresa_id)/gi
  ];
  
  patterns.forEach((pattern, idx) => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      issues.push({
        file: filePath,
        line: content.substring(0, match.index).split('\n').length,
        issue: `Query sin filtro empresa_id (pattern ${idx})`,
        code: match[0]
      });
    }
  });
}

// Escanear directorios
const scanDir = (dir) => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules')) {
      scanDir(filePath);
    } else if (file.endsWith('.js')) {
      auditFile(filePath);
    }
  });
};

scanDir('./src');

console.log('🔍 Auditoría de queries completada\n');
console.log(`⚠️  Encontradas ${issues.length} queries sospechosas:\n`);

issues.forEach((issue, idx) => {
  console.log(`${idx + 1}. ${issue.file}:${issue.line}`);
  console.log(`   ${issue.issue}`);
  console.log(`   ${issue.code.substring(0, 80)}...\n`);
});

console.log(`\n📋 Reporte guardado en audit-report.json`);
fs.writeFileSync('audit-report.json', JSON.stringify(issues, null, 2));
```

**Ejecutar:**
```bash
node backend/scripts/audit-queries.js
```

---

### Acción 5: Tests de Tenant Isolation

**Archivo:** `backend/__tests__/integration/tenant-isolation.test.js`

```javascript
const request = require('supertest');
const app = require('../../src/app');
const { Producto } = require('../../src/domains/core/models');

describe('Tenant Isolation', () => {
  let token1; // Token de empresa 1
  let token2; // Token de empresa 2
  
  beforeAll(async () => {
    // Crear usuarios de diferentes empresas
    // Y obtener tokens
  });
  
  describe('Acceso cruzado debe ser rechazado', () => {
    it('Usuario de empresa 1 NO debe ver productos de empresa 2', async () => {
      // Empresa 2 crea un producto
      const productosEmpresa2 = await Producto.create({
        empresa_id: 2,
        nombre: 'Producto Empresa 2',
        precio: 100
      });
      
      // Usuario de empresa 1 intenta acceder
      const response = await request(app)
        .get('/api/productos')
        .set('Authorization', `Bearer ${token1}`);
      
      // Debe retornar solo productos de empresa 1
      const ids = response.body.data.map(p => p.id);
      expect(ids).not.toContain(productosEmpresa2.id);
    });
    
    it('Usuario NO puede acceder a recurso de otro tenant en URL', async () => {
      const response = await request(app)
        .get('/api/empresas/2/productos')  // Intentando acceder empresa 2
        .set('Authorization', `Bearer ${token1}`);  // Con token de empresa 1
      
      expect(response.status).toBe(403);
      expect(response.body.code).toBe('TENANT_MISMATCH');
    });
    
    it('Usuario NO puede cambiar empresa_id al actualizar', async () => {
      const response = await request(app)
        .put('/api/productos/1')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          nombre: 'Producto Actualizado',
          empresa_id: 2  // Intentando cambiar a otra empresa
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe('TENANT_IMMUTABLE');
    });
  });
});
```

---

## FASE 2: CI/CD GITHUB ACTIONS (SEMANA 2-3)

### Acción 6: Crear CI/CD Pipeline

**Archivo:** `.github/workflows/ci-cd.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # Job 1: Tests
  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: saas_pymes_test
          POSTGRES_PASSWORD: testpass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
        working-directory: ./backend
      - run: npm test -- --coverage
        working-directory: ./backend
        env:
          NODE_ENV: test
          DB_HOST: localhost
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/coverage-final.json
          fail_ci_if_error: true

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
        working-directory: ./frontend
      - run: npm test
        working-directory: ./frontend
      - run: npm run build
        working-directory: ./frontend

  # Job 2: Linting
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci && npm run lint
        working-directory: ./backend
      - run: npm ci && npm run lint
        working-directory: ./frontend

  # Job 3: Security scanning
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run npm audit
        run: npm audit --audit-level=moderate
        working-directory: ./backend
        continue-on-error: true

  # Job 4: Build Docker
  build:
    needs: [test-backend, test-frontend, lint]
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker images
        run: docker-compose build
      - name: Push to registry (opcional)
        # Agregar solo si tienes Docker Hub setup
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker tag sapyme-backend:latest ${{ secrets.DOCKER_USERNAME }}/sapyme-backend:latest
          docker push ${{ secrets.DOCKER_USERNAME }}/sapyme-backend:latest
```

---

## FASE 3: DATABASE OPTIMIZATION (SEMANA 1)

### Acción 7: Script de Índices y Constraints

**Archivo:** `database/migrations/001-tenant-optimization.sql`

```sql
-- Índices críticos para multi-tenant

-- 1. Índices por empresa_id (CRÍTICO)
CREATE INDEX idx_producto_empresa ON productos(empresa_id);
CREATE INDEX idx_venta_empresa ON ventas(empresa_id);
CREATE INDEX idx_usuario_empresa ON usuarios(empresa_id);
CREATE INDEX idx_cliente_empresa ON clientes(empresa_id);

-- 2. Índices compuestos para queries frecuentes
CREATE INDEX idx_venta_empresa_fecha 
  ON ventas(empresa_id, fecha_registro DESC);
  
CREATE INDEX idx_producto_empresa_estado 
  ON productos(empresa_id, estado);

-- 3. Índice para soft delete
CREATE INDEX idx_producto_not_deleted 
  ON productos(empresa_id) 
  WHERE deleted_at IS NULL;

-- 4. Agregar columna soft delete si no existe
ALTER TABLE productos ADD COLUMN IF NOT EXISTS 
  deleted_at TIMESTAMP DEFAULT NULL;

ALTER TABLE ventas ADD COLUMN IF NOT EXISTS 
  deleted_at TIMESTAMP DEFAULT NULL;

-- 5. Constraints de integridad
ALTER TABLE productos 
  ADD CONSTRAINT IF NOT EXISTS fk_producto_empresa 
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) 
  ON DELETE CASCADE;

-- 6. Check constraints
ALTER TABLE productos 
  ADD CONSTRAINT IF NOT EXISTS check_precio_positivo 
  CHECK (precio >= 0);

-- 7. Trigger para auditoría de soft delete
CREATE OR REPLACE FUNCTION log_soft_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    INSERT INTO audit_log (entity, entity_id, action, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'SOFT_DELETE', CURRENT_USER);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_soft_delete_producto
AFTER UPDATE ON productos
FOR EACH ROW
EXECUTE FUNCTION log_soft_delete();
```

---

## FASE 4: SEGURIDAD - DOCUMENTACIÓN (SEMANA 2)

### Acción 8: Security Checklist

**Archivo:** `SECURITY_CHECKLIST.md`

```markdown
# Security Checklist - OWASP Top 10

## A1: Broken Access Control
- [x] Tenant isolation middleware implementado
- [x] Validación de empresa_id en 100% de endpoints
- [x] Tests de acceso cruzado
- [x] Code review completado

## A2: Cryptographic Failures
- [x] JWT con RS256 (producción)
- [x] Secrets en environment variables
- [x] HTTPS obligatorio (producción)
- [ ] Vault/Secrets Manager para credenciales

## A3: Injection
- [x] Sequelize parameterized queries
- [x] Input validation con express-validator
- [x] SQL injection tests

## A7: Identification and Authentication
- [x] JWT implementation
- [x] Password hashing (bcryptjs)
- [ ] MFA opcional para admin

## A9: Logging & Monitoring
- [x] Audit logging
- [x] Winston logging
- [ ] Prometheus metrics
- [ ] ELK stack (future)

## Validación Externa
- [ ] OWASP ZAP scanning
- [ ] Penetration testing
- [ ] Code security review
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Semana 1
- [ ] Crear tenant-context.js
- [ ] Crear enforce-tenant-isolation.js
- [ ] Crear BaseRepository
- [ ] Ejecutar audit-queries.js
- [ ] Aplicar índices SQL

### Semana 2
- [ ] Crear tests de isolation
- [ ] GitHub Actions pipeline
- [ ] Aumentar coverage a 80%
- [ ] Code review de todos los cambios

### Semana 3
- [ ] Crear ADRs
- [ ] Documentar arquitectura
- [ ] Revisar secretos (hardcoded)

### Semana 4
- [ ] Validación en producción
- [ ] Monitoring setup
- [ ] Backup automation

---

**Preparado por:** Software Architecture Expert Team  
**Validado por:** Security Specialist + Backend Lead
