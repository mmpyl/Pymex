import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { usuario, cargando } = useAuth();

    if (cargando) return <div className="loading">Cargando...</div>;
    if (!usuario) return <Navigate to="/empresa/login" replace />;

    return children;
};

export default PrivateRoute;