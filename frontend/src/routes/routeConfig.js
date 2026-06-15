import { lazy } from 'react';

// Landing & Auth
export const LandingPage = lazy(() => import('../modules/landing/pages/LandingPage.jsx'));
export const LoginHubPage = lazy(() => import('../modules/auth/pages/LoginHubPage.jsx'));
export const LoginPage = lazy(() => import('../modules/auth/pages/LoginPage.jsx'));
export const LoginEmpresaPage = lazy(() => import('../modules/auth/pages/LoginEmpresaPage.jsx'));
export const RegisterPage = lazy(() => import('../modules/auth/pages/RegisterPage.jsx'));
export const RegisterEmpresaPage = lazy(() => import('../modules/auth/pages/RegisterEmpresaPage.jsx'));
export const ForgotPasswordPage = lazy(() => import('../modules/auth/pages/ForgotPasswordPage.jsx'));

// SaaS App - Empresas clientes
export const SaasDashboardPage = lazy(() => import('../features/dashboard/presentation/Dashboard.jsx'));

// Módulos de Negocio
export const VentasPage = lazy(() => import('../features/ventas/presentation/Ventas.jsx'));
export const InventarioPage = lazy(() => import('../features/inventario/presentation/Inventario.jsx'));
export const GastosPage = lazy(() => import('../features/gastos/presentation/Gastos.jsx'));
export const ReportesPage = lazy(() => import('../features/reportes/domain/Reportes.jsx'));

// Catálogo
export const ClientesPage = lazy(() => import('../modules/catalogo/pages/ClientesPage.jsx'));
export const ProveedoresPage = lazy(() => import('../modules/catalogo/pages/ProveedoresPage.jsx'));
export const ProductosPage = lazy(() => import('../modules/catalogo/pages/ProductosPage.jsx'));
export const CategoriasPage = lazy(() => import('../modules/catalogo/pages/CategoriasPage.jsx'));

// Facturación
export const FacturacionPage = lazy(() => import('../features/facturacion/presentation/Facturacion.jsx'));

// Admin Panel - Super Admin
export const AdminDashboardPage = lazy(() => import('../modules/admin/features/pages/AdminDashboard.jsx'));
export const AdminEmpresasPage = lazy(() => import('../modules/admin/features/pages/EmpresasPage.jsx'));
export const AdminPlanesPage = lazy(() => import('../modules/admin/features/pages/PlanesPage.jsx'));
export const AdminFeaturesPage = lazy(() => import('../modules/admin/features/pages/FeaturesPage.jsx'));
export const AdminPagosPage = lazy(() => import('../modules/admin/features/pages/PagosPage.jsx'));
export const AdminSuscripcionesPage = lazy(() => import('../modules/admin/features/pages/SuscripcionesPage.jsx'));
export const AdminAuditoriaPage = lazy(() => import('../modules/admin/features/pages/AuditoriaPage.jsx'));
export const AdminMetricaPage = lazy(() => import('../modules/admin/features/pages/MetricasPage.jsx'));
export const AdminUsuariosPage = lazy(() => import('../modules/admin/features/pages/UsuariosPage.jsx'));

// RBAC - Gestión de Roles y Permisos
export const UsuariosRBACPage = lazy(() => import('../modules/rbac/pages/UsuariosRBACPage.jsx'));
export const RolesPermisosPage = lazy(() => import('../modules/rbac/pages/RolesPermisosPage.jsx'));

// Admin - Pagos (Stripe Webhooks)
export const AdminPaymentEventsPage = lazy(() => import('../modules/admin/payments/pages/PaymentEventsPage.jsx'));

// Error pages - Commented out until file is created
// export const NotAuthorizedPage = lazy(() => import('../features/saas/presentation/NotAuthorized'));