import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const categorias = ['Alquiler', 'Servicios', 'Salarios', 'Transporte', 'Marketing', 'Suministros', 'Otros'];

const Gastos = () => {
  const [gastos, setGastos] = useState([]);
  const [form, setForm] = useState({ categoria: '', descripcion: '', monto: '' });
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    const { data } = await api.get('/gastos');
    setGastos(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/gastos', form);
      toast.success('Gasto registrado');
      setForm({ categoria: '', descripcion: '', monto: '' });
      setMostrarForm(false);
      cargar();
    } catch {
      toast.error('Error al registrar gasto');
    }
  };

  const totalGastos = gastos.reduce((sum, g) => sum + parseFloat(g.monto), 0);

  return (
    <div className="flex-1 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Gastos</h1>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white" onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? 'Cancelar' : '+ Nuevo gasto'}
        </button>
      </div>

      <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
        Total gastos: <strong className="text-red-600">S/ {totalGastos.toFixed(2)}</strong>
      </div>

      {mostrarForm && (
        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Registrar gasto</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col">
              <label className="mb-1 text-xs font-semibold text-slate-700">Categoría</label>
              <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} required>
                <option value="">Seleccionar</option>
                {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-xs font-semibold text-slate-700">Descripción</label>
              <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-xs font-semibold text-slate-700">Monto</label>
              <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" type="number" step="0.01" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} required />
            </div>
            <button className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white" type="submit">Guardar</button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Categoría</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Descripción</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Monto</th>
            </tr>
          </thead>
          <tbody>
            {gastos.map((g) => (
              <tr key={g.id} className="border-t border-slate-100">
                <td className="px-4 py-3 text-sm text-slate-700">{new Date(g.fecha).toLocaleDateString('es-PE')}</td>
                <td className="px-4 py-3 text-sm"><span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">{g.categoria}</span></td>
                <td className="px-4 py-3 text-sm text-slate-700">{g.descripcion || '—'}</td>
                <td className="px-4 py-3 text-sm"><strong className="text-red-600">S/ {parseFloat(g.monto).toFixed(2)}</strong></td>
              </tr>
            ))}
            {gastos.length === 0 && (
              <tr><td colSpan="4" className="px-4 py-8 text-center text-sm text-slate-400">No hay gastos aún</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Gastos;
