import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRBAC } from '../hooks';

/**
 * Página de Gestión de Roles y Permisos RBAC
 * 
 * Permite:
 * - Ver lista de roles con sus permisos actuales
 * - Ver lista completa de permisos disponibles
 * - Asignar/quitar permisos a un rol seleccionado
 */
const RolesPermisosPage = () => {
  const { roles, permisos, actualizarPermisosRol, selectedRol, setSelectedRol, cargarRoles } = useRBAC();
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);
  const [guardando, setGuardando] = useState(false);

  // Cuando se selecciona un rol, cargar sus permisos actuales
  useEffect(() => {
    if (selectedRol) {
      const rol = roles.find((r) => r.id === selectedRol);
      if (rol && rol.permisos) {
        setPermisosSeleccionados(rol.permisos.map((p) => p.id));
      } else {
        setPermisosSeleccionados([]);
      }
    }
  }, [selectedRol, roles]);

  const handleTogglePermiso = (permisoId) => {
    setPermisosSeleccionados((prev) =>
      prev.includes(permisoId)
        ? prev.filter((id) => id !== permisoId)
        : [...prev, permisoId]
    );
  };

  const handleGuardar = async () => {
    if (!selectedRol) {
      toast.error('Selecciona un rol primero');
      return;
    }

    setGuardando(true);
    const ok = await actualizarPermisosRol(selectedRol, permisosSeleccionados);
    setGuardando(false);

    if (ok) {
      setSelectedRol(null);
      setPermisosSeleccionados([]);
    }
  };

  const rolSeleccionado = roles.find((r) => r.id === selectedRol);

  return (
    <div className="flex-1 p-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Gestión de Roles y Permisos</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Columna 1: Lista de Roles */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Roles</h2>
          <div className="space-y-2">
            {roles.map((rol) => (
              <button
                key={rol.id}
                className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                  selectedRol === rol.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
                onClick={() => setSelectedRol(rol.id)}
              >
                {rol.nombre}
                <span className="ml-2 text-xs opacity-75">
                  ({rol.permisos?.length || 0} permisos)
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Columna 2 y 3: Permisos del Rol Seleccionado */}
        {selectedRol && (
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Permisos de: <span className="text-indigo-600">{rolSeleccionado?.nombre}</span>
                </h2>
                <button
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                  onClick={handleGuardar}
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {permisos.map((permiso) => (
                  <label
                    key={permiso.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={permisosSeleccionados.includes(permiso.id)}
                      onChange={() => handleTogglePermiso(permiso.id)}
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{permiso.nombre}</p>
                      <p className="text-xs text-slate-500">{permiso.codigo}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-4 rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-600">
                  <strong>Permisos seleccionados:</strong> {permisosSeleccionados.length} de{' '}
                  {permisos.length}
                </p>
              </div>
            </div>
          </div>
        )}

        {!selectedRol && (
          <div className="lg:col-span-2">
            <div className="flex h-full items-center justify-center rounded-xl bg-slate-50 p-6 text-center">
              <div>
                <p className="text-lg font-medium text-slate-600">Selecciona un rol para gestionar sus permisos</p>
                <p className="text-sm text-slate-500">Haz clic en un rol de la lista izquierda</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RolesPermisosPage;
