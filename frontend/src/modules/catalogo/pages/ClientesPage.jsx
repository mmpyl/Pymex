import { useState } from 'react';
import toast from 'react-hot-toast';
import TablaEntidad from '../components/TablaEntidad';
import { useClientes } from '../hooks';
import { clienteSchema } from '../schemas/catalogoSchemas';

const camposForm = [
  ['Nombre completo *', 'nombre', 'text', true],
  ['DNI / RUC', 'documento', 'text', false],
  ['Email', 'email', 'email', false],
  ['Teléfono', 'telefono', 'text', false],
  ['Dirección', 'direccion', 'text', false],
];

const emptyForm = { nombre: '', documento: '', email: '', telefono: '', direccion: '' };

const ClientesPage = () => {
  const { items: clientes, create, update, remove } = useClientes();
  const [form, setForm] = useState(emptyForm);
  const [editando, setEditando] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = clienteSchema.safeParse(form);
    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message || 'Formulario inválido');
      return;
    }

    const ok = editando
      ? await update(editando, validation.data)
      : await create(validation.data);

    if (!ok) return;

    setForm(emptyForm);
    setEditando(null);
    setMostrarForm(false);
  };

  const iniciarEdicion = (cliente) => {
    setForm({
      nombre: cliente.nombre,
      documento: cliente.documento || '',
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || '',
    });
    setEditando(cliente.id);
    setMostrarForm(true);
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este cliente?')) return;
    await remove(id);
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">Clientes <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-sm text-indigo-700">{clientes.length}</span></h1>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white" onClick={() => { setMostrarForm(!mostrarForm); setEditando(null); setForm(emptyForm); }}>
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

export default ClientesPage;
