

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem('usuario');
        const token = localStorage.getItem('token');
        if (usuarioGuardado && token) {
            setUsuario(JSON.parse(usuarioGuardado));
        }
        setCargando(false);
    }, []);

    const login = (datos) => {
        localStorage.setItem('token', datos.token);
        localStorage.setItem('usuario', JSON.stringify(datos.usuario));
        setUsuario(datos.usuario);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

// frontend/src/context/AuthContext.jsx
// FIX: valida el token contra el servidor al restaurar la sesión desde localStorage.
// Evita que la UI muestre datos de un usuario con token caducado.

// frontend/src/context/AuthContext.jsx — versión consolidada
// FIX: elimina la referencia a /auth/refresh que no existe en el backend.
// En su lugar: si el token es inválido/expirado → limpia sesión y redirige a login.
// Si hay error de red (timeout, servidor caído) → mantiene sesión con datos locales.


import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const AuthProvider = ({ children }) => {
  const [usuario,  setUsuario]  = useState(null);
  const [cargando, setCargando] = useState(true);

  // ─── Validar sesión al arrancar ──────────────────────────────────────────────
  useEffect(() => {
    const validarSesion = async () => {
      const token          = localStorage.getItem('token');
      const usuarioGuardado = localStorage.getItem('usuario');

      if (!token || !usuarioGuardado) {
        setCargando(false);
        return;
      }

      try {
        // Verificar que el token sigue siendo válido en el servidor
        const { data } = await axios.get(`${BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000
        });

        // El perfil del servidor tiene precedencia sobre el localStorage
        setUsuario(data);
        localStorage.setItem('usuario', JSON.stringify(data));
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          // Token inválido o expirado → limpiar sesión
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          setUsuario(null);
        } else {
          // Error de red (servidor caído, timeout) → mantener sesión local
          // para no desloguear usuarios por problemas de conectividad momentáneos
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

  // ─── Login ───────────────────────────────────────────────────────────────────
  const login = useCallback((datos) => {
    localStorage.setItem('token',   datos.token);
    localStorage.setItem('usuario', JSON.stringify(datos.usuario));
    setUsuario(datos.usuario);
  }, []);

  // ─── Logout — revoca el token en el servidor antes de limpiar ────────────────
  const logout = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        await axios.post(
          `${BASE_URL}/auth/logout`,
          {},
          {
            headers:         { Authorization: `Bearer ${token}` },
            withCredentials: true,
            timeout:         5000
          }
        );
      } catch {
        // Continuar con logout local aunque falle la llamada al servidor
      }
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

