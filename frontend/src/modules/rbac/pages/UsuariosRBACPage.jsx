import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRBAC } from '../hooks';
import { usuarioSchema } from '../schemas/rbacSchemas';

const camposForm = [
  ['Nombre completo *', 'nombre', 'text', true],
  ['Email *', 'email', 'email', true],
  ['Contraseña *', 'password', 'password', true],
];

const emptyForm = { nombre: '', email: '', password: '', rol_id: '' };

/**
 * Página de Gestión de Usuarios RBAC
 * 
 * Permite:
 * - Ver lista de usuarios de la empresa
 * - Crear nuevos usuarios
 * - Cambiar el rol de un usuario existente
 */
const UsuariosRBACPage = () => {
  const { usuarios, roles, crearUsuario, actualizarRolUsuario, cargarUsuarios } = useRBAC();
  const [form, setForm] = useState(emptyForm);
  const [editando, setEditando] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      rol_id: Number(form.rol_id),
    };

    const validation = usuarioSchema.safeParse(payload);
    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message || 'Formulario inválido');
      return;
    }

    if (editando) {
      const ok = await actualizarRolUsuario(editando, payload.rol_id);
      if (!ok) return;
    } else {
      const ok = await crearUsuario(payload);
      if (!ok) return;
    }

    setForm(emptyForm);
    setEditando(null);
    setMostrarForm(false);
  };

  const iniciarEdicion = (usuario) => {
    setForm({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol_id: usuario.rol_id || '',
    });
    setEditando(usuario.id);
    setMostrarForm(true);
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          Usuarios{' '}
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-sm text-indigo-700">
            {usuarios.length}
          </span>
        </h1>
        <button
          className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
          onClick={() => {
            setMostrarForm(!mostrarForm);
            setEditando(null);
            setForm(emptyForm);
          }}
        >
          {mostrarForm ? 'Cancelar' : '+ Nuevo usuario'}
        </button>
      </div>

      {mostrarForm && (
        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            {editando ? 'Editar usuario' : 'Nuevo usuario'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {camposForm.map(([label, name, type, required]) => (
              <div key={name} className="flex flex-col">
                <label className="mb-1 text-xs font-semibold text-slate-700">{label}</label>
                <input
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  type={type}
                  value={form[name]}
                  onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                  required={required}
                  disabled={editando && name === 'password'}
                />
              </div>
            ))}
            <div className="flex flex-col">
              <label className="mb-1 text-xs font-semibold text-slate-700">Rol *</label>
              <select
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={form.rol_id}
                onChange={(e) => setForm({ ...form, rol_id: e.target.value })}
                required
              >
                <option value="">Seleccionar rol</option>
                {roles.map((rol) => (
                  <option key={rol.id} value={rol.id}>
                    {rol.nombre}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
              type="submit"
            >
              {editando ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      {/* Tabla de Usuarios */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">{usuario.id}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">{usuario.nombre}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{usuario.email}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                  {usuario.Rol?.nombre || `Rol #${usuario.rol_id}`}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      usuario.estado === 'activo'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {usuario.estado}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button
                    className="text-indigo-600 hover:text-indigo-900"
                    onClick={() => iniciarEdicion(usuario)}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsuariosRBACPage;
