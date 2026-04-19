// frontend/src/pages/Categorias.jsx — versión consolidada (sin conflictos de merge)
// FIX: confirm() con mensaje correcto en español.
// FIX: añade grid de cards completo con la versión de la rama main.
import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Categorias = () => {
  const [categorias,  setCategorias]  = useState([]);
  const [form,        setForm]        = useState({ nombre: '', descripcion: '' });
  const [mostrarForm, setMostrarForm] = useState(false);
  const [cargando,    setCargando]    = useState(false);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const { data } = await api.get('/categorias');
      setCategorias(data);
    } catch { toast.error('Error al cargar categorías'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      await api.post('/categorias', form);
      toast.success('Categoría creada');
      setForm({ nombre: '', descripcion: '' });
      setMostrarForm(false);
      cargar();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al crear categoría');
    } finally { setCargando(false); }
  };

  const eliminar = async (id) => {


    if (!confirm('Eliminar esta categoria?')) return;

    if (!confirm('¿Eliminar esta categoria?')) return;


    if (!confirm('¿Eliminar esta categoría? Los productos asociados quedarán sin categoría.')) return;

    try {
      await api.delete(`/categorias/${id}`);
      toast.success('Categoría eliminada');
      cargar();
    } catch {
      toast.error('No se puede eliminar: tiene productos asociados');
    }
  };


  // Render: formulario + grid de cards por categoria

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.titulo}>Categorías</h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>
            {categorias.length} categoría{categorias.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button style={styles.btnPrimario} onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? 'Cancelar' : '+ Nueva categoría'}
        </button>
      </div>

      {mostrarForm && (
        <div style={styles.formCard}>
          <h3 style={{ margin: '0 0 16px', color: '#1e1b4b' }}>Nueva categoría</h3>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.grupo}>
              <label style={styles.label}>Nombre *</label>
              <input
                style={styles.input}
                type="text"
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                placeholder="ej: Abarrotes"
                required
              />
            </div>
            <div style={styles.grupo}>
              <label style={styles.label}>Descripción</label>
              <input
                style={styles.input}
                type="text"
                value={form.descripcion}
                onChange={e => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Descripción opcional"
              />
            </div>
            <button style={styles.btnPrimario} type="submit" disabled={cargando}>
              {cargando ? 'Guardando...' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      <div style={styles.grid}>
        {categorias.map(c => (
          <div key={c.id} style={styles.card}>
            <span style={{ fontSize: 28 }}>🏷️</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, color: '#1e1b4b', fontSize: 15 }}>{c.nombre}</p>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {c.descripcion || 'Sin descripción'}
              </p>
            </div>
            <button onClick={() => eliminar(c.id)} style={styles.btnEliminar} title="Eliminar categoría">✕</button>
          </div>
        ))}
        {categorias.length === 0 && (
          <p style={{ color: '#94a3b8', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
            No hay categorías aún. Crea la primera para organizar tus productos.
          </p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container:   { padding: '30px', flex: 1 },

  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  titulo:      { fontSize: '24px', fontWeight: '700', color: '#1e1b4b', margin: 0 },
  btnPrimario: { padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  btnEliminar: { padding: '6px 10px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' },
  formCard:    { backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' },
  form:        { display: 'flex', gap: '16px', alignItems: 'end', flexWrap: 'wrap' },
  grupo:       { display: 'flex', flexDirection: 'column' },
  label:       { marginBottom: '5px', fontWeight: '600', color: '#374151', fontSize: '13px' },
  input:       { padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', minWidth: '200px' },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' },
  card:        { backgroundColor: 'white', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: '12px' }


  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  titulo:      { fontSize: 24, fontWeight: 700, color: '#1e1b4b', margin: 0 },
  btnPrimario: { padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  btnEliminar: { padding: '6px 10px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, flexShrink: 0 },
  formCard:    { backgroundColor: 'white', padding: 20, borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 24 },
  form:        { display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' },
  grupo:       { display: 'flex', flexDirection: 'column', flex: 1, minWidth: 180 },
  label:       { marginBottom: 5, fontWeight: 600, color: '#374151', fontSize: 13 },
  input:       { padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 },
  card:        { backgroundColor: 'white', borderRadius: 10, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: 12 }

};

export default Categorias;
