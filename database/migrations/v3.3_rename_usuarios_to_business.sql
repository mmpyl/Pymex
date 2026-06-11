-- ============================================================================
-- MIGRACIÓN V3.3: RENAME TABLA USUARIOS A USUARIOS_BUSINESS
-- Propósito: Renombrar tabla 'usuarios' a 'usuarios_business' para claridad
--            semántica y consistencia con el modelo de dominio
-- Fecha: 2024
-- Impacto: Separación explícita entre usuarios_admin y usuarios_business
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. RENOMBRAR TABLA PRINCIPAL
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS usuarios 
RENAME TO usuarios_business;

-- ----------------------------------------------------------------------------
-- 2. ACTUALIZAR ÍNDICES EXISTENTES (los nombres de índices no cambian automáticamente)
-- ----------------------------------------------------------------------------
-- Drop índices antiguos y crear nuevos con nombre actualizado
DROP INDEX IF EXISTS idx_usuarios_empresa;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usuarios_business_empresa 
ON usuarios_business(empresa_id);

DROP INDEX IF EXISTS idx_usuarios_email_empresa;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_usuarios_business_email_empresa 
ON usuarios_business(empresa_id, email);

DROP INDEX IF EXISTS idx_usuarios_empresa_rol;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usuarios_business_empresa_rol 
ON usuarios_business(empresa_id, rol_id);

-- ----------------------------------------------------------------------------
-- 3. ACTUALIZAR COMENTARIOS DE TABLA Y COLUMNAS (si existen)
-- ----------------------------------------------------------------------------
COMMENT ON TABLE usuarios_business IS 'Usuarios de empresas (business users) - Usuarios que pertenecen a una empresa en el sistema SaaS';
COMMENT ON COLUMN usuarios_business.id IS 'ID único del usuario';
COMMENT ON COLUMN usuarios_business.empresa_id IS 'Referencia a la empresa a la que pertenece';
COMMENT ON COLUMN usuarios_business.rol_id IS 'Referencia al rol asignado';
COMMENT ON COLUMN usuarios_business.nombre IS 'Nombre completo del usuario';
COMMENT ON COLUMN usuarios_business.email IS 'Email único por empresa';
COMMENT ON COLUMN usuarios_business.password IS 'Password hasheada con bcrypt';
COMMENT ON COLUMN usuarios_business.estado IS 'Estado del usuario: activo, inactivo, suspendido';
COMMENT ON COLUMN usuarios_business.fecha_registro IS 'Fecha de creación del usuario';

-- ----------------------------------------------------------------------------
-- 4. VERIFICACIÓN DE INTEGRIDAD REFERENCIAL
-- ----------------------------------------------------------------------------
-- Las siguientes tablas ya tienen foreign keys que apuntan a usuarios_business
-- después del rename automático de PostgreSQL:
-- - ventas (usuario_id)
-- - gastos (usuario_id)
-- - movimientos_inventario (usuario_id)

-- Verificar que las FKs están intactas
SELECT 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND ccu.table_name = 'usuarios_business';

-- ----------------------------------------------------------------------------
-- 5. ACTUALIZAR ESTADÍSTICAS DEL PLANNER
-- ----------------------------------------------------------------------------
ANALYZE usuarios_business;

-- ----------------------------------------------------------------------------
-- 6. REGISTRAR MIGRACIÓN
-- ----------------------------------------------------------------------------
INSERT INTO schema_migrations (version, descripcion) 
VALUES ('v3.3', 'Rename tabla usuarios a usuarios_business para claridad semántica')
ON CONFLICT (version) DO UPDATE SET aplicado_en = NOW();

COMMIT;

-- ============================================================================
-- VERIFICACIÓN POST-MIGRACIÓN
-- Ejecutar por separado para confirmar éxito:
-- ============================================================================
-- SELECT COUNT(*) FROM usuarios_business;
-- SELECT tablename FROM pg_tables WHERE tablename LIKE '%usuarios%';
-- SELECT indexname FROM pg_indexes WHERE tablename = 'usuarios_business';
