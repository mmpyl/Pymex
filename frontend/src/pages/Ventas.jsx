import { useEffect, useState } from 'react';
import api from '../api/axios';

const fmt = (n) => new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState([{ producto_id: '', cantidad: 1, precio_unitario: 0 }]);
  const [metodo_pago, setMetodoPago] = useState('efectivo');
  const [cliente_id, setClienteId] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [v, p, c] = await Promise.all([api.get('/ventas'), api.get('/productos'), api.get('/clientes')]);
    setVentas(v.data);
    setProductos(p.data);
    setClientes(c.data);
  };

  const showNotice = (msg, type = 'success') => {
    setNotice({ msg, type });
    setTimeout(() => setNotice(null), 3000);
  };

  const total = items.reduce((s, i) => s + (i.cantidad * parseFloat(i.precio_unitario || 0)), 0);

  const handleProductoChange = (idx, pid) => {
    const p = productos.find((x) => x.id === parseInt(pid));
    const next = [...items];
    next[idx] = { producto_id: pid, cantidad: 1, precio_unitario: p?.precio_venta || 0 };
    setItems(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.some((i) => !i.producto_id)) {
      showNotice('Selecciona producto en todos los ítems', 'danger');
      return;
    }

    setLoading(true);
    try {
      await api.post('/ventas', {
        cliente_id: cliente_id || null,
        metodo_pago,
        items: items.map((i) => ({
          producto_id: parseInt(i.producto_id),
          cantidad: Number(i.cantidad),
          precio_unitario: parseFloat(i.precio_unitario),
        })),
      });
      showNotice('Venta registrada exitosamente');
      setShowForm(false);
      setItems([{ producto_id: '', cantidad: 1, precio_unitario: 0 }]);
      setClienteId('');
      setMetodoPago('efectivo');
      load();
    } catch (err) {
      showNotice(err.response?.data?.error || 'Error al registrar venta', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const filtered = ventas.filter((v) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return v.Cliente?.nombre?.toLowerCase().includes(q) || String(v.id).includes(q) || v.metodo_pago?.toLowerCase().includes(q);
  });

  const totalMes = ventas
    .filter((v) => new Date(v.fecha).getMonth() === new Date().getMonth())
    .reduce((s, v) => s + parseFloat(v.total || 0), 0);

  const METODOS = ['efectivo', 'tarjeta', 'transferencia', 'yape'];

  return (
    <div className="mx-auto max-w-[1100px] space-y-4 p-4">
      {notice && (
        <div className={`fixed right-5 top-4 z-50 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-lg ${notice.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          {notice.msg}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ventas</h1>
          <p className="text-sm text-slate-500">{ventas.length} ventas · S/ {fmt(totalMes)} este mes</p>
        </div>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancelar' : '+ Nueva venta'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Registrar venta</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col">
                <label className="mb-1 text-xs font-semibold text-slate-700">Cliente (opcional)</label>
                <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={cliente_id} onChange={(e) => setClienteId(e.target.value)}>
                  <option value="">Consumidor final</option>
                  {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}{c.documento ? ` — ${c.documento}` : ''}</option>)}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-xs font-semibold text-slate-700">Método de pago</label>
                <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={metodo_pago} onChange={(e) => setMetodoPago(e.target.value)}>
                  {METODOS.map((m) => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Productos</label>
                <button type="button" className="rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600" onClick={() => setItems([...items, { producto_id: '', cantidad: 1, precio_unitario: 0 }])}>
                  + Agregar
                </button>
              </div>

              <div className="space-y-2">
                {items.map((item, idx) => {
                  const prod = productos.find((p) => p.id === parseInt(item.producto_id));
                  return (
                    <div key={idx} className="grid grid-cols-1 gap-2 rounded-lg bg-slate-50 p-3 md:grid-cols-[2fr_90px_120px_80px_auto] md:items-center">
                      <select
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                        value={item.producto_id}
                        onChange={(e) => handleProductoChange(idx, e.target.value)}
                        required
                      >
                        <option value="">Seleccionar producto</option>
                        {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre} (stock: {p.stock})</option>)}
                      </select>
                      <input
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) => {
                          const next = [...items];
                          next[idx].cantidad = Math.max(1, parseInt(e.target.value) || 1);
                          setItems(next);
                        }}
                      />
                      <div className="text-right text-sm font-semibold">S/ {fmt(item.cantidad * parseFloat(item.precio_unitario || 0))}</div>
                      <div className="text-xs text-slate-500">{prod ? `S/ ${fmt(item.precio_unitario)} c/u` : ''}</div>
                      <button
                        type="button"
                        onClick={() => setItems(items.filter((_, i) => i !== idx))}
                        disabled={items.length === 1}
                        className="rounded-md bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50"
                      >
                        Quitar
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Total a cobrar</p>
                <p className="text-2xl font-bold text-indigo-900">S/ {fmt(total)}</p>
              </div>
              <button type="submit" className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white disabled:opacity-70" disabled={loading}>
                {loading ? 'Registrando...' : 'Registrar venta'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-xl bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="text-sm font-semibold text-slate-800">Historial de ventas</div>
          <input className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Buscar venta..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <Th>#</Th><Th>Fecha</Th><Th>Cliente</Th><Th>Método</Th><Th className="text-right">Total</Th><Th>Estado</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">{search ? `No hay resultados para "${search}"` : 'No hay ventas registradas'}</td></tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id} className="border-t border-slate-100">
                    <Td><span className="font-mono text-xs text-slate-500">#{v.id}</span></Td>
                    <Td>{new Date(v.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}</Td>
                    <Td><span className="font-medium">{v.Cliente?.nombre || '—'}</span></Td>
                    <Td><MetodoBadge metodo={v.metodo_pago} /></Td>
                    <Td className="text-right font-mono font-bold text-indigo-700">S/ {fmt(v.total)}</Td>
                    <Td><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{v.estado}</span></Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetodoBadge({ metodo }) {
  const styles = {
    efectivo: 'bg-emerald-100 text-emerald-700',
    tarjeta: 'bg-indigo-100 text-indigo-700',
    transferencia: 'bg-amber-100 text-amber-700',
    yape: 'bg-violet-100 text-violet-700',
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[metodo] || 'bg-slate-100 text-slate-700'}`}>{metodo}</span>;
}

const Th = ({ children, className = '' }) => <th className={`px-4 py-3 text-left text-xs font-semibold text-slate-700 ${className}`}>{children}</th>;
const Td = ({ children, className = '' }) => <td className={`px-4 py-3 text-sm text-slate-700 ${className}`}>{children}</td>;
