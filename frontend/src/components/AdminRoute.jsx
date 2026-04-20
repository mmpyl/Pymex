import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  const adminRaw = localStorage.getItem('admin_usuario');
  const admin = adminRaw ? JSON.parse(adminRaw) : null;

  if (!token || !admin) return <Navigate to='/staff/login' replace />;

  const rolesPermitidos = ['super_admin', 'admin', 'moderador', 'soporte'];
  if (!rolesPermitidos.includes(admin.rol)) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Acceso restringido</h2>
        <p>Tu rol actual no tiene permisos para el panel administrativo.</p>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
