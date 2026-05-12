import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';

import AdminLayout from './layouts/AdminLayout';
import AdminRoute from './components/AdminRoute';

// Auth Domain Pages
import { LoginPage, AdminDashboardPage } from './domains/auth/pages';

// Billing Domain Pages
import { FacturasPage, PagosPage, SuscripcionesPage, ReportesBillingPage } from './domains/billing/pages';

// Core Domain Pages (pendientes de crear)
import EmpresasPage from './domains/core/pages/EmpresasPage';
import PlanesPage from './domains/core/pages/PlanesPage';
import FeaturesPage from './domains/core/pages/FeaturesPage';
import AuditoriaPage from './domains/core/pages/AuditoriaPage';
import MetricasPage from './domains/core/pages/MetricasPage';
import UsuariosPage from './domains/core/pages/UsuariosPage';
import NotAuthorizedPage from './domains/core/pages/NotAuthorizedPage';

const Loader = () => <div className="p-6">Cargando módulo...</div>;

const App = () => (
  <BrowserRouter>
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Auth Routes */}
        <Route path="/staff/login" element={<LoginPage type="admin" />} />
        <Route path="/empresa/login" element={<LoginPage type="empresa" />} />

        {/* Super Admin Routes */}
        <Route
          path="/super-admin"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminDashboardPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/super-admin/empresas"
          element={
            <AdminRoute>
              <AdminLayout>
                <EmpresasPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/super-admin/planes"
          element={
            <AdminRoute>
              <AdminLayout>
                <PlanesPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/super-admin/features"
          element={
            <AdminRoute>
              <AdminLayout>
                <FeaturesPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/super-admin/pagos"
          element={
            <AdminRoute>
              <AdminLayout>
                <PagosPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/super-admin/suscripciones"
          element={
            <AdminRoute>
              <AdminLayout>
                <SuscripcionesPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/super-admin/auditoria"
          element={
            <AdminRoute>
              <AdminLayout>
                <AuditoriaPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/super-admin/metricas"
          element={
            <AdminRoute>
              <AdminLayout>
                <MetricasPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/super-admin/usuarios"
          element={
            <AdminRoute>
              <AdminLayout>
                <UsuariosPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/super-admin/facturas"
          element={
            <AdminRoute>
              <AdminLayout>
                <FacturasPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/super-admin/reportes"
          element={
            <AdminRoute>
              <AdminLayout>
                <ReportesBillingPage />
              </AdminLayout>
            </AdminRoute>
          }
        />

        {/* Error Routes */}
        <Route path="/403" element={<NotAuthorizedPage />} />
        <Route path="*" element={<Navigate to="/super-admin" replace />} />
      </Routes>
    </Suspense>
    <Toaster position="top-right" />
  </BrowserRouter>
);

export default App;
