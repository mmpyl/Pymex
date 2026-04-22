import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { Plus, Tag, Trash2 } from 'lucide-react';

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
    } catch {
      toast.error('Error al cargar categorías');
    }
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
    } finally {
      setCargando(false);
    }
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
    <div className="mx-auto max-w-6xl p-6">
      <PageHeader title="Categorías" subtitle={`${categorias.length} categoría${categorias.length !== 1 ? 's' : ''}`} />

      <Button onClick={() => setMostrarForm(!mostrarForm)} className="mb-6">
        <Plus className="mr-2 h-4 w-4" />
        {mostrarForm ? 'Cancelar' : 'Nueva categoría'}
      </Button>

      {mostrarForm && (
        <Card className="mb-6 p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Nueva categoría</h3>
          <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
            <div className="min-w-[180px] flex-1">
              <Input
                id="categoria-nombre"
                label="Nombre *"
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="ej: Abarrotes"
                required
              />
            </div>
            <div className="min-w-[180px] flex-1">
              <Input
                id="categoria-descripcion"
                label="Descripción"
                type="text"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Descripción opcional"
              />
            </div>
            <Button type="submit" disabled={cargando}>{cargando ? 'Guardando...' : 'Guardar'}</Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categorias.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
            <Tag className="h-8 w-8 text-indigo-500" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900">{c.nombre}</p>
              <p className="truncate text-xs text-slate-400">{c.descripcion || 'Sin descripción'}</p>
            </div>
            <button onClick={() => eliminar(c.id)} className="rounded-md bg-red-100 p-2 text-red-600" title="Eliminar categoría">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {categorias.length === 0 && (
          <p className="col-span-full py-10 text-center text-slate-400">No hay categorías aún. Crea la primera para organizar tus productos.</p>
        )}
      </div>
    </div>
  );
};

export default Categorias;
