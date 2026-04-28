# Módulo RBAC (Role-Based Access Control)

## Descripción

Módulo completo para la gestión de Roles y Permisos del sistema, implementado siguiendo principios DDD (Domain-Driven Design).

## Endpoints del Backend

Todos los endpoints están protegidos con autenticación y requieren el permiso `usuarios_gestionar`.

### Roles
- `GET /api/rbac/roles` - Listar todos los roles con sus permisos asociados
- `PUT /api/rbac/roles/:id/permisos` - Actualizar permisos de un rol

### Permisos
- `GET /api/rbac/permisos` - Listar todos los permisos disponibles

### Usuarios
- `GET /api/rbac/usuarios` - Listar usuarios de la empresa
- `POST /api/rbac/usuarios` - Crear nuevo usuario
- `PUT /api/rbac/usuarios/:id/rol` - Cambiar el rol de un usuario

## Estructura del Módulo Frontend

```
rbac/
├── api/
│   └── rbacApi.js          # Servicios de API
├── components/              # Componentes reutilizables (vacío por ahora)
├── hooks/
│   ├── index.js            # Exportación de hooks
│   └── useRBAC.js          # Hook principal con estado y operaciones
├── pages/
│   ├── UsuariosRBACPage.jsx      # Gestión de usuarios
│   └── RolesPermisosPage.jsx     # Gestión de roles y permisos
├── schemas/
│   └── rbacSchemas.js      # Validaciones con Zod
└── index.js                # Punto de entrada del módulo
```

## Rutas del Frontend

Las páginas RBAC están accesibles solo para `super_admin`:

- `/admin/rbac/usuarios` - Gestión de usuarios de la empresa
- `/admin/rbac/roles` - Gestión de roles y asignación de permisos

## Modelos de Datos (Backend)

### Usuario
- `id`, `empresa_id`, `rol_id`, `nombre`, `email`, `password`, `estado`

### Rol
- `id`, `nombre`, `descripcion`

### Permiso
- `id`, `nombre`, `codigo` (único)

### RolPermiso (tabla intermedia)
- `rol_id`, `permiso_id`

## Eventos del Sistema

El módulo publica eventos para invalidar cachés cuando cambian los permisos:

- `ROLE_CHANGED` - Cuando se actualizan los permisos de un rol
- `USER_ROLE_UPDATED` - Cuando se cambia el rol de un usuario

## Consideraciones de Seguridad

1. Todos los endpoints requieren autenticación válida
2. Se requiere el permiso `usuarios_gestionar` para acceder a las funcionalidades RBAC
3. Las contraseñas se hashean con bcrypt (10 rounds)
4. Los usuarios no pueden eliminar su propia cuenta
5. Validación de esquemas con Zod en el frontend

## Flujo de Trabajo Típico

1. **Admin crea usuario**: Va a `/admin/rbac/usuarios` → "+ Nuevo usuario" → completa formulario
2. **Admin cambia rol**: En lista de usuarios → "Editar" → selecciona nuevo rol → guardar
3. **Admin gestiona permisos**: Va a `/admin/rbac/roles` → selecciona rol → marca/desmarca permisos → "Guardar Cambios"
