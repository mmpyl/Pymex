import { lazy } from 'react';

// Landing & Auth
export const LandingPage = lazy(() => import('../pages/landing/LandingPage'));
export const LoginHubPage = lazy(() => import('../pages/LoginHub'));
export const EmpresaLoginPage = lazy(() => import('../pages/EmpresaLogin'));
export const AdminLoginPage = lazy(() => import('../pages/AdminLogin'));
export const RegisterPage = lazy(() => import('../pages/Register'));
export const ForgotPasswordPage = lazy(() => import('../modules/auth/pages/ForgotPasswordPage'));

// SaaS App - Empresas clientes
export const SaasDashboardPage = lazy(() => import('../pages/Dashboard'));
export const VentasPage = lazy(() => import('../pages/Ventas'));
export const InventarioPage = lazy(() => import('../pages/Inventario'));
export const GastosPage = lazy(() => import('../pages/Gastos'));
export const ReportesPage = lazy(() => import('../pages/Reportes'));
export const PrediccionesPage = lazy(() => import('../pages/PrediccionesPage'));
export const ClientesPage = lazy(() => import('../pages/Clientes'));
export const ProveedoresPage = lazy(() => import('../pages/Proveedores'));
export const ProductosPage = lazy(() => import('../pages/Productos'));
export const CategoriasPage = lazy(() => import('../pages/Categorias'));
export const FacturacionPage = lazy(() => import('../pages/Facturacion'));

// Admin Panel - Super Admin
export const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboard'));
export const AdminEmpresasPage = lazy(() => import('../pages/admin/EmpresasPage'));
export const AdminPlanesPage = lazy(() => import('../pages/admin/PlanesPage'));
export const AdminFeaturesPage = lazy(() => import('../pages/admin/FeaturesPage'));
export const AdminPagosPage = lazy(() => import('../pages/admin/PagosPage'));
export const AdminSuscripcionesPage = lazy(() => import('../pages/admin/SuscripcionesPage'));
export const AdminAuditoriaPage = lazy(() => import('../pages/admin/AuditoriaPage'));
export const AdminMetricasPage = lazy(() => import('../pages/admin/MetricasPage'));
export const AdminUsuariosPage = lazy(() => import('../pages/admin/UsuariosPage'));

// RBAC - Gestión de Roles y Permisos
export const UsuariosRBACPage = lazy(() => import('../modules/rbac/pages/UsuariosRBACPage'));
export const RolesPermisosPage = lazy(() => import('../modules/rbac/pages/RolesPermisosPage'));

// Admin - Pagos (Stripe Webhooks)
export const AdminPaymentEventsPage = lazy(() => import('../modules/admin/payments/pages/PaymentEventsPage'));

// Error pages
export const NotAuthorizedPage = lazy(() => import('../pages/saas/NotAuthorized'));
