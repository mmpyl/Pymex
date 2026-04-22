// frontend/src/routes/guards.jsx

import { Navigate } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import { useAccessControl } from '../hooks/useAccessControl';

export const ProtectedRoute = ({ children }) => (
  <PrivateRoute>{children}</PrivateRoute>
);

export const RoleRoute = ({ children, roles = [] }) => {
  const { hasRole } = useAccessControl();

  if (!hasRole(roles)) return <Navigate to="/403" replace />;
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
          href="/admin"
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg no-underline font-semibold hover:bg-indigo-700 transition-colors"
        >
          Ver planes disponibles
        </a>
      </div>
    );
  }
  return children;
};
