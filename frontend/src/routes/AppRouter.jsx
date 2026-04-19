import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { Suspense } from 'react';


import { Suspense } from 'react';

import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';


import { ProtectedRoute, RoleRoute, FeatureRoute } from './guards';
import SaasLayout from '../layouts/SaasLayout';
import AdminLayout from '../layouts/AdminLayout';
import LandingLayout from '../layouts/LandingLayout';




import AppProviders from '../app/providers/AppProviders';
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  SaasDashboardPage,
  VentasPage,
  InventarioPage,
  GastosPage,
  ReportesPage,
  PrediccionesPage,
  ClientesPage,
  ProveedoresPage,
  ProductosPage,
  CategoriasPage,
  FacturacionPage,
  AdminDashboardPage,
  AdminEmpresasPage,
  AdminPlanesPage,
  AdminFeaturesPage,
  AdminPagosPage,
  AdminSuscripcionesPage,
  AdminAuditoriaPage,
  AdminMetricasPage,
  NotAuthorizedPage
} from './routeConfig';

const Loader = () => <div style={{ padding: 24 }}>Cargando módulo...</div>;

const AppRouter = () => (
  <AppProviders>
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<LandingLayout><LandingPage /></LandingLayout>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/dashboard" element={<ProtectedRoute><SaasLayout><SaasDashboardPage /></SaasLayout></ProtectedRoute>} />
          <Route path="/productos" element={<ProtectedRoute><SaasLayout><ProductosPage /></SaasLayout></ProtectedRoute>} />
          <Route path="/categorias" element={<ProtectedRoute><SaasLayout><CategoriasPage /></SaasLayout></ProtectedRoute>} />
          <Route path="/inventario" element={<ProtectedRoute><SaasLayout><InventarioPage /></SaasLayout></ProtectedRoute>} />
          <Route path="/ventas" element={<ProtectedRoute><SaasLayout><VentasPage /></SaasLayout></ProtectedRoute>} />
          <Route path="/gastos" element={<ProtectedRoute><SaasLayout><GastosPage /></SaasLayout></ProtectedRoute>} />
          <Route path="/clientes" element={<ProtectedRoute><SaasLayout><ClientesPage /></SaasLayout></ProtectedRoute>} />
          <Route path="/proveedores" element={<ProtectedRoute><SaasLayout><ProveedoresPage /></SaasLayout></ProtectedRoute>} />
          <Route path="/reportes" element={<ProtectedRoute><SaasLayout><ReportesPage /></SaasLayout></ProtectedRoute>} />
          <Route path="/predicciones" element={<ProtectedRoute><SaasLayout><PrediccionesPage /></SaasLayout></ProtectedRoute>} />

          <Route
            path="/facturacion"
            element={(
              <ProtectedRoute>
                <FeatureRoute featureCode="facturacion_electronica">
                  <SaasLayout><FacturacionPage /></SaasLayout>
                </FeatureRoute>
              </ProtectedRoute>
            )}
          />

          <Route
            path="/admin"
            element={(
              <ProtectedRoute>
                <RoleRoute roles={['super_admin']}>
                  <AdminLayout><AdminDashboardPage /></AdminLayout>
                </RoleRoute>
              </ProtectedRoute>
            )}
          />
          <Route path="/admin/empresas" element={<ProtectedRoute><RoleRoute roles={['super_admin']}><AdminLayout><AdminEmpresasPage /></AdminLayout></RoleRoute></ProtectedRoute>} />
          <Route path="/admin/planes" element={<ProtectedRoute><RoleRoute roles={['super_admin']}><AdminLayout><AdminPlanesPage /></AdminLayout></RoleRoute></ProtectedRoute>} />
          <Route path="/admin/features" element={<ProtectedRoute><RoleRoute roles={['super_admin']}><AdminLayout><AdminFeaturesPage /></AdminLayout></RoleRoute></ProtectedRoute>} />
          <Route path="/admin/pagos" element={<ProtectedRoute><RoleRoute roles={['super_admin']}><AdminLayout><AdminPagosPage /></AdminLayout></RoleRoute></ProtectedRoute>} />
          <Route path="/admin/suscripciones" element={<ProtectedRoute><RoleRoute roles={['super_admin']}><AdminLayout><AdminSuscripcionesPage /></AdminLayout></RoleRoute></ProtectedRoute>} />
          <Route path="/admin/auditoria" element={<ProtectedRoute><RoleRoute roles={['super_admin']}><AdminLayout><AdminAuditoriaPage /></AdminLayout></RoleRoute></ProtectedRoute>} />
          <Route path="/admin/metricas" element={<ProtectedRoute><RoleRoute roles={['super_admin']}><AdminLayout><AdminMetricasPage /></AdminLayout></RoleRoute></ProtectedRoute>} />

          <Route path="/403" element={<NotAuthorizedPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </AppProviders>




import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Productos from '../pages/Productos';
import Categorias from '../pages/Categorias';
import Inventario from '../pages/Inventario';
import Ventas from '../pages/Ventas';
import Gastos from '../pages/Gastos';
import Clientes from '../pages/Clientes';
import Proveedores from '../pages/Proveedores';
import Reportes from '../pages/Reportes';
import Alertas from '../pages/Alertas';
import Predicciones from '../pages/Predicciones';
import Facturacion from '../pages/Facturacion';

import LandingPage from '../pages/landing/LandingPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import NotAuthorized from '../pages/saas/NotAuthorized';

const AppRouter = () => (
  <AuthProvider>
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingLayout><LandingPage /></LandingLayout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<ProtectedRoute><SaasLayout><Dashboard /></SaasLayout></ProtectedRoute>} />
        <Route path="/productos" element={<ProtectedRoute><SaasLayout><Productos /></SaasLayout></ProtectedRoute>} />
        <Route path="/categorias" element={<ProtectedRoute><SaasLayout><Categorias /></SaasLayout></ProtectedRoute>} />
        <Route path="/inventario" element={<ProtectedRoute><SaasLayout><Inventario /></SaasLayout></ProtectedRoute>} />
        <Route path="/ventas" element={<ProtectedRoute><SaasLayout><Ventas /></SaasLayout></ProtectedRoute>} />
        <Route path="/gastos" element={<ProtectedRoute><SaasLayout><Gastos /></SaasLayout></ProtectedRoute>} />
        <Route path="/clientes" element={<ProtectedRoute><SaasLayout><Clientes /></SaasLayout></ProtectedRoute>} />
        <Route path="/proveedores" element={<ProtectedRoute><SaasLayout><Proveedores /></SaasLayout></ProtectedRoute>} />
        <Route path="/reportes" element={<ProtectedRoute><SaasLayout><Reportes /></SaasLayout></ProtectedRoute>} />
        <Route path="/alertas" element={<ProtectedRoute><SaasLayout><Alertas /></SaasLayout></ProtectedRoute>} />
        <Route path="/predicciones" element={<ProtectedRoute><SaasLayout><Predicciones /></SaasLayout></ProtectedRoute>} />

        <Route
          path="/facturacion"
          element={(
            <ProtectedRoute>
              <FeatureRoute featureCode="facturacion_electronica">
                <SaasLayout><Facturacion /></SaasLayout>
              </FeatureRoute>
            </ProtectedRoute>
          )}
        />

        <Route
          path="/admin"
          element={(
            <ProtectedRoute>
              <RoleRoute roles={['super_admin']}>
                <AdminLayout><AdminDashboard /></AdminLayout>
              </RoleRoute>
            </ProtectedRoute>
          )}
        />

        <Route path="/403" element={<NotAuthorized />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>


);

export default AppRouter;
