import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [form, setForm] = useState({ nombre: '', documento: '', email: '', telefono: '', direccion: '', contacto: '' });
  const [editando, setEditando] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    const { data } = await api.get('/proveedores');
    setProveedores(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.put(`/proveedores/${editando}`, form);
        toast.success('Proveedor actualizado');
      } else {
        await api.post('/proveedores', form);
        toast.success('Proveedor creado');
      }
      setForm({ nombre: '', documento: '', email: '', telefono: '', direccion: '', contacto: '' });
      setEditando(null);
      setMostrarForm(false);
      cargar();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    }
  };

  const iniciarEdicion = (p) => {
    setForm({ nombre: p.nombre, documento: p.documento || '', email: p.email || '', telefono: p.telefono || '', direccion: p.direccion || '', contacto: p.contacto || '' });
    setEditando(p.id);
    setMostrarForm(true);
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este proveedor?')) return;
    await api.delete(`/proveedores/${id}`);
    toast.success('Proveedor eliminado');
    cargar();
  };

  const campos = [
    ['Nombre *', 'nombre', 'text'], ['RUC / Documento', 'documento', 'text'],
    ['Email', 'email', 'email'], ['Teléfono', 'telefono', 'text'],
    ['Contacto', 'contacto', 'text'], ['Dirección', 'direccion', 'text']
  ];

  return (
    <div className="flex-1 p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">Proveedores <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-sm text-indigo-700">{proveedores.length}</span></h1>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white" onClick={() => { setMostrarForm(!mostrarForm); setEditando(null); }}>
          {mostrarForm ? 'Cancelar' : '+ Nuevo proveedor'}
        </button>
      </div>

      {mostrarForm && (
        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">{editando ? 'Editar proveedor' : 'Nuevo proveedor'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {campos.map(([label, name, type]) => (
              <div key={name} className="flex flex-col">
                <label className="mb-1 text-xs font-semibold text-slate-700">{label}</label>
                <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" type={type} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} required={label.includes('*')} />
              </div>
            ))}
            <button className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white" type="submit">{editando ? 'Actualizar' : 'Guardar'}</button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead className="bg-slate-50"><tr>
            {['Nombre', 'Documento', 'Contacto', 'Teléfono', 'Email', 'Acciones'].map((c) => <th key={c} className="px-4 py-3 text-left text-xs font-semibold text-slate-700">{c}</th>)}
          </tr></thead>
          <tbody>
            {proveedores.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="px-4 py-3 text-sm font-semibold text-slate-700">{p.nombre}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{p.documento || '—'}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{p.contacto || '—'}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{p.telefono || '—'}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{p.email || '—'}</td>
                <td className="px-4 py-3 text-sm">
                  <button onClick={() => iniciarEdicion(p)} className="mr-2 rounded-md bg-indigo-100 px-3 py-1 text-indigo-700">Editar</button>
                  <button onClick={() => eliminar(p.id)} className="rounded-md bg-red-100 px-3 py-1 text-red-700">Eliminar</button>
                </td>
              </tr>
            ))}
            {proveedores.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">No hay proveedores</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Proveedores;
