import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Inventario = () => {
  const [productos, setProductos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [vista, setVista] = useState('stock');
  const [form, setForm] = useState({ producto_id: '', tipo: 'entrada', cantidad: 1, motivo: '' });
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    const [p, h] = await Promise.all([api.get('/inventario'), api.get('/inventario/historial')]);
    setProductos(p.data);
    setHistorial(h.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/inventario/movimiento', form);
      toast.success(`Movimiento registrado. Stock actual: ${data.stock_actual}`);
      setForm({ producto_id: '', tipo: 'entrada', cantidad: 1, motivo: '' });
      setMostrarForm(false);
      cargar();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al registrar movimiento');
    }
  };

  const productosBajoStock = productos.filter((p) => p.stock <= p.stock_minimo);
  const movimientosHoy = historial.filter((m) => new Date(m.fecha).toDateString() === new Date().toDateString()).length;

  return (
    <div className="flex-1 space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Inventario</h1>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white" onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? 'Cancelar' : '+ Registrar movimiento'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: 'Total productos', valor: productos.length, color: 'text-indigo-700', border: 'border-indigo-500', icono: '📦' },
          { label: 'Stock bajo', valor: productosBajoStock.length, color: 'text-red-700', border: 'border-red-500', icono: '⚠️' },
          { label: 'Movimientos hoy', valor: movimientosHoy, color: 'text-emerald-700', border: 'border-emerald-500', icono: '🔄' },
        ].map((k) => (
          <div key={k.label} className={`flex items-center gap-3 rounded-xl border-l-4 bg-white p-4 shadow-sm ${k.border}`}>
            <span className="text-2xl">{k.icono}</span>
            <div>
              <p className="text-xs text-slate-500">{k.label}</p>
              <p className={`text-2xl font-bold ${k.color}`}>{k.valor}</p>
            </div>
          </div>
        ))}
      </div>

      {mostrarForm && (
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Registrar movimiento de inventario</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="flex flex-col">
              <label className="mb-1 text-xs font-semibold text-slate-700">Producto</label>
              <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.producto_id} onChange={(e) => setForm({ ...form, producto_id: e.target.value })} required>
                <option value="">Seleccionar producto</option>
                {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stock})</option>)}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-xs font-semibold text-slate-700">Tipo</label>
              <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
                <option value="ajuste">Ajuste</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-xs font-semibold text-slate-700">Cantidad</label>
              <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" type="number" min="1" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} required />
            </div>
            <div className="flex flex-col xl:col-span-2">
              <label className="mb-1 text-xs font-semibold text-slate-700">Motivo</label>
              <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" type="text" value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} placeholder="Compra, ajuste, etc." />
            </div>
            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white xl:col-start-5" type="submit">Registrar</button>
          </form>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {[['stock', 'Stock actual'], ['historial', 'Historial'], ['stock-bajo', `Stock bajo (${productosBajoStock.length})`]].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setVista(key)}
            className={`rounded-md px-4 py-2 text-sm font-semibold ${vista === key ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {vista === 'stock' && (
        <TableShell>
          <thead className="bg-slate-50">
            <tr>
              <Th>Producto</Th><Th>Stock actual</Th><Th>Stock mínimo</Th><Th>P. Compra</Th><Th>P. Venta</Th><Th>Estado</Th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <Td>{p.nombre}</Td>
                <Td><span className={p.stock <= p.stock_minimo ? 'font-bold text-red-600' : 'font-bold text-emerald-600'}>{p.stock}</span></Td>
                <Td>{p.stock_minimo}</Td>
                <Td>S/ {parseFloat(p.precio_compra).toFixed(2)}</Td>
                <Td>S/ {parseFloat(p.precio_venta).toFixed(2)}</Td>
                <Td>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.stock <= p.stock_minimo ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {p.stock <= p.stock_minimo ? '⚠️ Bajo' : '✅ OK'}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}

      {vista === 'historial' && (
        <TableShell>
          <thead className="bg-slate-50">
            <tr><Th>Fecha</Th><Th>Producto</Th><Th>Tipo</Th><Th>Cantidad</Th><Th>Motivo</Th></tr>
          </thead>
          <tbody>
            {historial.map((m) => (
              <tr key={m.id} className="border-t border-slate-100">
                <Td>{new Date(m.fecha).toLocaleDateString('es-PE')}</Td>
                <Td>{m.Producto?.nombre}</Td>
                <Td>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${m.tipo === 'entrada' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{m.tipo}</span>
                </Td>
                <Td>{m.cantidad}</Td>
                <Td>{m.motivo || '—'}</Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}

      {vista === 'stock-bajo' && (
        <div className="rounded-xl bg-white shadow-sm">
          {productosBajoStock.length === 0 ? (
            <p className="p-10 text-center text-emerald-600">✅ Todos los productos tienen stock suficiente</p>
          ) : (
            <TableShell>
              <thead className="bg-slate-50"><tr><Th>Producto</Th><Th>Stock actual</Th><Th>Stock mínimo</Th><Th>Diferencia</Th></tr></thead>
              <tbody>
                {productosBajoStock.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100">
                    <Td>{p.nombre}</Td>
                    <Td><strong className="text-red-600">{p.stock}</strong></Td>
                    <Td>{p.stock_minimo}</Td>
                    <Td><span className="font-bold text-red-600">-{p.stock_minimo - p.stock}</span></Td>
                  </tr>
                ))}
              </tbody>
            </TableShell>
          )}
        </div>
      )}
    </div>
  );
};

const TableShell = ({ children }) => <div className="overflow-x-auto rounded-xl bg-white shadow-sm"><table className="w-full border-collapse">{children}</table></div>;
const Th = ({ children }) => <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">{children}</th>;
const Td = ({ children }) => <td className="px-4 py-3 text-sm text-slate-700">{children}</td>;

export default Inventario;
