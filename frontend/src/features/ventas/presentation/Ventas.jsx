/**
 * Ventas Presentation Component
 */

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ventasService } from '../application/service.js';
import { Venta } from '../domain/entities.js';

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
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await ventasService.loadVentasData();
      setVentas(data.ventas);
      setProductos(data.productos);
      setClientes(data.clientes);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar datos de ventas');
    }
  };

  const total = ventasService.calcularTotal(items);

  const handleProductoChange = (idx, pid) => {
    const p = productos.find((x) => x.id === parseInt(pid));
    const next = [...items];
    next[idx] = { producto_id: pid, cantidad: 1, precio_unitario: p?.precio_venta || 0 };
    setItems(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.some((i) => !i.producto_id)) {
      toast.error('Selecciona producto en todos los ítems');
      return;
    }

    setLoading(true);
    try {
      await ventasService.registrarVenta({
        cliente_id,
        metodo_pago,
        items,
      });
      toast.success('Venta registrada exitosamente');
      setShowForm(false);
      setItems([{ producto_id: '', cantidad: 1, precio_unitario: 0 }]);
      setClienteId('');
      setMetodoPago('efectivo');
      load();
    } catch (err) {
      toast.error(err.message || 'Error al registrar venta');
    } finally {
      setLoading(false);
    }
  };

  const filtered = ventasService.filtrarVentas(ventas, search);
  const totalMes = ventasService.calcularTotalMes(ventas);
  const METODOS = Venta.METODOS_PAGO;

  return (
    <div className="mx-auto max-w-[1100px] space-y-4 p-4">
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
                  {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombreCompleto}</option>)}
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
