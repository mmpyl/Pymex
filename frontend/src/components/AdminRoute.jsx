import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <div className="flex items-center justify-center min-h-screen text-gray-700">Cargando...</div>;
  }

  if (!usuario) {
    return <Navigate to='/staff/login' replace />;
  }

  const rolesPermitidos = ['super_admin', 'admin', 'moderador', 'soporte'];
  if (!rolesPermitidos.includes(usuario.rol)) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Acceso restringido</h2>
        <p className="text-gray-600">Tu rol actual no tiene permisos para el panel administrativo.</p>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
