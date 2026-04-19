import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

const ROLE_BY_ID = {
  1: 'admin',
  2: 'gerente',
  3: 'empleado',
  4: 'contador',
  5: 'super_admin',
  6: 'soporte'
};

const ADMIN_ROLES = new Set(['admin', 'admin_empresa', 'super_admin']);

const normalizeRole = (value = '') =>
  value.toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '_')
    .trim();

export const useAccessControl = () => {
  const { usuario } = useAuth();

  return useMemo(() => {
    const roleRaw = usuario?.rol_nombre || ROLE_BY_ID[usuario?.rol_id] || 'empleado';
    const role = normalizeRole(roleRaw);
    
    const permissions = new Set(
      (usuario?.permisos || []).map(p => p.toLowerCase())
    );
    const features = new Set(
      (usuario?.features || []).map(f => f.toLowerCase())
    );

    const isAdmin = ADMIN_ROLES.has(role);

    const hasRole = (allowedRoles = []) => {
      if (!allowedRoles.length) return true;
      const normalized = allowedRoles.map(normalizeRole);
      return normalized.includes(role);
    };

    const hasPermission = (permissionCode) =>
      isAdmin || role === 'super_admin' || permissions.has(permissionCode.toLowerCase());

    const hasFeature = (featureCode) =>
      isAdmin || role === 'super_admin' || features.has(featureCode.toLowerCase());

    return { role, isAdmin, hasRole, hasPermission, hasFeature };
  }, [usuario]);
};
