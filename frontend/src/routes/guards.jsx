// frontend/src/routes/guards.jsx

import { Navigate } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import { useAccessControl } from '../hooks/useAccessControl';

export const ProtectedRoute = ({ children }) => (
  <PrivateRoute>{children}</PrivateRoute>
);

/**
 * RoleRoute - Guarda de rutas por rol específico
 * Valida que el usuario tenga uno de los roles permitidos
 * @param {Array<string>} roles - Lista de roles permitidos
 */
export const RoleRoute = ({ children, roles = [] }) => {
  const { hasRole, cargando } = useAccessControl();

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">Verificando permisos...</div>
      </div>
    );
  }

  if (!hasRole(roles)) {
    return <Navigate to="/403" replace />;
  }
  
  return children;
};

/**
 * ScopeRoute - Guarda de rutas por scope (business vs global)
 * Valida que el usuario tenga el scope correcto según el tipo de ruta
 * @param {'business'|'global'} scope - Scope requerido para acceder a la ruta
 */
export const ScopeRoute = ({ children, scope = 'business' }) => {
  const { usuario, admin, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">Verificando acceso...</div>
      </div>
    );
  }

  // Validar scope business (usuarios de empresa)
  if (scope === 'business' && !usuario) {
    return <Navigate to="/empresa/login" replace />;
  }

  // Validar scope global (admin del sistema)
  if (scope === 'global' && !admin) {
    return <Navigate to="/staff/login" replace />;
  }

  return children;
};

export const FeatureRoute = ({ children, featureCode, fallback = null }) => {
  const { hasFeature } = useAccessControl();
  if (!hasFeature(featureCode)) {
    return fallback || (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="text-[48px] mb-4">🔒</div>
        <h2 className="text-indigo-950 mb-2">Función no disponible en tu plan</h2>
        <p className="text-slate-500 max-w-md mb-6">
          La función <strong>{featureCode}</strong> requiere un plan superior o
          habilitación manual por el administrador de la plataforma.
        </p>
        <a
          href="/super-admin"
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg no-underline font-semibold hover:bg-indigo-700 transition-colors"
        >
          Ver planes disponibles
        </a>
      </div>
    );
  }
  return children;
};
