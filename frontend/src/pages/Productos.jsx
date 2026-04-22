import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Productos = () => {
  const [productos,   setProductos]   = useState([]);
  const [categorias,  setCategorias]  = useState([]);
  const [form, setForm] = useState({
    nombre: '', precio_compra: '', precio_venta: '',
    stock: '', stock_minimo: 5, categoria_id: ''
  });
  const [editando,    setEditando]    = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [cargando,    setCargando]    = useState(false);
  const [busqueda,    setBusqueda]    = useState('');

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
      nombre:       p.nombre,
      precio_compra: String(p.precio_compra),
      precio_venta:  String(p.precio_venta),
      stock:         String(p.stock),
      stock_minimo:  p.stock_minimo,
      categoria_id:  p.categoria_id || ''
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
    ? productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    : productos;

  const campos = [
    ['Nombre *',       'nombre',        'text',   true],
    ['Precio compra',  'precio_compra', 'number', false],
    ['Precio venta *', 'precio_venta',  'number', true],
    ['Stock inicial',  'stock',         'number', false],
    ['Stock mínimo',   'stock_minimo',  'number', false],
  ];

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div style={styles.header}>
        <div>
          <h1 style={styles.titulo}>Productos</h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>{productos.length} producto{productos.length !== 1 ? 's' : ''} registrado{productos.length !== 1 ? 's' : ''}</p>
        </div>
        <button style={styles.btnPrimario} onClick={() => { resetForm(); setMostrarForm(!mostrarForm); }}>
          {mostrarForm ? 'Cancelar' : '+ Nuevo producto'}
        </button>
      </div>

      {/* Formulario */}
      {mostrarForm && (
        <div style={styles.formCard}>
          <h3 style={{ margin: '0 0 16px', color: '#1e1b4b' }}>{editando ? 'Editar producto' : 'Nuevo producto'}</h3>
          <form onSubmit={handleSubmit} style={styles.form}>
            {campos.map(([label, name, type, required]) => (
              <div key={name} style={styles.grupo}>
                <label style={styles.label}>{label}</label>
                <input
                  style={styles.input}
                  type={type}
                  step={type === 'number' ? '0.01' : undefined}
                  value={form[name]}
                  onChange={e => setForm({ ...form, [name]: e.target.value })}
                  required={required}
                />
              </div>
            ))}
            <div style={styles.grupo}>
              <label style={styles.label}>Categoría</label>
              <select
                style={styles.input}
                value={form.categoria_id}
                onChange={e => setForm({ ...form, categoria_id: e.target.value })}
              >
                <option value="">Sin categoría</option>
                {categorias.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <button style={styles.btnPrimario} type="submit" disabled={cargando}>
                {cargando ? 'Guardando...' : editando ? 'Actualizar' : 'Guardar'}
              </button>
              {editando && (
                <button type="button" style={styles.btnSecundario} onClick={resetForm}>
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Buscador */}
      <div style={{ marginBottom: 16 }}>
        <input
          style={{ ...styles.input, maxWidth: 340 }}
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <div style={styles.tabla}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Producto</th>
              <th style={styles.th}>Categoría</th>
              <th style={styles.th}>P. Compra</th>
              <th style={styles.th}>P. Venta</th>
              <th style={styles.th}>Stock</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map(p => (
              <tr key={p.id} style={styles.tr}>
                <td style={styles.td}>
                  <strong>{p.nombre}</strong>
                  {p.descripcion && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{p.descripcion}</div>}
                </td>
                <td style={styles.td}>
                  {p.Categoria?.nombre || <span style={{ color: '#94a3b8' }}>—</span>}
                </td>
                <td style={styles.td}>S/ {parseFloat(p.precio_compra).toFixed(2)}</td>
                <td style={styles.td}><strong>S/ {parseFloat(p.precio_venta).toFixed(2)}</strong></td>
                <td style={styles.td}>
                  <span style={{
                    color:      p.stock <= p.stock_minimo ? '#dc2626' : '#16a34a',
                    fontWeight: 600
                  }}>
                    {p.stock}
                    {p.stock <= p.stock_minimo && ' ⚠️'}
                  </span>
                  <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>mín: {p.stock_minimo}</span>
                </td>
                <td style={styles.td}>
                  <span style={{
                    padding:         '3px 10px',
                    borderRadius:    20,
                    fontSize:        12,
                    fontWeight:      600,
                    backgroundColor: p.estado === 'activo' ? '#dcfce7' : '#fee2e2',
                    color:           p.estado === 'activo' ? '#16a34a' : '#dc2626'
                  }}>
                    {p.estado}
                  </span>
                </td>
                <td style={styles.td}>
                  <button onClick={() => iniciarEdicion(p)} style={styles.btnEditar}>Editar</button>
                  <button onClick={() => eliminar(p.id)} style={styles.btnEliminar}>Eliminar</button>
                </td>
              </tr>
            ))}
            {productosFiltrados.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
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

const styles = {
  container:    { padding: '30px', flex: 1 },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  titulo:       { fontSize: '24px', fontWeight: '700', color: '#1e1b4b', margin: 0 },
  btnPrimario:  { padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  btnSecundario:{ padding: '10px 16px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  btnEditar:    { padding: '5px 12px', backgroundColor: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', marginRight: '6px' },
  btnEliminar:  { padding: '5px 12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  formCard:     { backgroundColor: 'white', padding: '24px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' },
  form:         { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'end' },
  grupo:        { display: 'flex', flexDirection: 'column' },
  label:        { marginBottom: '5px', fontWeight: '600', color: '#374151', fontSize: '13px' },
  input:        { padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' },
  tabla:        { backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' },
  table:        { width: '100%', borderCollapse: 'collapse' },
  thead:        { backgroundColor: '#f8fafc' },
  th:           { padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '13px' },
  tr:           { borderBottom: '1px solid #f1f5f9' },
  td:           { padding: '12px 16px', fontSize: '14px', color: '#374151' },
};

export default Productos;

