import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const validarSesion = async () => {
      const token = localStorage.getItem('token');
      const usuarioGuardado = localStorage.getItem('usuario');

      if (!token || !usuarioGuardado) {
        setCargando(false);
        return;
      }

      try {
        const { data } = await axios.get(`${BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000
        });
        setUsuario(data);
        localStorage.setItem('usuario', JSON.stringify(data));
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          setUsuario(null);
        } else {
          try {
            setUsuario(JSON.parse(usuarioGuardado));
          } catch {
            setUsuario(null);
          }
        }
      } finally {
        setCargando(false);
      }
    };

    validarSesion();
  }, []);

  const login = useCallback((datos) => {
    localStorage.setItem('token', datos.token);
    localStorage.setItem('usuario', JSON.stringify(datos.usuario));
    setUsuario(datos.usuario);
  }, []);

  const logout = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        await axios.post(`${BASE_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          timeout: 5000
        });
      } catch {}
    }

    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_usuario');
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
