import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './shared';
import { SaasLayout } from './shared';

// Auth Module
import { LoginForm, PrivateRoute } from './modules/auth';

// Core Modules
import { DashboardModule, ProductosModule, VentasModule, ClientesModule, InventarioModule } from './modules/core';

// Billing Modules
import { FacturacionModule, PagosModule } from './modules/billing';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginForm />} />
          
          {/* Protected Routes with Layout */}
          <Route path="/" element={
            <PrivateRoute>
              <SaasLayout />
            </PrivateRoute>
          }>
            <Route index element={<DashboardModule />} />
            
            {/* Core Module Routes */}
            <Route path="productos" element={<ProductosModule />} />
            <Route path="ventas" element={<VentasModule />} />
            <Route path="clientes" element={<ClientesModule />} />
            <Route path="inventario" element={<InventarioModule />} />
            
            {/* Billing Module Routes */}
            <Route path="facturacion" element={<FacturacionModule />} />
            <Route path="pagos" element={<PagosModule />} />
          </Route>
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
