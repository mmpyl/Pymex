import { lazy } from 'react';

export const LandingPage = lazy(() => import('../pages/landing/LandingPage'));
export const LoginPage = lazy(() => import('../pages/Login'));
export const RegisterPage = lazy(() => import('../pages/Register'));

export const SaasDashboardPage = lazy(() => import('../saas-app/pages/DashboardPage'));
export const VentasPage = lazy(() => import('../pages/Ventas'));
export const InventarioPage = lazy(() => import('../pages/Inventario'));
export const GastosPage = lazy(() => import('../pages/Gastos'));
export const ReportesPage = lazy(() => import('../pages/Reportes'));
export const PrediccionesPage = lazy(() => import('../pages/Predicciones'));
export const ClientesPage = lazy(() => import('../pages/Clientes'));
export const ProveedoresPage = lazy(() => import('../pages/Proveedores'));
export const ProductosPage = lazy(() => import('../pages/Productos'));
export const CategoriasPage = lazy(() => import('../pages/Categorias'));
export const FacturacionPage = lazy(() => import('../pages/Facturacion'));

export const AdminDashboardPage = lazy(() => import('../admin-panel/pages/DashboardPage'));
export const AdminEmpresasPage = lazy(() => import('../admin-panel/pages/EmpresasPage'));
export const AdminPlanesPage = lazy(() => import('../admin-panel/pages/PlanesPage'));
export const AdminFeaturesPage = lazy(() => import('../admin-panel/pages/FeaturesPage'));
export const AdminPagosPage = lazy(() => import('../admin-panel/pages/PagosPage'));
export const AdminSuscripcionesPage = lazy(() => import('../admin-panel/pages/SuscripcionesPage'));
export const AdminAuditoriaPage = lazy(() => import('../admin-panel/pages/AuditoriaPage'));
export const AdminMetricasPage = lazy(() => import('../admin-panel/pages/MetricasPage'));
export const NotAuthorizedPage = lazy(() => import('../pages/saas/NotAuthorized'));
