// frontend/src/pages/Ventas.jsx — versión consolidada (sin conflictos de merge)
// Combina:
//   - Selector de cliente (rama main)
//   - Método pago Yape/Plin añadido (rama main)
//   - Columna cliente en tabla (rama main)
//   - Stock visible al seleccionar producto (mejora UX)
import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Ventas = () => {


    const [ventas, setVentas] = useState([]);
    const [productos, setProductos] = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [items, setItems] = useState([{ producto_id: '', cantidad: 1, precio_unitario: 0 }]);
    const [metodo_pago, setMetodoPago] = useState('efectivo');
    const [clientes, setClientes] = useState([]);
    const [cliente_id, setClienteId] = useState('');

    useEffect(() => { cargar(); }, []);

    
    // Agrega en useEffect:

    const [ventas, setVentas]       = useState([]);
    const [productos, setProductos] = useState([]);
    const [clientes, setClientes]   = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [items, setItems] = useState([{ producto_id: '', cantidad: 1, precio_unitario: 0 }]);
    const [metodo_pago, setMetodoPago] = useState('efectivo');
    const [cliente_id, setClienteId]   = useState('');

  const [ventas,      setVentas]      = useState([]);
  const [productos,   setProductos]   = useState([]);
  const [clientes,    setClientes]    = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [items,       setItems]       = useState([{ producto_id: '', cantidad: 1, precio_unitario: 0 }]);
  const [metodo_pago, setMetodoPago]  = useState('efectivo');
  const [cliente_id,  setClienteId]   = useState('');
  const [notas,       setNotas]       = useState('');
  const [cargando,    setCargando]    = useState(false);


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
    const producto    = productos.find(p => p.id === parseInt(producto_id));
    const nuevosItems = [...items];
    nuevosItems[index] = {
      producto_id,
      cantidad:        1,
      precio_unitario: producto?.precio_venta || 0

    };
    setItems(nuevosItems);
  };


    const handleProductoChange = (index, producto_id) => {

        const producto = productos.find((p) => p.id === parseInt(producto_id));

        const producto = productos.find(p => p.id === parseInt(producto_id));

        const nuevosItems = [...items];
        nuevosItems[index] = { producto_id, cantidad: 1, precio_unitario: producto?.precio_venta || 0 };
        setItems(nuevosItems);
    };

  const handleCantidadChange = (index, cantidad) => {
    const nuevosItems = [...items];
    nuevosItems[index] = { ...nuevosItems[index], cantidad: Math.max(1, parseInt(cantidad) || 1) };
    setItems(nuevosItems);
  };


  const agregarItem  = () => setItems([...items, { producto_id: '', cantidad: 1, precio_unitario: 0 }]);
  const eliminarItem = (index) => setItems(items.filter((_, i) => i !== index));


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
        try {

            await api.post('/ventas', { metodo_pago, items });
            toast.success('Venta registrada');
            setMostrarForm(false);
            setItems([{ producto_id: '', cantidad: 1, precio_unitario: 0 }]);

            await api.post('/ventas', {
                cliente_id: cliente_id || null,
                metodo_pago,
                items
            });
            toast.success('Venta registrada');
            setMostrarForm(false);
            setItems([{ producto_id: '', cantidad: 1, precio_unitario: 0 }]);
            setClienteId('');

            cargar();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al registrar venta');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.titulo}>Ventas</h1>
                <button style={styles.btnPrimario} onClick={() => setMostrarForm(!mostrarForm)}>
                    {mostrarForm ? 'Cancelar' : '+ Nueva venta'}
                </button>
            </div>

            {mostrarForm && (
                <div style={styles.formCard}>
                    <h3 style={styles.formTitulo}>Nueva venta</h3>

                    <form onSubmit={handleSubmit}>
                        {items.map((item, index) => (
                            <div key={index} style={styles.itemRow}>
                                <select style={styles.select} value={item.producto_id} onChange={(e) => handleProductoChange(index, e.target.value)} required>
                                    <option value="">Seleccionar producto</option>
                                    {productos.map((p) => (
                                        <option key={p.id} value={p.id}>{p.nombre} - S/ {parseFloat(p.precio_venta).toFixed(2)}</option>
                                    ))}
                                </select>
                                <input style={styles.inputNum} type="number" min="1" value={item.cantidad} onChange={(e) => handleCantidadChange(index, e.target.value)} />
                                <span style={styles.subtotal}>S/ {(item.cantidad * parseFloat(item.precio_unitario || 0)).toFixed(2)}</span>
                                {items.length > 1 && <button type="button" onClick={() => eliminarItem(index)} style={styles.btnQuitar}>✕</button>}
                            </div>
                        ))}

                        <button type="button" onClick={agregarItem} style={styles.btnSecundario}>+ Agregar producto</button>

                        <div style={styles.totalRow}>
                            <span>Método de pago:</span>
                            <select style={styles.select} value={metodo_pago} onChange={(e) => setMetodoPago(e.target.value)}>
                                <option value="efectivo">Efectivo</option>
                                <option value="tarjeta">Tarjeta</option>
                                <option value="transferencia">Transferencia</option>
                            </select>
                            <span style={styles.totalLabel}>Total: <strong>S/ {total.toFixed(2)}</strong></span>
                            <button style={styles.btnPrimario} type="submit">Registrar venta</button>


                    {/* Selector de cliente */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={styles.labelCliente}>Cliente (opcional)</label>
                        <select style={styles.selectCliente} value={cliente_id}
                            onChange={e => setClienteId(e.target.value)}>
                            <option value="">Consumidor final / Sin cliente</option>
                            {clientes.map(c => (
                                <option key={c.id} value={c.id}>{c.nombre} {c.documento ? `— ${c.documento}` : ''}</option>
                            ))}
                        </select>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {items.map((item, index) => (
                            <div key={index} style={styles.itemRow}>
                                <select style={styles.select} value={item.producto_id}
                                    onChange={e => handleProductoChange(index, e.target.value)} required>
                                    <option value="">Seleccionar producto</option>
                                    {productos.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.nombre} — S/ {parseFloat(p.precio_venta).toFixed(2)} (stock: {p.stock})
                                        </option>
                                    ))}
                                </select>
                                <input style={styles.inputNum} type="number" min="1"
                                    value={item.cantidad}
                                    onChange={e => handleCantidadChange(index, e.target.value)} />
                                <span style={styles.subtotal}>
                                    S/ {(item.cantidad * parseFloat(item.precio_unitario || 0)).toFixed(2)}
                                </span>
                                {items.length > 1 && (
                                    <button type="button" onClick={() => eliminarItem(index)} style={styles.btnQuitar}>✕</button>
                                )}
                            </div>
                        ))}

                        <button type="button" onClick={agregarItem} style={styles.btnSecundario}>
                            + Agregar producto
                        </button>

                        <div style={styles.totalRow}>
                            <span>Método de pago:</span>
                            <select style={styles.select} value={metodo_pago}
                                onChange={e => setMetodoPago(e.target.value)}>
                                <option value="efectivo">Efectivo</option>
                                <option value="tarjeta">Tarjeta</option>
                                <option value="transferencia">Transferencia</option>
                                <option value="yape">Yape/Plin</option>
                            </select>
                            <span style={styles.totalLabel}>
                                Total: <strong>S/ {total.toFixed(2)}</strong>
                            </span>
                            <button style={styles.btnPrimario} type="submit">
                                Registrar venta
                            </button>

                        </div>
                    </form>
                </div>
            )}

            <div style={styles.tabla}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.thead}>
                            <th style={styles.th}>#</th>
                            <th style={styles.th}>Fecha</th>


                            <th style={styles.th}>Cliente</th>

                            <th style={styles.th}>Total</th>
                            <th style={styles.th}>Método pago</th>
                            <th style={styles.th}>Estado</th>
                        </tr>
                    </thead>
                    <tbody>

                        {ventas.map((v) => (
                            <tr key={v.id} style={styles.tr}>
                                <td style={styles.td}>{v.id}</td>
                                <td style={styles.td}>{new Date(v.fecha).toLocaleDateString('es-PE')}</td>
                                <td style={styles.td}><strong>S/ {parseFloat(v.total).toFixed(2)}</strong></td>
                                <td style={styles.td}>{v.metodo_pago}</td>
                                <td style={styles.td}><span style={styles.badge}>{v.estado}</span></td>
                            </tr>
                        ))}
                        {ventas.length === 0 && (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No hay ventas aún</td></tr>

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
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                                No hay ventas aún
                            </td></tr>

                        )}
                    </tbody>
                </table>
            </div>

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
        notas:      notas || null,
        items:      items.map(i => ({
          producto_id:     parseInt(i.producto_id),
          cantidad:        i.cantidad,
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
      <div style={styles.header}>
        <div>
          <h1 style={styles.titulo}>Ventas</h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>{ventas.length} venta{ventas.length !== 1 ? 's' : ''} registrada{ventas.length !== 1 ? 's' : ''}</p>

        </div>
        <button style={styles.btnPrimario} onClick={() => { resetForm(); setMostrarForm(!mostrarForm); }}>
          {mostrarForm ? 'Cancelar' : '+ Nueva venta'}
        </button>
      </div>

      {/* Formulario de nueva venta */}
      {mostrarForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitulo}>Registrar venta</h3>

          {/* Cliente */}
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

          {/* Ítems */}
          <form onSubmit={handleSubmit}>
            {items.map((item, index) => {
              const prodSeleccionado = productos.find(p => p.id === parseInt(item.producto_id));
              return (
                <div key={index} style={styles.itemRow}>
                  <select
                    style={{ ...styles.select, flex: 2 }}
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

                  <input
                    style={{ ...styles.inputNum }}
                    type="number"
                    min="1"
                    max={prodSeleccionado?.stock || 9999}
                    value={item.cantidad}
                    onChange={e => handleCantidadChange(index, e.target.value)}
                    title="Cantidad"
                  />

                  <span style={styles.subtotal}>
                    S/ {(item.cantidad * parseFloat(item.precio_unitario || 0)).toFixed(2)}
                  </span>

                  {items.length > 1 && (
                    <button type="button" onClick={() => eliminarItem(index)} style={styles.btnQuitar}>✕</button>
                  )}
                </div>
              );
            })}

            <button type="button" onClick={agregarItem} style={styles.btnSecundario}>
              + Añadir producto
            </button>

            <div style={styles.totalRow}>
              <div style={styles.grupo}>
                <label style={styles.label}>Método de pago</label>
                <select style={styles.select} value={metodo_pago} onChange={e => setMetodoPago(e.target.value)}>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="yape">Yape / Plin</option>
                </select>
              </div>

              <div style={styles.grupo}>
                <label style={styles.label}>Notas (opcional)</label>
                <input
                  style={styles.inputText}
                  type="text"
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                  placeholder="Observaciones..."
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 20 }}>
                <span style={styles.totalLabel}>
                  Total: <strong style={{ color: '#4f46e5' }}>S/ {total.toFixed(2)}</strong>
                </span>
                <button
                  style={{ ...styles.btnPrimario, opacity: cargando ? 0.7 : 1 }}
                  type="submit"
                  disabled={cargando}
                >
                  {cargando ? 'Registrando...' : 'Registrar venta'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de ventas */}
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
                <td style={styles.td}>{v.Cliente?.nombre || <span style={{ color: '#94a3b8' }}>Consumidor final</span>}</td>
                <td style={styles.td}><strong>S/ {parseFloat(v.total).toFixed(2)}</strong></td>
                <td style={styles.td}>{v.metodo_pago}</td>
                <td style={styles.td}>
                  <span style={styles.badge}>{v.estado}</span>
                </td>
              </tr>
            ))}
            {ventas.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No hay ventas registradas aún
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


    container: { padding: '30px', flex: 1 },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    titulo: { fontSize: '24px', fontWeight: '700', color: '#1e1b4b' },
    btnPrimario: { padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    btnSecundario: { padding: '8px 16px', backgroundColor: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', marginTop: '10px' },
    btnQuitar: { padding: '6px 10px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    formCard: { backgroundColor: 'white', padding: '24px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' },
    formTitulo: { marginBottom: '16px', color: '#1e1b4b' },
    itemRow: { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' },
    select: { flex: 2, padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' },
    inputNum: { flex: 0.5, padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' },
    subtotal: { flex: 0.7, fontWeight: '600', color: '#4f46e5' },
    totalRow: { display: 'flex', gap: '16px', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap' },
    totalLabel: { fontSize: '18px', color: '#1e1b4b' },
    tabla: { backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: { backgroundColor: '#f8fafc' },
    th: { padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '13px' },
    tr: { borderBottom: '1px solid #f1f5f9' },
    td: { padding: '12px 16px', fontSize: '14px', color: '#374151' },
    badge: { padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', backgroundColor: '#dcfce7', color: '#16a34a' }

    container:      { padding: '30px', flex: 1 },
    header:         { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    titulo:         { fontSize: '24px', fontWeight: '700', color: '#1e1b4b' },
    btnPrimario:    { padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    btnSecundario:  { padding: '8px 16px', backgroundColor: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', marginTop: '10px' },
    btnQuitar:      { padding: '6px 10px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    formCard:       { backgroundColor: 'white', padding: '24px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' },
    formTitulo:     { marginBottom: '16px', color: '#1e1b4b' },
    labelCliente:   { display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151', fontSize: '13px' },
    selectCliente:  { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', marginBottom: '4px' },
    itemRow:        { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' },
    select:         { flex: 2, padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' },
    inputNum:       { flex: 0.5, padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' },
    subtotal:       { flex: 0.7, fontWeight: '600', color: '#4f46e5' },
    totalRow:       { display: 'flex', gap: '16px', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap' },
    totalLabel:     { fontSize: '18px', color: '#1e1b4b' },
    tabla:          { backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' },
    table:          { width: '100%', borderCollapse: 'collapse' },
    thead:          { backgroundColor: '#f8fafc' },
    th:             { padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '13px' },
    tr:             { borderBottom: '1px solid #f1f5f9' },
    td:             { padding: '12px 16px', fontSize: '14px', color: '#374151' },
    badge:          { padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', backgroundColor: '#dcfce7', color: '#16a34a' }


  container:   { padding: '30px', flex: 1 },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  titulo:      { fontSize: 24, fontWeight: 700, color: '#1e1b4b', margin: 0 },
  btnPrimario: { padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' },
  btnSecundario:{ padding: '8px 16px', backgroundColor: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, marginTop: 10, display: 'inline-block' },
  btnQuitar:   { padding: '6px 10px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 },
  formCard:    { backgroundColor: 'white', padding: 24, borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 24 },
  formTitulo:  { margin: '0 0 16px', color: '#1e1b4b', fontSize: 16, fontWeight: 700 },
  label:       { display: 'block', marginBottom: 5, fontWeight: 600, color: '#374151', fontSize: 13 },
  grupo:       { display: 'flex', flexDirection: 'column' },
  select:      { padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#fff' },
  inputNum:    { flex: '0 0 80px', padding: '10px 8px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, textAlign: 'center' },
  inputText:   { padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, minWidth: 200 },
  itemRow:     { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 },
  subtotal:    { minWidth: 90, fontWeight: 600, color: '#4f46e5', textAlign: 'right' },
  totalRow:    { display: 'flex', gap: 20, alignItems: 'flex-end', marginTop: 16, flexWrap: 'wrap' },
  totalLabel:  { fontSize: 18, color: '#1e1b4b' },
  tabla:       { backgroundColor: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' },
  table:       { width: '100%', borderCollapse: 'collapse' },
  thead:       { backgroundColor: '#f8fafc' },
  th:          { padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: 13 },
  tr:          { borderBottom: '1px solid #f1f5f9' },
  td:          { padding: '12px 16px', fontSize: 14, color: '#374151' },
  badge:       { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, backgroundColor: '#dcfce7', color: '#16a34a' }

};

export default Ventas;
