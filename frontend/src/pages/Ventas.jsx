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

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [items, setItems] = useState([{ producto_id: '', cantidad: 1, precio_unitario: 0 }]);
  const [metodo_pago, setMetodoPago] = useState('efectivo');
  const [cliente_id, setClienteId] = useState('');
  const [notas, setNotas] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    const [v, p, c] = await Promise.all([
      api.get('/ventas'),
      api.get('/productos'),
      api.get('/clientes')
    ]);
    setVentas(v.data);
    setProductos(p.data);
    setClientes(c.data);
  };

  const handleProductoChange = (index, producto_id) => {
    const producto = productos.find(p => p.id === parseInt(producto_id));
    const nuevosItems = [...items];
    nuevosItems[index] = {
      producto_id,
      cantidad: 1,
      precio_unitario: producto?.precio_venta || 0
    };
    setItems(nuevosItems);
  };

  const handleCantidadChange = (index, cantidad) => {
    const nuevosItems = [...items];
    nuevosItems[index] = { ...nuevosItems[index], cantidad: Math.max(1, parseInt(cantidad) || 1) };
    setItems(nuevosItems);
  };

  const agregarItem = () => setItems([...items, { producto_id: '', cantidad: 1, precio_unitario: 0 }]);
  const eliminarItem = (index) => setItems(items.filter((_, i) => i !== index));

  const total = items.reduce(
    (sum, i) => sum + (i.cantidad * parseFloat(i.precio_unitario || 0)), 0
  );

  const resetForm = () => {
    setItems([{ producto_id: '', cantidad: 1, precio_unitario: 0 }]);
    setMetodoPago('efectivo');
    setClienteId('');
    setNotas('');
    setMostrarForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const itemsInvalidos = items.filter(i => !i.producto_id);
    if (itemsInvalidos.length) {
      toast.error('Selecciona un producto en todos los ítems');
      return;
    }
    setCargando(true);
    try {
      await api.post('/ventas', {
        cliente_id: cliente_id || null,
        metodo_pago,
        notas: notas || null,
        items: items.map(i => ({
          producto_id: parseInt(i.producto_id),
          cantidad: i.cantidad,
          precio_unitario: parseFloat(i.precio_unitario)
        }))
      });
      toast.success('Venta registrada exitosamente');
      resetForm();
      cargar();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al registrar venta');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.container}>
      <PageHeader title="Ventas" subtitle={`${ventas.length} venta${ventas.length !== 1 ? 's' : ''} registrada${ventas.length !== 1 ? 's' : ''}`} />

      <Button onClick={() => { resetForm(); setMostrarForm(!mostrarForm); }} className="mb-6">
        <Plus className="w-4 h-4 mr-2" />
        {mostrarForm ? 'Cancelar' : 'Nueva venta'}
      </Button>

      {mostrarForm && (
        <Card className="p-6 mb-6">
          <h3 style={styles.formTitulo}>Registrar venta</h3>

          <div style={{ marginBottom: 16 }}>
            <label style={styles.label}>Cliente (opcional)</label>
            <select style={styles.select} value={cliente_id} onChange={e => setClienteId(e.target.value)}>
              <option value="">Consumidor final</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nombre}{c.documento ? ` — ${c.documento}` : ''}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSubmit}>
            {items.map((item, index) => {
              const prodSeleccionado = productos.find(p => p.id === parseInt(item.producto_id));
              return (
                <div key={index} style={styles.itemRow}>
                  <select
                    style={styles.select}
                    value={item.producto_id}
                    onChange={e => handleProductoChange(index, e.target.value)}
                    required
                  >
                    <option value="">Seleccionar producto</option>
                    {productos.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} — S/ {parseFloat(p.precio_venta).toFixed(2)} (stock: {p.stock})
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={e => handleCantidadChange(index, e.target.value)}
                  />
                  <span style={styles.subtotal}>S/ {(item.cantidad * parseFloat(item.precio_unitario || 0)).toFixed(2)}</span>
                  {items.length > 1 && (
                    <button type="button" onClick={() => eliminarItem(index)} style={styles.btnQuitar}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}

            <Button type="button" variant="outline" onClick={agregarItem} className="mt-2">
              <Plus className="w-4 h-4 mr-2" />
              Agregar producto
            </Button>

            <div style={styles.totalRow}>
              <div>
                <label style={styles.label}>Método de pago</label>
                <select style={styles.select} value={metodo_pago} onChange={e => setMetodoPago(e.target.value)}>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="yape">Yape/Plin</option>
                </select>
              </div>
              <span style={styles.totalLabel}>Total: S/ {total.toFixed(2)}</span>
              <Button type="submit" disabled={cargando}>
                {cargando ? 'Registrando...' : 'Registrar venta'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div style={styles.tabla}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Fecha</th>
              <th style={styles.th}>Cliente</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Método</th>
              <th style={styles.th}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map(v => (
              <tr key={v.id} style={styles.tr}>
                <td style={styles.td}>{v.id}</td>
                <td style={styles.td}>{new Date(v.fecha).toLocaleDateString('es-PE')}</td>
                <td style={styles.td}>{v.Cliente?.nombre || '—'}</td>
                <td style={styles.td}><strong>S/ {parseFloat(v.total).toFixed(2)}</strong></td>
                <td style={styles.td}>{v.metodo_pago}</td>
                <td style={styles.td}>
                  <span style={styles.badge}>{v.estado}</span>
                </td>
              </tr>
            ))}
            {ventas.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                  No hay ventas aún
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ventas;
