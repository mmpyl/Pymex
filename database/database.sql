 -- === SAAS PYMES (SaPyme) — Base de datos completa v3.0 ===
-- Incluye: usuarios_admin, rubros, payment_events, max_ventas_mes
-- Trigger sync_empresa_plan al final

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

CREATE TABLE IF NOT EXISTS permisos (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(120) NOT NULL,
    codigo      VARCHAR(80)  NOT NULL UNIQUE,
    descripcion VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS rol_permisos (
    rol_id      INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permiso_id  INT NOT NULL REFERENCES permisos(id) ON DELETE CASCADE,
    PRIMARY KEY (rol_id, permiso_id)
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
    descripcion VARCHAR(300),
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
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_permisos_codigo ON permisos(codigo);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rol_permisos_rol ON rol_permisos(rol_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rol_permisos_permiso ON rol_permisos(permiso_id);
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

-- Permisos por módulo del sistema
INSERT INTO permisos (nombre, codigo, descripcion) VALUES
-- Módulo Usuarios
('Crear usuarios', 'usuarios_crear', 'Permiso para crear nuevos usuarios en la empresa'),
('Editar usuarios', 'usuarios_editar', 'Permiso para editar información de usuarios'),
('Eliminar usuarios', 'usuarios_eliminar', 'Permiso para eliminar usuarios'),
('Gestionar usuarios', 'usuarios_gestionar', 'Permiso completo para gestión de usuarios y roles'),
('Ver usuarios', 'usuarios_ver', 'Permiso para ver lista de usuarios'),

-- Módulo Ventas
('Crear ventas', 'ventas_crear', 'Permiso para registrar nuevas ventas'),
('Editar ventas', 'ventas_editar', 'Permiso para editar ventas existentes'),
('Eliminar ventas', 'ventas_eliminar', 'Permiso para eliminar ventas'),
('Ver ventas', 'ventas_ver', 'Permiso para ver historial de ventas'),
('Anular ventas', 'ventas_anular', 'Permiso para anular ventas completadas'),

-- Módulo Inventario
('Crear productos', 'productos_crear', 'Permiso para crear nuevos productos'),
('Editar productos', 'productos_editar', 'Permiso para editar productos'),
('Eliminar productos', 'productos_eliminar', 'Permiso para eliminar productos'),
('Ver productos', 'productos_ver', 'Permiso para ver catálogo de productos'),
('Ajustar stock', 'inventario_ajustar', 'Permiso para ajustar stock manualmente'),
('Ver movimientos', 'inventario_ver_movimientos', 'Permiso para ver movimientos de inventario'),

-- Módulo Clientes
('Crear clientes', 'clientes_crear', 'Permiso para registrar nuevos clientes'),
('Editar clientes', 'clientes_editar', 'Permiso para editar información de clientes'),
('Eliminar clientes', 'clientes_eliminar', 'Permiso para eliminar clientes'),
('Ver clientes', 'clientes_ver', 'Permiso para ver lista de clientes'),

-- Módulo Proveedores
('Crear proveedores', 'proveedores_crear', 'Permiso para registrar nuevos proveedores'),
('Editar proveedores', 'proveedores_editar', 'Permiso para editar proveedores'),
('Eliminar proveedores', 'proveedores_eliminar', 'Permiso para eliminar proveedores'),
('Ver proveedores', 'proveedores_ver', 'Permiso para ver lista de proveedores'),

-- Módulo Gastos
('Crear gastos', 'gastos_crear', 'Permiso para registrar nuevos gastos'),
('Editar gastos', 'gastos_editar', 'Permiso para editar gastos'),
('Eliminar gastos', 'gastos_eliminar', 'Permiso para eliminar gastos'),
('Ver gastos', 'gastos_ver', 'Permiso para ver lista de gastos'),

-- Módulo Reportes
('Ver reportes', 'reportes_ver', 'Permiso para ver reportes generales'),
('Exportar reportes', 'reportes_exportar', 'Permiso para exportar reportes a Excel/PDF'),
('Ver dashboard', 'dashboard_ver', 'Permiso para ver dashboard principal'),

-- Módulo Configuración
('Configurar empresa', 'empresa_configurar', 'Permiso para configurar datos de la empresa'),
('Configurar rubros', 'rubros_configurar', 'Permiso para gestionar rubros de la empresa'),
('Ver auditoría', 'auditoria_ver', 'Permiso para ver logs de auditoría'),

-- Módulo Facturación
('Emitir comprobantes', 'facturacion_emitir', 'Permiso para emitir comprobantes electrónicos'),
('Anular comprobantes', 'facturacion_anular', 'Permiso para anular comprobantes'),
('Ver comprobantes', 'facturacion_ver', 'Permiso para ver comprobantes emitidos'),
('Configurar facturación', 'facturacion_configurar', 'Permiso para configurar parámetros de facturación'),

-- Módulo Alertas
('Ver alertas', 'alertas_ver', 'Permiso para ver alertas del sistema'),
('Gestionar alertas', 'alertas_gestionar', 'Permiso para configurar alertas'),

-- Módulo Premium/ML
('Ver predicciones', 'predicciones_ver', 'Permiso para ver predicciones de ML'),
('Configurar predicciones', 'predicciones_configurar', 'Permiso para configurar modelos predictivos')
ON CONFLICT (codigo) DO NOTHING;

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

-- Features por plan (módulos premium según nivel de suscripción)
INSERT INTO plan_features (plan_id, feature_id, activo)
SELECT p.id, f.id, CASE
  WHEN f.codigo IN ('ventas','inventario','alertas','multi_usuario') THEN true
  WHEN f.codigo IN ('reportes','exportar_excel') AND p.codigo IN ('pro','business','enterprise') THEN true
  WHEN f.codigo = 'predicciones' AND p.codigo IN ('business','enterprise') THEN true
  WHEN f.codigo = 'api_access' AND p.codigo = 'enterprise' THEN true
  ELSE false END
FROM planes p CROSS JOIN features f ON CONFLICT DO NOTHING;

-- Permisos por defecto para cada rol
-- admin: todos los permisos del sistema
INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permisos p
WHERE r.nombre = 'admin'
ON CONFLICT DO NOTHING;

-- gerente: reportes, dashboard, ver todos los módulos, gestionar ventas y clientes
INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permisos p
WHERE r.nombre = 'gerente' AND p.codigo IN (
  'reportes_ver', 'reportes_exportar', 'dashboard_ver',
  'ventas_ver', 'ventas_crear', 'ventas_editar',
  'clientes_ver', 'clientes_crear', 'clientes_editar',
  'proveedores_ver', 'gastos_ver', 'productos_ver',
  'alertas_ver', 'facturacion_ver', 'inventario_ver_movimientos'
)
ON CONFLICT DO NOTHING;

-- empleado: operaciones básicas de venta e inventario
INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permisos p
WHERE r.nombre = 'empleado' AND p.codigo IN (
  'ventas_crear', 'ventas_ver',
  'clientes_ver', 'clientes_crear',
  'productos_ver', 'inventario_ajustar',
  'facturacion_emitir', 'facturacion_ver',
  'alertas_ver'
)
ON CONFLICT DO NOTHING;

-- contador: acceso a reportes, gastos y facturación
INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permisos p
WHERE r.nombre = 'contador' AND p.codigo IN (
  'reportes_ver', 'reportes_exportar', 'dashboard_ver',
  'gastos_ver', 'gastos_crear', 'gastos_editar',
  'facturacion_ver', 'facturacion_emitir',
  'proveedores_ver', 'ventas_ver',
  'auditoria_ver'
)
ON CONFLICT DO NOTHING;

-- soporte: permisos limitados para asistencia técnica
INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permisos p
WHERE r.nombre = 'soporte' AND p.codigo IN (
  'usuarios_ver', 'ventas_ver', 'productos_ver',
  'clientes_ver', 'facturacion_ver', 'alertas_ver',
  'dashboard_ver', 'reportes_ver'
)
ON CONFLICT DO NOTHING;

-- super_admin: todos los permisos (se asigna igual que admin, pero aplica a nivel global)
INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permisos p
WHERE r.nombre = 'super_admin'
ON CONFLICT DO NOTHING;

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

INSERT INTO schema_migrations (version, descripcion) VALUES ('v3.1', 'Schema con tablas permisos/rol_permisos y datos iniciales RBAC')
ON CONFLICT DO NOTHING;

-- Verificación: SELECT COUNT(*) FROM pg_tables WHERE schemaname='public';