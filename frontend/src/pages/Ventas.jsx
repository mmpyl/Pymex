// pages/Ventas.jsx — Rediseñado
import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { Plus, Trash2, Package } from 'lucide-react';

const styles = {
  container: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  titulo: { fontSize: '24px', fontWeight: '700', color: '#1e293b' },
  formCard: { ...Card.style, marginBottom: '24px', padding: '20px' },
  formTitulo: { fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1e293b' },
  label: { display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#475569' },
  itemRow: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '12px', marginBottom: '12px', alignItems: 'center' },
  select: { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' },
  inputNum: { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' },
  subtotal: { fontSize: '14px', fontWeight: '600', color: '#1e293b' },
  btnQuitar: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px' },
  btnSecundario: { padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' },
  totalLabel: { fontSize: '16px', fontWeight: '700', color: '#1e293b' },
  tabla: { overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f8fafc' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#64748b', borderBottom: '1px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #e2e8f0' },
  td: { padding: '12px 16px', fontSize: '14px', color: '#334155' },
  badge: { padding: '4px 8px', borderRadius: '999px', fontSize: '12px', fontWeight: '500', background: '#dcfce7', color: '#166534' }
};

const fmt = n => new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState([{ producto_id: '', cantidad: 1, precio_unitario: 0 }]);
  const [metodo_pago, setMetodoPago] = useState('efectivo');
  const [cliente_id, setClienteId] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [v, p, c] = await Promise.all([
      api.get('/ventas'),
      api.get('/productos'),
      api.get('/clientes'),
    ]);
    setVentas(v.data);
    setProductos(p.data);
    setClientes(c.data);
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const total = items.reduce((s, i) => s + (i.cantidad * parseFloat(i.precio_unitario || 0)), 0);

  const handleProductoChange = (idx, pid) => {
    const p = productos.find(x => x.id === parseInt(pid));
    const next = [...items];
    next[idx] = { producto_id: pid, cantidad: 1, precio_unitario: p?.precio_venta || 0 };
    setItems(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.some(i => !i.producto_id)) { showToast('Selecciona producto en todos los ítems', 'danger'); return; }
    setLoading(true);
    try {
      await api.post('/ventas', {
        cliente_id: cliente_id || null,
        metodo_pago,
        items: items.map(i => ({
          producto_id: parseInt(i.producto_id),
          cantidad: Number(i.cantidad),
          precio_unitario: parseFloat(i.precio_unitario),
        })),
      });
      showToast('Venta registrada exitosamente');
      setShowForm(false);
      setItems([{ producto_id: '', cantidad: 1, precio_unitario: 0 }]);
      setClienteId('');
      setMetodoPago('efectivo');
      load();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error al registrar venta', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const filtered = ventas.filter(v => {
    if (!search) return true;
    const q = search.toLowerCase();
    return v.Cliente?.nombre?.toLowerCase().includes(q) ||
      String(v.id).includes(q) ||
      v.metodo_pago?.toLowerCase().includes(q);
  });

  const totalMes = ventas
    .filter(v => new Date(v.fecha).getMonth() === new Date().getMonth())
    .reduce((s, v) => s + parseFloat(v.total || 0), 0);

  const METODOS = ['efectivo', 'tarjeta', 'transferencia', 'yape'];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 16, right: 20, zIndex: 200,
          padding: '12px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          background: toast.type === 'success' ? 'var(--sage-600)' : 'var(--coral-500)',
          color: 'white', boxShadow: 'var(--shadow-lg)',
          animation: 'fade-in 0.2s',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-heading">Ventas</h1>
          <p className="page-desc">{ventas.length} ventas · S/ {fmt(totalMes)} este mes</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <><CloseIcon /> Cancelar</>
          ) : (
            <><PlusIcon /> Nueva venta</>
          )}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{ padding: '24px', marginBottom: 20, animation: 'fade-in 0.2s' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.3px', margin: '0 0 20px' }}>
            Registrar venta
          </h3>

          <form onSubmit={handleSubmit}>
            {/* Cliente & Método */}
            <div className="form-grid form-grid-2" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Cliente (opcional)</label>
                <select className="form-select" value={cliente_id} onChange={e => setClienteId(e.target.value)}>
                  <option value="">Consumidor final</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}{c.documento ? ` — ${c.documento}` : ''}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Método de pago</label>
                <select className="form-select" value={metodo_pago} onChange={e => setMetodoPago(e.target.value)}>
                  {METODOS.map(m => (
                    <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Items */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label className="form-label" style={{ margin: 0 }}>Productos</label>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setItems([...items, { producto_id: '', cantidad: 1, precio_unitario: 0 }])}>
                  <PlusIcon /> Agregar
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map((item, idx) => {
                  const prod = productos.find(p => p.id === parseInt(item.producto_id));
                  return (
                    <div key={idx} style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 100px 130px 90px auto',
                      gap: 8, alignItems: 'center',
                      padding: '10px 12px',
                      background: 'hsl(var(--muted))',
                      borderRadius: 8,
                    }}>
                      <select
                        className="form-select"
                        value={item.producto_id}
                        onChange={e => handleProductoChange(idx, e.target.value)}
                        required
                        style={{ background: 'hsl(var(--background))' }}
                      >
                        <option value="">Seleccionar producto</option>
                        {productos.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} (stock: {p.stock})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number" min="1"
                        className="form-input"
                        value={item.cantidad}
                        onChange={e => {
                          const next = [...items];
                          next[idx].cantidad = Math.max(1, parseInt(e.target.value) || 1);
                          setItems(next);
                        }}
                        style={{ background: 'hsl(var(--background))' }}
                      />
                      <div style={{ fontSize: 13, fontWeight: 600, textAlign: 'right', paddingRight: 4 }}>
                        S/ {fmt(item.cantidad * parseFloat(item.precio_unitario || 0))}
                      </div>
                      {prod && (
                        <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>
                          S/ {fmt(item.precio_unitario)} c/u
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setItems(items.filter((_, i) => i !== idx))}
                        disabled={items.length === 1}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--coral-500)', padding: 4 }}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total + Submit */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', background: 'var(--navy-50)',
              borderRadius: 8, border: '1px solid var(--navy-100)',
            }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--navy-600)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Total a cobrar
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--navy-800)', letterSpacing: '-0.5px' }}>
                  S/ {fmt(total)}
                </div>
              </div>
              <button type="submit" className="btn btn-accent" disabled={loading} style={{ height: 44, padding: '0 28px', fontSize: 15 }}>
                {loading ? 'Registrando...' : 'Registrar venta'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="table-wrapper">
        <div className="table-header">
          <div className="table-title">Historial de ventas</div>
          <div className="table-actions">
            <div className="search-wrapper">
              <svg className="search-icon" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="6.5" cy="6.5" r="4.5"/><path d="M10.5 10.5l3 3"/>
              </svg>
              <input
                className="search-input"
                placeholder="Buscar venta..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Método</th>
              <th style={{ textAlign: 'right' }}>Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="table-empty">
                    <div className="table-empty-icon">🧾</div>
                    <div className="table-empty-title">Sin ventas{search ? ' encontradas' : ' registradas'}</div>
                    <div className="table-empty-desc">
                      {search ? `No hay resultados para "${search}"` : 'Registra tu primera venta'}
                    </div>
                  </div>
                </td>
              </tr>
            ) : filtered.map(v => (
              <tr key={v.id}>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>
                    #{v.id}
                  </span>
                </td>
                <td style={{ color: 'hsl(var(--muted-foreground))', fontSize: 13 }}>
                  {new Date(v.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td>
                  <span style={{ fontWeight: 500 }}>{v.Cliente?.nombre || '—'}</span>
                </td>
                <td>
                  <MetodoBadge metodo={v.metodo_pago} />
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--navy-700)' }}>
                  S/ {fmt(v.total)}
                </td>
                <td>
                  <span className="badge badge-success">{v.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const METODO_COLORS = {
  efectivo:     { bg: 'var(--sage-50)',   color: 'var(--sage-700)',   label: 'Efectivo' },
  tarjeta:      { bg: 'var(--navy-50)',   color: 'var(--navy-600)',   label: 'Tarjeta' },
  transferencia:{ bg: 'var(--amber-50)',  color: 'var(--amber-700)',  label: 'Transferencia' },
  yape:         { bg: 'rgba(111,48,167,0.08)', color: '#6F30A7', label: 'Yape/Plin' },
};

function MetodoBadge({ metodo }) {
  const cfg = METODO_COLORS[metodo] || { bg: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))', label: metodo };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
      background: cfg.bg, color: cfg.color,
    }}>
      {cfg.label}
    </span>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M7 1v12M1 7h12"/>
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 1l12 12M13 1L1 13"/>
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h10M5 3V2a1 1 0 011-1h2a1 1 0 011 1v1M6 6v4M8 6v4"/>
      <path d="M3 3l.7 8.3A1 1 0 004.7 12h4.6a1 1 0 001-.7L11 3"/>
    </svg>
  );
}