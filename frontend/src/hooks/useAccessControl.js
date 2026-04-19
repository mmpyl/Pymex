
import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

const ROLE_BY_ID = {
  1: 'admin_empresa',
  2: 'gerente',
  3: 'vendedor',
  4: 'contador',
  5: 'almacen'
};

const normalizeRole = (value = '') => value
  .toString()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/\s+/g, '_')
  .trim();

// frontend/src/hooks/useAccessControl.js — versión consolidada
// FIX: conflicto de merge resuelto. Se combina:
//   - Normalización de acentos y espacios (rama HEAD) para que 'admin empresa' === 'admin_empresa'
//   - Fallback por rol_id cuando rol_nombre no está disponible (rama main)
//   - isAdmin incluye super_admin y soporte además de admin_empresa
import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

// Mapa de fallback para cuando el servidor no devuelve el nombre del rol
const ROLE_BY_ID = {
  1: 'admin',
  2: 'gerente',
  3: 'empleado',
  4: 'contador',
  5: 'super_admin',
  6: 'soporte'
};

// Normaliza rol: quita acentos, minúsculas, reemplaza espacios por _
const normalizeRole = (value = '') =>
  value.toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '_')
    .trim();

const ADMIN_ROLES = new Set([
  'admin', 'admin_empresa', 'super_admin'
]);


export const useAccessControl = () => {
  const { usuario } = useAuth();

  return useMemo(() => {

    const roleRaw = usuario?.rol_nombre || ROLE_BY_ID[usuario?.rol_id] || 'vendedor';
    const role = normalizeRole(roleRaw);
    const permissions = new Set((usuario?.permisos || []).map((p) => p.toLowerCase()));
    const features = new Set((usuario?.features || []).map((f) => f.toLowerCase()));

    const isAdmin = ['admin_empresa', 'super_admin', 'admin'].includes(role);

    const hasRole = (allowedRoles = []) => {
      if (allowedRoles.length === 0) return true;

    const roleRaw  = usuario?.rol_nombre || ROLE_BY_ID[usuario?.rol_id] || 'empleado';
    const role     = normalizeRole(roleRaw);
    const isAdmin  = ADMIN_ROLES.has(role);

    // Permisos y features que el servidor puede incluir en el token o en el perfil
    const permissions = new Set(
      (usuario?.permisos || []).map(p => p.toLowerCase())
    );
    const features = new Set(
      (usuario?.features || []).map(f => f.toLowerCase())
    );

    const hasRole = (allowedRoles = []) => {
      if (!allowedRoles.length) return true;

      const normalized = allowedRoles.map(normalizeRole);
      return normalized.includes(role);
    };


    const hasPermission = (permissionCode) => isAdmin || permissions.has(permissionCode.toLowerCase());
    const hasFeature = (featureCode) => isAdmin || features.has(featureCode.toLowerCase());

    return { role, hasRole, hasPermission, hasFeature, isAdmin };

    // Admin tiene todos los permisos; super_admin también
    const hasPermission = (permissionCode) =>
      isAdmin || role === 'super_admin' || permissions.has(permissionCode.toLowerCase());

    // Admin tiene todas las features activas por defecto en el frontend
    const hasFeature = (featureCode) =>
      isAdmin || role === 'super_admin' || features.has(featureCode.toLowerCase());

    return { role, isAdmin, hasRole, hasPermission, hasFeature };

  }, [usuario]);
};
