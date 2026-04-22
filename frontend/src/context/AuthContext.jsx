import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const validarSesion = async () => {
      try {
        const { data } = await api.get('/auth/profile', { timeout: 8000 });
        setUsuario(data);
      } catch {
        setUsuario(null);
      } finally {
        setCargando(false);
      }
    };

    validarSesion();
  }, []);

  const login = useCallback((datos) => {
    setUsuario(datos?.usuario || null);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout', {}, { timeout: 5000 });
    } catch {}

    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
