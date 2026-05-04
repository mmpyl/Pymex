-- Migración v3.1: Agrega tablas de permisos y asigna permisos por defecto a roles
-- Ejecutar solo si ya existe la base de datos v3.0

-- Crear tabla de permisos si no existe
CREATE TABLE IF NOT EXISTS permisos (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(120) NOT NULL,
    codigo      VARCHAR(80)  NOT NULL UNIQUE,
    descripcion VARCHAR(200)
);

-- Crear tabla intermedia rol_permisos si no existe
CREATE TABLE IF NOT EXISTS rol_permisos (
    rol_id      INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permiso_id  INT NOT NULL REFERENCES permisos(id) ON DELETE CASCADE,
    PRIMARY KEY (rol_id, permiso_id)
);

-- Crear índices para mejorar rendimiento
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_permisos_codigo ON permisos(codigo);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rol_permisos_rol ON rol_permisos(rol_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rol_permisos_permiso ON rol_permisos(permiso_id);

-- Insertar permisos por módulo del sistema
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

-- Asignar permisos por defecto a cada rol
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

-- Registrar migración
INSERT INTO schema_migrations (version, descripcion) 
VALUES ('v3.1', 'Migración RBAC - Tablas permisos y asignación por roles')
ON CONFLICT (version) DO UPDATE SET aplicado_en = NOW();

-- Verificación de datos insertados
-- SELECT r.nombre, COUNT(rp.permiso_id) as cantidad_permisos 
-- FROM roles r 
-- LEFT JOIN rol_permisos rp ON r.id = rp.rol_id 
-- GROUP BY r.id, r.nombre 
-- ORDER BY r.id;
