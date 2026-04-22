import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';

import { ProtectedRoute, RoleRoute, FeatureRoute } from './guards';
import SaasLayout from '../layouts/SaasLayout';
import AdminLayout from '../layouts/AdminLayout';
import LandingLayout from '../layouts/LandingLayout';
import AdminRoute from '../components/AdminRoute';

import AppProviders from '../app/providers/AppProviders';
import {
  LandingPage,
  LoginHubPage,
  EmpresaLoginPage,
  AdminLoginPage,
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

const Loader = () => <div className="p-6">Cargando módulo...</div>;

const AppRouter = () => (
  <AppProviders>
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<LandingLayout><LandingPage /></LandingLayout>} />

          <Route path="/login" element={<LoginHubPage />} />
          <Route path="/empresa/login" element={<EmpresaLoginPage />} />
          <Route path="/staff/login" element={<AdminLoginPage />} />
          <Route path="/admin/login" element={<Navigate to="/staff/login" replace />} />
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
              <AdminRoute>
                <RoleRoute roles={['super_admin']}>
                  <AdminLayout><AdminDashboardPage /></AdminLayout>
                </RoleRoute>
              </AdminRoute>
            )}
          />
          <Route path="/admin/empresas" element={<AdminRoute><RoleRoute roles={['super_admin']}><AdminLayout><AdminEmpresasPage /></AdminLayout></RoleRoute></AdminRoute>} />
          <Route path="/admin/planes" element={<AdminRoute><RoleRoute roles={['super_admin']}><AdminLayout><AdminPlanesPage /></AdminLayout></RoleRoute></AdminRoute>} />
          <Route path="/admin/features" element={<AdminRoute><RoleRoute roles={['super_admin']}><AdminLayout><AdminFeaturesPage /></AdminLayout></RoleRoute></AdminRoute>} />
          <Route path="/admin/pagos" element={<AdminRoute><RoleRoute roles={['super_admin']}><AdminLayout><AdminPagosPage /></AdminLayout></RoleRoute></AdminRoute>} />
          <Route path="/admin/suscripciones" element={<AdminRoute><RoleRoute roles={['super_admin']}><AdminLayout><AdminSuscripcionesPage /></AdminLayout></RoleRoute></AdminRoute>} />
          <Route path="/admin/auditoria" element={<AdminRoute><RoleRoute roles={['super_admin']}><AdminLayout><AdminAuditoriaPage /></AdminLayout></RoleRoute></AdminRoute>} />
          <Route path="/admin/metricas" element={<AdminRoute><RoleRoute roles={['super_admin']}><AdminLayout><AdminMetricasPage /></AdminLayout></RoleRoute></AdminRoute>} />

          <Route path="/403" element={<NotAuthorizedPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Toaster position="top-right" />
    </BrowserRouter>
  </AppProviders>
);

export default AppRouter;
