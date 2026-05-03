-- === SAAS PYMES (SaPyme) — Base de datos completa v3.0 ===
-- Full schema for PostgreSQL 16

-- SECCIÓN 1: TABLAS BASE
CREATE TABLE IF NOT EXISTS empresas (
    id               SERIAL PRIMARY KEY,
    nombre           VARCHAR(100)  NOT NULL,
    ruc              VARCHAR(20)   UNIQUE,
    direccion        VARCHAR(200),
    telefono         VARCHAR(20),
    email            VARCHAR(100)  UNIQUE NOT NULL,
    plan             VARCHAR(20)   DEFAULT 'basico',
    estado           VARCHAR(10)   DEFAULT 'activo',
    fecha_registro   TIMESTAMP     DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(50)  NOT NULL,
    descripcion VARCHAR(200),
    UNIQUE(nombre)
);

CREATE TABLE IF NOT EXISTS usuarios (
    id               SERIAL PRIMARY KEY,
    empresa_id       INT          NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    rol_id           INT          NOT NULL REFERENCES roles(id),
    nombre           VARCHAR(100) NOT NULL,
    email            VARCHAR(100) NOT NULL,
    password         VARCHAR(255) NOT NULL,
    estado           VARCHAR(10)  DEFAULT 'activo',
    fecha_registro   TIMESTAMP    DEFAULT NOW(),
    UNIQUE(empresa_id, email)
);

CREATE TABLE IF NOT EXISTS usuarios_admin (
    id             SERIAL PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    email          VARCHAR(100) NOT NULL UNIQUE,
    password       VARCHAR(255) NOT NULL,
    rol            VARCHAR(30)  NOT NULL DEFAULT 'super_admin',
    estado         VARCHAR(15)  NOT NULL DEFAULT 'activo',
    creado_en      TIMESTAMP    DEFAULT NOW(),
    actualizado_en TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categorias (
    id          SERIAL PRIMARY KEY,
    empresa_id  INT          NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nombre      VARCHAR(100) NOT NULL,
    descripcion VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS productos (
    id              SERIAL PRIMARY KEY,
    empresa_id      INT            NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    categoria_id    INT            REFERENCES categorias(id),
    nombre          VARCHAR(150)   NOT NULL,
    descripcion     VARCHAR(300),
    precio_compra   DECIMAL(10,2)  DEFAULT 0,
    precio_venta    DECIMAL(10,2)  NOT NULL,
    stock           INT            DEFAULT 0,
    stock_minimo    INT            DEFAULT 5,
    estado          VARCHAR(10)    DEFAULT 'activo',
    fecha_registro  TIMESTAMP      DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clientes (
    id          SERIAL PRIMARY KEY,
    empresa_id  INT          NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nombre      VARCHAR(100) NOT NULL,
    documento   VARCHAR(20),
    email       VARCHAR(100),
    telefono    VARCHAR(20),
    direccion   VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS proveedores (
    id          SERIAL PRIMARY KEY,
    empresa_id  INT          NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nombre      VARCHAR(100) NOT NULL,
    documento   VARCHAR(20),
    email       VARCHAR(100),
    telefono    VARCHAR(20),
    direccion   VARCHAR(200),
    contacto    VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS ventas (
    id          SERIAL PRIMARY KEY,
    empresa_id  INT           NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    cliente_id  INT           REFERENCES clientes(id),
    usuario_id  INT           NOT NULL REFERENCES usuarios(id),
    fecha       TIMESTAMP     DEFAULT NOW(),
    total       DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(30)   DEFAULT 'efectivo',
    estado      VARCHAR(20)   DEFAULT 'completada',
    notas       TEXT
);

CREATE TABLE IF NOT EXISTS detalle_ventas (
    id              SERIAL PRIMARY KEY,
    venta_id        INT            NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id     INT            NOT NULL REFERENCES productos(id),
    cantidad        INT            NOT NULL,
    precio_unitario DECIMAL(10,2)  NOT NULL,
    subtotal        DECIMAL(10,2)  NOT NULL
);

CREATE TABLE IF NOT EXISTS gastos (
    id          SERIAL PRIMARY KEY,
    empresa_id  INT           NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    usuario_id  INT           NOT NULL REFERENCES usuarios(id),
    categoria   VARCHAR(100)  NOT NULL,
    descripcion VARCHAR(300),
    monto       DECIMAL(10,2) NOT NULL,
    fecha       TIMESTAMP     DEFAULT NOW(),
    comprobante VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS movimientos_inventario (
    id          SERIAL PRIMARY KEY,
    empresa_id  INT         NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    producto_id INT         NOT NULL REFERENCES productos(id),
    usuario_id  INT         NOT NULL REFERENCES usuarios(id),
    tipo        VARCHAR(20) NOT NULL,
    cantidad    INT         NOT NULL,
    motivo      VARCHAR(200),
    fecha       TIMESTAMP   DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alertas (
    id          SERIAL PRIMARY KEY,
    empresa_id  INT         NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    tipo        VARCHAR(50) NOT NULL,
    mensaje     TEXT        NOT NULL,
    leido       BOOLEAN     DEFAULT FALSE,
    fecha       TIMESTAMP   DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS predicciones (
    id              SERIAL PRIMARY KEY,
    empresa_id      INT            NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    producto_id     INT            REFERENCES productos(id) ON DELETE SET NULL,
    tipo            VARCHAR(50)    NOT NULL,
    periodo         VARCHAR(30)    NOT NULL,
    valor_predicho  DECIMAL(12,2)  NOT NULL,
    confianza       DECIMAL(5,2)   DEFAULT 0,
    modelo          VARCHAR(100),
    fecha_creacion  TIMESTAMP      DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comprobantes (
    id                SERIAL PRIMARY KEY,
    empresa_id        INT            NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    venta_id          INT            REFERENCES ventas(id),
    tipo              VARCHAR(10)    NOT NULL,
    serie             VARCHAR(5)     NOT NULL,
    correlativo       INT            NOT NULL,
    numero            VARCHAR(20)    NOT NULL,
    ruc_cliente       VARCHAR(11),
    razon_social      VARCHAR(200),
    direccion         VARCHAR(300),
    subtotal          DECIMAL(12,2),
    igv               DECIMAL(12,2),
    total             DECIMAL(12,2),
    moneda            VARCHAR(3)     DEFAULT 'PEN',
    estado            VARCHAR(20)    DEFAULT 'pendiente',
    sunat_estado      VARCHAR(50),
    sunat_descripcion TEXT,
    xml_path          VARCHAR(300),
    cdr_path          VARCHAR(300),
    pdf_path          VARCHAR(300),
    hash              VARCHAR(100),
    fecha_emision     TIMESTAMP      DEFAULT NOW(),
    fecha_envio       TIMESTAMP,
    entorno           VARCHAR(15)    DEFAULT 'beta'
);

CREATE TABLE IF NOT EXISTS series_comprobante (
    id          SERIAL PRIMARY KEY,
    empresa_id  INT         NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    tipo        VARCHAR(10) NOT NULL,
    serie       VARCHAR(5)  NOT NULL,
    correlativo INT         DEFAULT 0,
    UNIQUE(empresa_id, serie)
);

-- SECCIÓN 2: BILLING Y FEATURE MANAGEMENT
CREATE TABLE IF NOT EXISTS planes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    precio_mensual DECIMAL(10,2) NOT NULL DEFAULT 0,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',
    creado_en TIMESTAMP DEFAULT NOW(),
    actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS features (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(60) NOT NULL UNIQUE,
    descripcion VARCHAR(300),
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',
    creado_en TIMESTAMP DEFAULT NOW(),
    actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plan_features (
    id SERIAL PRIMARY KEY,
    plan_id INT NOT NULL REFERENCES planes(id) ON DELETE CASCADE,
    feature_id INT NOT NULL REFERENCES features(id) ON DELETE CASCADE,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT NOW(),
    actualizado_en TIMESTAMP DEFAULT NOW(),
    UNIQUE(plan_id, feature_id)
);

CREATE TABLE IF NOT EXISTS plan_limits (
    id SERIAL PRIMARY KEY,
    plan_id INT NOT NULL REFERENCES planes(id) ON DELETE CASCADE,
    limite VARCHAR(80) NOT NULL,
    valor INT NOT NULL,
    creado_en TIMESTAMP DEFAULT NOW(),
    actualizado_en TIMESTAMP DEFAULT NOW(),
    UNIQUE(plan_id, limite)
);

CREATE TABLE IF NOT EXISTS suscripciones (
    id SERIAL PRIMARY KEY,
    empresa_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    plan_id INT NOT NULL REFERENCES planes(id),
    estado VARCHAR(20) NOT NULL DEFAULT 'activa',
    fecha_inicio TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_fin TIMESTAMP,
    auto_renovacion BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT NOW(),
    actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feature_overrides (
    id SERIAL PRIMARY KEY,
    empresa_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    feature_id INT NOT NULL REFERENCES features(id) ON DELETE CASCADE,
    activo BOOLEAN NOT NULL,
    motivo VARCHAR(300),
    creado_en TIMESTAMP DEFAULT NOW(),
    actualizado_en TIMESTAMP DEFAULT NOW(),
    UNIQUE(empresa_id, feature_id)
);

CREATE TABLE IF NOT EXISTS pagos (
    id SERIAL PRIMARY KEY,
    empresa_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    suscripcion_id INT NOT NULL REFERENCES suscripciones(id) ON DELETE CASCADE,
    monto DECIMAL(10,2) NOT NULL,
    moneda VARCHAR(5) NOT NULL DEFAULT 'PEN',
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    fecha_vencimiento TIMESTAMP NOT NULL,
    fecha_pago TIMESTAMP,
    referencia VARCHAR(120),
    creado_en TIMESTAMP DEFAULT NOW(),
    actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auditoria_admin (
    id SERIAL PRIMARY KEY,
    admin_usuario_id INT NOT NULL,
    accion VARCHAR(120) NOT NULL,
    entidad VARCHAR(60) NOT NULL,
    entidad_id INT,
    detalles JSONB,
    ip VARCHAR(64),
    creado_en TIMESTAMP DEFAULT NOW()
);

-- SECCIÓN 3: RUBROS Y PAYMENT EVENTS
CREATE TABLE IF NOT EXISTS rubros (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(300)
);

CREATE TABLE IF NOT EXISTS empresa_rubro (
    empresa_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    rubro_id INT NOT NULL REFERENCES rubros(id) ON DELETE CASCADE,
    PRIMARY KEY (empresa_id, rubro_id)
);

CREATE TABLE IF NOT EXISTS payment_events (
    id SERIAL PRIMARY KEY,
    proveedor VARCHAR(30) NOT NULL,
    event_id VARCHAR(120) NOT NULL UNIQUE,
    tipo VARCHAR(80) NOT NULL,
    payload JSONB NOT NULL,
    procesado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS revoked_tokens (
    id SERIAL PRIMARY KEY,
    token_hash VARCHAR(128) NOT NULL UNIQUE,
    token_type VARCHAR(20) NOT NULL,
    revoked_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);

-- SECCIÓN 4: ÍNDICES
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_empresas_email ON empresas(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usuarios_empresa ON usuarios(empresa_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usuarios_admin_email ON usuarios_admin(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_productos_empresa_estado ON productos(empresa_id, estado);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ventas_empresa_fecha ON ventas(empresa_id, fecha DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comprobantes_empresa ON comprobantes(empresa_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suscripciones_empresa_estado ON suscripciones(empresa_id, estado);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pagos_estado_vencimiento ON pagos(estado, fecha_vencimiento);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feature_overrides_empresa_feature ON feature_overrides(empresa_id, feature_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_plan_features_plan ON plan_features(plan_id, activo);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_plan_limits_plan ON plan_limits(plan_id, limite);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auditoria_admin_creado_en ON auditoria_admin(creado_en DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_empresa_rubro_empresa ON empresa_rubro(empresa_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_events_provider ON payment_events(proveedor, procesado_en DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_revoked_tokens_expires_at ON revoked_tokens(expires_at);

-- SECCIÓN 5: DATOS INICIALES
INSERT INTO roles (nombre, descripcion) VALUES
('admin', 'Acceso total al sistema'),
('gerente', 'Reportes y dashboard'),
('empleado', 'Ventas e inventario'),
('contador', 'Reportes y gastos'),
('super_admin', 'Gestión global multi-tenant'),
('soporte', 'Soporte de operaciones del panel admin')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO planes (nombre, codigo, precio_mensual) VALUES
('Trial', 'trial', 0),
('Básico', 'basico', 79),
('Pro', 'pro', 149),
('Business', 'business', 299),
('Enterprise', 'enterprise', 999)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO features (nombre, codigo, descripcion) VALUES
('Ventas', 'ventas', 'Módulo de ventas y caja'),
('Inventario', 'inventario', 'Gestión de stock'),
('Reportes', 'reportes', 'KPIs y analítica'),
('Predicciones', 'predicciones', 'Modelos ML'),
('Alertas', 'alertas', 'Notificaciones'),
('Exportar Excel', 'exportar_excel', 'Exportación Excel'),
('Multi usuario', 'multi_usuario', 'Colaboración'),
('API Access', 'api_access', 'Integraciones API')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO rubros (nombre, descripcion) VALUES
('Ferretería', 'Herramientas y construcción'),
('Minimarket', 'Abarrotes'),
('Farmacia', 'Medicamentos'),
('Restaurante', 'Alimentos'),
('Librería', 'Libros y papelería'),
('Taller mecánico', 'Repuestos autos'),
('Distribuidora', 'Mayorista')
ON CONFLICT (nombre) DO NOTHING;

-- Límites por plan
INSERT INTO plan_limits (plan_id, limite, valor)
SELECT p.id, 'max_productos', CASE p.codigo WHEN 'trial' THEN 50 WHEN 'basico' THEN 200 WHEN 'pro' THEN 1000 WHEN 'business' THEN 5000 ELSE 999999 END
FROM planes p ON CONFLICT (plan_id, limite) DO UPDATE SET valor = EXCLUDED.valor;

INSERT INTO plan_limits (plan_id, limite, valor)
SELECT p.id, 'max_usuarios', CASE p.codigo WHEN 'trial' THEN 2 WHEN 'basico' THEN 5 WHEN 'pro' THEN 15 WHEN 'business' THEN 50 ELSE 999999 END
FROM planes p ON CONFLICT (plan_id, limite) DO UPDATE SET valor = EXCLUDED.valor;

INSERT INTO plan_limits (plan_id, limite, valor)
SELECT p.id, 'max_ventas_mes', CASE p.codigo WHEN 'trial' THEN 100 ELSE 999999 END
FROM planes p ON CONFLICT (plan_id, limite) DO UPDATE SET valor = EXCLUDED.valor;

-- Features por plan
INSERT INTO plan_features (plan_id, feature_id, activo)
SELECT p.id, f.id, CASE
  WHEN f.codigo IN ('ventas','inventario','alertas','multi_usuario') THEN true
  WHEN f.codigo IN ('reportes','exportar_excel') AND p.codigo IN ('pro','business','enterprise') THEN true
  WHEN f.codigo = 'predicciones' AND p.codigo IN ('business','enterprise') THEN true
  WHEN f.codigo = 'api_access' AND p.codigo = 'enterprise' THEN true
  ELSE false END
FROM planes p CROSS JOIN features f ON CONFLICT DO NOTHING;

-- SECCIÓN 6: TRIGGER Y CONTROL MIGRACIONES
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(50) PRIMARY KEY,
    descripcion VARCHAR(200),
    aplicado_en TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION sync_empresa_plan() RETURNS TRIGGER AS $$
DECLARE v_codigo_plan VARCHAR(30);
BEGIN
  IF NEW.estado IN ('activa', 'trial') THEN
    SELECT codigo INTO v_codigo_plan FROM planes WHERE id = NEW.plan_id;
    IF v_codigo_plan IS NOT NULL THEN
      UPDATE empresas SET plan = v_codigo_plan WHERE id = NEW.empresa_id;
    END IF;
  ELSIF NEW.estado IN ('cancelada', 'suspendida') THEN
    SELECT p.codigo INTO v_codigo_plan
    FROM suscripciones s JOIN planes p ON p.id = s.plan_id
    WHERE s.empresa_id = NEW.empresa_id AND s.id <> NEW.id AND s.estado IN ('activa', 'trial')
    ORDER BY s.fecha_inicio DESC LIMIT 1;
    UPDATE empresas SET plan = COALESCE(v_codigo_plan, 'basico') WHERE id = NEW.empresa_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_empresa_plan ON suscripciones;
CREATE TRIGGER trg_sync_empresa_plan AFTER INSERT OR UPDATE OF estado, plan_id ON suscripciones
FOR EACH ROW EXECUTE FUNCTION sync_empresa_plan();

-- Sincronización inicial
UPDATE empresas e SET plan = COALESCE(
  (SELECT p.codigo FROM suscripciones s JOIN planes p ON p.id = s.plan_id
   WHERE s.empresa_id = e.id AND s.estado IN ('activa', 'trial')
   ORDER BY s.fecha_inicio DESC LIMIT 1), e.plan
);

INSERT INTO schema_migrations (version, descripcion) VALUES ('v3.0', 'Schema completo SaaS con billing, features y ML')
ON CONFLICT DO NOTHING;

