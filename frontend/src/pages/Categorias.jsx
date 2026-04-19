import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { Plus, Tag, Trash2 } from 'lucide-react';

const styles = {
  container: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  formCard: { marginBottom: '24px', padding: '20px' },
  form: { display: 'flex', gap: '16px', alignItems: 'end', flexWrap: 'wrap' },
  grupo: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: '180px' },
  label: { marginBottom: '5px', fontWeight: '600', color: '#374151', fontSize: '13px' },
  input: { padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' },
  card: { backgroundColor: 'white', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: '12px' },
  btnEliminar: { padding: '6px 10px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', flexShrink: 0 }
};

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({ nombre: '', descripcion: '' });
  const [mostrarForm, setMostrarForm] = useState(false);
  const [cargando, setCargando] = useState(false);

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
    if (!confirm('¿Eliminar esta categoría? Los productos asociados quedarán sin categoría.')) return;
    try {
      await api.delete(`/categorias/${id}`);
      toast.success('Categoría eliminada');
      cargar();
    } catch {
      toast.error('No se puede eliminar: tiene productos asociados');
    }
  };

  return (
    <div style={styles.container}>
      <PageHeader 
        title="Categorías" 
        subtitle={`${categorias.length} categoría${categorias.length !== 1 ? 's' : ''}`} 
      />

      <Button onClick={() => setMostrarForm(!mostrarForm)} className="mb-6">
        <Plus className="w-4 h-4 mr-2" />
        {mostrarForm ? 'Cancelar' : 'Nueva categoría'}
      </Button>

      {mostrarForm && (
        <Card className="p-6 mb-6">
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
            <Button type="submit" disabled={cargando}>
              {cargando ? 'Guardando...' : 'Guardar'}
            </Button>
          </form>
        </Card>
      )}

      <div style={styles.grid}>
        {categorias.map(c => (
          <div key={c.id} style={styles.card}>
            <Tag className="w-8 h-8 text-indigo-500" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, color: '#1e1b4b', fontSize: '15px' }}>{c.nombre}</p>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {c.descripcion || 'Sin descripción'}
              </p>
            </div>
            <button onClick={() => eliminar(c.id)} style={styles.btnEliminar} title="Eliminar categoría">
              <Trash2 className="w-4 h-4" />
            </button>
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

export default Categorias;
