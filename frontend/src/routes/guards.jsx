

// frontend/src/routes/guards.jsx — versión consolidada
// FIX: RoleRoute con acceso denegado redirige a /403 (no a /dashboard)
//      para que el usuario vea un mensaje de error claro.
// FIX: FeatureRoute muestra fallback informativo con CTA de upgrade.

import { Navigate } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import { useAccessControl } from '../hooks/useAccessControl';


export const ProtectedRoute = ({ children }) => <PrivateRoute>{children}</PrivateRoute>;

export const RoleRoute = ({ children, roles = [] }) => {
  const { hasRole } = useAccessControl();

export const ProtectedRoute = ({ children }) => (
  <PrivateRoute>{children}</PrivateRoute>
);

export const RoleRoute = ({ children, roles = [] }) => {
  const { hasRole } = useAccessControl();
  // FIX: redirige a /403 (no a /dashboard) para mostrar mensaje de acceso denegado

  if (!hasRole(roles)) return <Navigate to="/403" replace />;
  return children;
};

export const FeatureRoute = ({ children, featureCode, fallback = null }) => {
  const { hasFeature } = useAccessControl();
  if (!hasFeature(featureCode)) {
    return fallback || (

      <div style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 8 }}>Disponible en plan Pro</h3>
        <p>Esta funcionalidad requiere upgrade de plan o habilitación por tu administrador.</p>

      <div style={{
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'center',
        justifyContent:  'center',
        minHeight:       '60vh',
        padding:         24,
        textAlign:       'center'
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2 style={{ color: '#1e1b4b', marginBottom: 8 }}>Función no disponible en tu plan</h2>
        <p style={{ color: '#64748b', maxWidth: 400, marginBottom: 24 }}>
          La función <strong>{featureCode}</strong> requiere un plan superior o
          habilitación manual por el administrador de la plataforma.
        </p>
        <a
          href="/admin"
          style={{
            padding:         '10px 24px',
            background:      '#4f46e5',
            color:           '#fff',
            borderRadius:    8,
            textDecoration:  'none',
            fontWeight:      600
          }}
        >
          Ver planes disponibles
        </a>

      </div>
    );
  }
  return children;
};
