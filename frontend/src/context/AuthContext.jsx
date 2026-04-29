import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

let cachedUsuario = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(cachedUsuario);
  const [cargando, setCargando] = useState(!cachedUsuario);

  const validarSesion = useCallback(async () => {
    const now = Date.now();
    if (cachedUsuario && (now - cacheTimestamp) < CACHE_DURATION) {
      setUsuario(cachedUsuario);
      setCargando(false);
      return;
    }

    try {
      const { data } = await api.get('/auth/profile', { timeout: 8000 });
      cachedUsuario = data;
      cacheTimestamp = now;
      setUsuario(data);
    } catch {
      cachedUsuario = null;
      cacheTimestamp = 0;
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    validarSesion();
  }, [validarSesion]);

  const login = useCallback((datos) => {
    cachedUsuario = datos?.usuario || null;
    cacheTimestamp = Date.now();
    setUsuario(cachedUsuario);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout', {}, { timeout: 5000 });
    } catch {}

    cachedUsuario = null;
    cacheTimestamp = 0;
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
