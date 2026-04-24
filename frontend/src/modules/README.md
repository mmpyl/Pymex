# Modules

Aquí vive la lógica por dominio del SaaS (ventas, inventario, gastos, reportes, predicciones, usuarios, configuración, super admin).
Cada módulo debe tener:

- `api/` (queries/mutations)
- `components/`
- `pages/`
- `schemas/` (Zod)
- `hooks/`

## Estado actual

- `catalogo/`: implementado con `api`, `hooks`, `schemas`, `components` y `pages` para `clientes`, `proveedores`, `categorias` y `productos`.
- Próximos módulos a migrar: ventas, inventario, gastos, reportes y predicciones.
