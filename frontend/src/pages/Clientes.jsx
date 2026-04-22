import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const camposForm = [
  ['Nombre completo *', 'nombre', 'text', true],
  ['DNI / RUC', 'documento', 'text', false],
  ['Email', 'email', 'email', false],
  ['Teléfono', 'telefono', 'text', false],
  ['Dirección', 'direccion', 'text', false]
];

const TablaEntidad = ({ datos, columnas, onEditar, onEliminar }) => (
  <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
    <table className="w-full border-collapse">
      <thead className="bg-slate-50">
        <tr>
          {columnas.map((c) => <th key={c} className="px-4 py-3 text-left text-xs font-semibold text-slate-700">{c}</th>)}
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {datos.map((item) => (
          <tr key={item.id} className="border-t border-slate-100">
            {columnas.map((c) => <td key={c} className="px-4 py-3 text-sm text-slate-700">{item[c.toLowerCase()] || '—'}</td>)}
            <td className="px-4 py-3 text-sm">
              <button onClick={() => onEditar(item)} className="mr-2 rounded-md bg-indigo-100 px-3 py-1 text-indigo-700">Editar</button>
              <button onClick={() => onEliminar(item.id)} className="rounded-md bg-red-100 px-3 py-1 text-red-700">Eliminar</button>
            </td>
          </tr>
        ))}
        {datos.length === 0 && (
          <tr>
            <td colSpan={columnas.length + 1} className="px-4 py-8 text-center text-sm text-slate-400">No hay registros</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ nombre: '', documento: '', email: '', telefono: '', direccion: '' });
  const [editando, setEditando] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    const { data } = await api.get('/clientes');
    setClientes(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.put(`/clientes/${editando}`, form);
        toast.success('Cliente actualizado');
      } else {
        await api.post('/clientes', form);
        toast.success('Cliente creado');
      }
      setForm({ nombre: '', documento: '', email: '', telefono: '', direccion: '' });
      setEditando(null);
      setMostrarForm(false);
      cargar();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    }
  };

  const iniciarEdicion = (cliente) => {
    setForm({ nombre: cliente.nombre, documento: cliente.documento || '', email: cliente.email || '', telefono: cliente.telefono || '', direccion: cliente.direccion || '' });
    setEditando(cliente.id);
    setMostrarForm(true);
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este cliente?')) return;
    await api.delete(`/clientes/${id}`);
    toast.success('Cliente eliminado');
    cargar();
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">Clientes <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-sm text-indigo-700">{clientes.length}</span></h1>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white" onClick={() => { setMostrarForm(!mostrarForm); setEditando(null); setForm({ nombre: '', documento: '', email: '', telefono: '', direccion: '' }); }}>
          {mostrarForm ? 'Cancelar' : '+ Nuevo cliente'}
        </button>
      </div>

      {mostrarForm && (
        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">{editando ? 'Editar cliente' : 'Nuevo cliente'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {camposForm.map(([label, name, type, required]) => (
              <div key={name} className="flex flex-col">
                <label className="mb-1 text-xs font-semibold text-slate-700">{label}</label>
                <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" type={type} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} required={required} />
              </div>
            ))}
            <button className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white" type="submit">{editando ? 'Actualizar' : 'Guardar'}</button>
          </form>
        </div>
      )}

      <TablaEntidad datos={clientes} columnas={['Nombre', 'Documento', 'Email', 'Teléfono']} onEditar={iniciarEdicion} onEliminar={eliminar} />
    </div>
  );
};

export default Clientes;
