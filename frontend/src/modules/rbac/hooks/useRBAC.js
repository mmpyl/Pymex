import { useReducer, useEffect, useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { rolesApi, permisosApi, usuariosApi } from '../api/rbacApi';

// ═══════════════════════════════════════════════════════════════════════════════
// ESTADOS Y ACCIONES
// ═══════════════════════════════════════════════════════════════════════════════

const initialState = {
  roles: [],
  permisos: [],
  usuarios: [],
  loading: false,
  error: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_ROLES':
      return { ...state, roles: action.payload, loading: false };
    case 'SET_PERMISOS':
      return { ...state, permisos: action.payload, loading: false };
    case 'SET_USUARIOS':
      return { ...state, usuarios: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: true, error: null };
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK PRINCIPAL RBAC
// ═══════════════════════════════════════════════════════════════════════════════

export const useRBAC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [selectedRol, setSelectedRol] = useState(null);

  // Cargar roles
  const cargarRoles = useCallback(async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const data = await rolesApi.list();
      dispatch({ type: 'SET_ROLES', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error al cargar roles' });
      toast.error('Error al cargar roles');
    }
  }, []);

  // Cargar permisos
  const cargarPermisos = useCallback(async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const data = await permisosApi.list();
      dispatch({ type: 'SET_PERMISOS', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error al cargar permisos' });
      toast.error('Error al cargar permisos');
    }
  }, []);

  // Cargar usuarios
  const cargarUsuarios = useCallback(async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const data = await usuariosApi.list();
      dispatch({ type: 'SET_USUARIOS', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error al cargar usuarios' });
      toast.error('Error al cargar usuarios');
    }
  }, []);

  // Actualizar permisos de un rol
  const actualizarPermisosRol = async (rolId, permisos) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      await rolesApi.updatePermisos(rolId, permisos);
      toast.success('Permisos del rol actualizados');
      await cargarRoles();
      return true;
    } catch (error) {
      const errorMsg = error?.response?.data?.error || 'Error al actualizar permisos';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      toast.error(errorMsg);
      return false;
    }
  };

  // Crear usuario
  const crearUsuario = async (payload) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      await usuariosApi.create(payload);
      toast.success('Usuario creado exitosamente');
      await cargarUsuarios();
      return true;
    } catch (error) {
      const errorMsg = error?.response?.data?.error || 'Error al crear usuario';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      toast.error(errorMsg);
      return false;
    }
  };

  // Actualizar rol de usuario
  const actualizarRolUsuario = async (usuarioId, rol_id) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      await usuariosApi.updateRol(usuarioId, rol_id);
      toast.success('Rol del usuario actualizado');
      await cargarUsuarios();
      return true;
    } catch (error) {
      const errorMsg = error?.response?.data?.error || 'Error al actualizar rol';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      toast.error(errorMsg);
      return false;
    }
  };

  // Carga inicial
  useEffect(() => {
    cargarRoles();
    cargarPermisos();
    cargarUsuarios();
  }, [cargarRoles, cargarPermisos, cargarUsuarios]);

  return {
    ...state,
    selectedRol,
    setSelectedRol,
    cargarRoles,
    cargarPermisos,
    cargarUsuarios,
    actualizarPermisosRol,
    crearUsuario,
    actualizarRolUsuario,
  };
};
