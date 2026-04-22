import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({
    nombre: '', precio_compra: '', precio_venta: '',
    stock: '', stock_minimo: 5, categoria_id: '',
  });
  const [editando, setEditando] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => { cargar(); cargarCategorias(); }, []);

  const cargar = async () => {
    try {
      const { data } = await api.get('/productos');
      setProductos(data);
    } catch {
      toast.error('Error al cargar productos');
    }
  };

  const cargarCategorias = async () => {
    try {
      const { data } = await api.get('/categorias');
      setCategorias(data);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      if (editando) {
        await api.put(`/productos/${editando}`, form);
        toast.success('Producto actualizado');
      } else {
        await api.post('/productos', form);
        toast.success('Producto creado');
      }
      resetForm();
      cargar();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar producto');
    } finally {
      setCargando(false);
    }
  };

  const iniciarEdicion = (p) => {
    setForm({
      nombre: p.nombre,
      precio_compra: String(p.precio_compra),
      precio_venta: String(p.precio_venta),
      stock: String(p.stock),
      stock_minimo: p.stock_minimo,
      categoria_id: p.categoria_id || '',
    });
    setEditando(p.id);
    setMostrarForm(true);
  };

  const resetForm = () => {
    setForm({ nombre: '', precio_compra: '', precio_venta: '', stock: '', stock_minimo: 5, categoria_id: '' });
    setEditando(null);
    setMostrarForm(false);
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/productos/${id}`);
      toast.success('Producto eliminado');
      cargar();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al eliminar');
    }
  };

  const productosFiltrados = busqueda.trim()
    ? productos.filter((p) => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    : productos;

  const campos = [
    ['Nombre *', 'nombre', 'text', true],
    ['Precio compra', 'precio_compra', 'number', false],
    ['Precio venta *', 'precio_venta', 'number', true],
    ['Stock inicial', 'stock', 'number', false],
    ['Stock mínimo', 'stock_minimo', 'number', false],
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
          <p className="text-sm text-slate-500">
            {productos.length} producto{productos.length !== 1 ? 's' : ''} registrado{productos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white" onClick={() => { resetForm(); setMostrarForm(!mostrarForm); }}>
          {mostrarForm ? 'Cancelar' : '+ Nuevo producto'}
        </button>
      </div>

      {mostrarForm && (
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">{editando ? 'Editar producto' : 'Nuevo producto'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {campos.map(([label, name, type, required]) => (
              <div key={name} className="flex flex-col">
                <label className="mb-1 text-xs font-semibold text-slate-700">{label}</label>
                <input
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  type={type}
                  step={type === 'number' ? '0.01' : undefined}
                  value={form[name]}
                  onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                  required={required}
                />
              </div>
            ))}
            <div className="flex flex-col">
              <label className="mb-1 text-xs font-semibold text-slate-700">Categoría</label>
              <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.categoria_id} onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}>
                <option value="">Sin categoría</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-2 xl:col-span-2">
              <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70" type="submit" disabled={cargando}>
                {cargando ? 'Guardando...' : editando ? 'Actualizar' : 'Guardar'}
              </button>
              {editando && (
                <button type="button" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600" onClick={resetForm}>
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div>
        <input
          className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm"
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead className="bg-slate-50">
            <tr>
              <Th>Producto</Th><Th>Categoría</Th><Th>P. Compra</Th><Th>P. Venta</Th><Th>Stock</Th><Th>Estado</Th><Th>Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <Td>
                  <strong>{p.nombre}</strong>
                  {p.descripcion && <div className="mt-0.5 text-xs text-slate-400">{p.descripcion}</div>}
                </Td>
                <Td>{p.Categoria?.nombre || <span className="text-slate-400">—</span>}</Td>
                <Td>S/ {parseFloat(p.precio_compra).toFixed(2)}</Td>
                <Td><strong>S/ {parseFloat(p.precio_venta).toFixed(2)}</strong></Td>
                <Td>
                  <span className={p.stock <= p.stock_minimo ? 'font-semibold text-red-600' : 'font-semibold text-emerald-600'}>
                    {p.stock}{p.stock <= p.stock_minimo && ' ⚠️'}
                  </span>
                  <span className="block text-xs text-slate-400">mín: {p.stock_minimo}</span>
                </Td>
                <Td>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.estado === 'activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {p.estado}
                  </span>
                </Td>
                <Td>
                  <button onClick={() => iniciarEdicion(p)} className="mr-2 rounded-md bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">Editar</button>
                  <button onClick={() => eliminar(p.id)} className="rounded-md bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">Eliminar</button>
                </Td>
              </tr>
            ))}
            {productosFiltrados.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                  {busqueda ? `Sin resultados para "${busqueda}"` : 'No hay productos aún'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Th = ({ children }) => <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">{children}</th>;
const Td = ({ children }) => <td className="px-4 py-3 text-sm text-slate-700">{children}</td>;

export default Productos;
