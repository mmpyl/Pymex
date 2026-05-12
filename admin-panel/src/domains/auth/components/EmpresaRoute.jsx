import React from 'react';
import { Navigate } from 'react-router-dom';
import { useEmpresaAuth } from '../hooks/useAuth';

/**
 * Componente para proteger rutas de empresas
 * Redirige al login si no está autenticado como empresa
 */
const EmpresaRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useEmpresaAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/empresa/login" replace />;
  }

  return children;
};

export default EmpresaRoute;
