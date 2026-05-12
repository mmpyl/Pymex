import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

let cachedUsuario = null;
let cachedAdmin = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(cachedUsuario);
  const [admin, setAdmin] = useState(cachedAdmin);
  const [cargando, setCargando] = useState(!cachedUsuario && !cachedAdmin);

  const validarSesionEmpresa = useCallback(async () => {
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

  const validarSesionAdmin = useCallback(async () => {
    const now = Date.now();
    if (cachedAdmin && (now - cacheTimestamp) < CACHE_DURATION) {
      setAdmin(cachedAdmin);
      setCargando(false);
      return;
    }

    try {
      const { data } = await api.get('/auth/admin/profile', { timeout: 8000 });
      cachedAdmin = data;
      cacheTimestamp = now;
      setAdmin(data);
    } catch {
      cachedAdmin = null;
      cacheTimestamp = 0;
      setAdmin(null);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
    const empresaToken = localStorage.getItem('empresa_token') || sessionStorage.getItem('empresa_token');
    
    if (adminToken) {
      validarSesionAdmin();
    } else if (empresaToken) {
      validarSesionEmpresa();
    } else {
      setCargando(false);
    }
  }, [validarSesionEmpresa, validarSesionAdmin]);

  const login = useCallback((datos, remember = false) => {
    const storage = remember ? localStorage : sessionStorage;
    if (datos?.token) {
      storage.setItem('empresa_token', datos.token);
    }
    cachedUsuario = datos?.usuario || null;
    cacheTimestamp = Date.now();
    setUsuario(cachedUsuario);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout', {}, { timeout: 5000 });
    } catch {}

    localStorage.removeItem('empresa_token');
    sessionStorage.removeItem('empresa_token');
    cachedUsuario = null;
    cacheTimestamp = 0;
    setUsuario(null);
  }, []);

  const loginAdmin = useCallback((datos, remember = false) => {
    const storage = remember ? localStorage : sessionStorage;
    if (datos?.token) {
      storage.setItem('admin_token', datos.token);
    }
    cachedAdmin = datos?.admin || null;
    cacheTimestamp = Date.now();
    setAdmin(cachedAdmin);
  }, []);

  const logoutAdmin = useCallback(async () => {
    try {
      await api.post('/auth/admin/logout', {}, { timeout: 5000 });
    } catch {}

    localStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_token');
    cachedAdmin = null;
    cacheTimestamp = 0;
    setAdmin(null);
  }, []);

  const getRol = useCallback(() => {
    // Intentar obtener rol del usuario de empresa
    if (usuario?.rol) return usuario.rol;
    // Fallback: intentar obtener del token decodificado
    try {
      const token = localStorage.getItem('empresa_token') || sessionStorage.getItem('empresa_token');
      if (token) {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        return decoded?.rol || 'admin';
      }
    } catch {}
    return 'admin';
  }, [usuario]);

  const isAdminEmpresa = useCallback(() => {
    const rol = getRol();
    return ['admin', 'admin_empresa', 'administrador'].includes(rol.toLowerCase());
  }, [getRol]);

  const isGerente = useCallback(() => {
    const rol = getRol();
    return ['gerente', 'manager'].includes(rol.toLowerCase());
  }, [getRol]);

  const isEmpleado = useCallback(() => {
    const rol = getRol();
    return ['empleado', 'staff'].includes(rol.toLowerCase());
  }, [getRol]);

  const isContador = useCallback(() => {
    const rol = getRol();
    return ['contador', 'accountant'].includes(rol.toLowerCase());
  }, [getRol]);

  const hasRole = useCallback((roles) => {
    const rolActual = getRol();
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.map(r => r.toLowerCase()).includes(rolActual.toLowerCase());
  }, [getRol]);

  return (
    <AuthContext.Provider value={{ 
      usuario, 
      admin, 
      login, 
      logout, 
      loginAdmin, 
      logoutAdmin, 
      cargando,
      getRol,
      isAdminEmpresa,
      isGerente,
      isEmpleado,
      isContador,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
