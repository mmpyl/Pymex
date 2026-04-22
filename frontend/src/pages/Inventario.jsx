import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Inventario = () => {
    const [productos, setProductos] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [vista, setVista] = useState('stock'); // stock | historial | stock-bajo
    const [form, setForm] = useState({ producto_id: '', tipo: 'entrada', cantidad: 1, motivo: '' });
    const [mostrarForm, setMostrarForm] = useState(false);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        const [p, h] = await Promise.all([
            api.get('/inventario'),
            api.get('/inventario/historial')
        ]);
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

    const productosBajoStock = productos.filter(p => p.stock <= p.stock_minimo);

    return (
        <div className="flex-1 p-6">
            <div style={styles.header}>
                <h1 style={styles.titulo}>Inventario</h1>
                <button style={styles.btnPrimario} onClick={() => setMostrarForm(!mostrarForm)}>
                    {mostrarForm ? 'Cancelar' : '+ Registrar movimiento'}
                </button>
            </div>

            {/* Resumen rápido */}
            <div style={styles.resumenGrid}>
                {[
                    { label: 'Total productos', valor: productos.length, color: '#4f46e5', icono: '📦' },
                    { label: 'Stock bajo', valor: productosBajoStock.length, color: '#dc2626', icono: '⚠️' },
                    { label: 'Movimientos hoy', valor: historial.filter(m => new Date(m.fecha).toDateString() === new Date().toDateString()).length, color: '#16a34a', icono: '🔄' }
                ].map(k => (
                    <div key={k.label} style={{ ...styles.kpi, borderLeft: `4px solid ${k.color}` }}>
                        <span style={styles.kpiIcono}>{k.icono}</span>
                        <div>
                            <p style={styles.kpiLabel}>{k.label}</p>
                            <p style={{ ...styles.kpiValor, color: k.color }}>{k.valor}</p>
                        </div>
                    </div>
                ))}
            </div>

            {mostrarForm && (
                <div style={styles.formCard}>
                    <h3>Registrar movimiento de inventario</h3>
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.grupo}>
                            <label style={styles.label}>Producto</label>
                            <select style={styles.input} value={form.producto_id} onChange={e => setForm({ ...form, producto_id: e.target.value })} required>
                                <option value="">Seleccionar producto</option>
                                {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stock})</option>)}
                            </select>
                        </div>
                        <div style={styles.grupo}>
                            <label style={styles.label}>Tipo</label>
                            <select style={styles.input} value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                                <option value="entrada">Entrada</option>
                                <option value="salida">Salida</option>
                                <option value="ajuste">Ajuste</option>
                            </select>
                        </div>
                        <div style={styles.grupo}>
                            <label style={styles.label}>Cantidad</label>
                            <input style={styles.input} type="number" min="1" value={form.cantidad} onChange={e => setForm({ ...form, cantidad: e.target.value })} required />
                        </div>
                        <div style={styles.grupo}>
                            <label style={styles.label}>Motivo</label>
                            <input style={styles.input} type="text" value={form.motivo} onChange={e => setForm({ ...form, motivo: e.target.value })} placeholder="Compra, ajuste, etc." />
                        </div>
                        <button style={styles.btnPrimario} type="submit">Registrar</button>
                    </form>
                </div>
            )}

            {/* Tabs */}
            <div style={styles.tabs}>
                {[['stock', 'Stock actual'], ['historial', 'Historial'], ['stock-bajo', `Stock bajo (${productosBajoStock.length})`]].map(([key, label]) => (
                    <button key={key} onClick={() => setVista(key)}
                        style={{ ...styles.tab, ...(vista === key ? styles.tabActivo : {}) }}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Tabla Stock */}
            {vista === 'stock' && (
                <div style={styles.tabla}>
                    <table style={styles.table}>
                        <thead><tr style={styles.thead}>
                            <th style={styles.th}>Producto</th>
                            <th style={styles.th}>Stock actual</th>
                            <th style={styles.th}>Stock mínimo</th>
                            <th style={styles.th}>P. Compra</th>
                            <th style={styles.th}>P. Venta</th>
                            <th style={styles.th}>Estado</th>
                        </tr></thead>
                        <tbody>
                            {productos.map(p => (
                                <tr key={p.id} style={styles.tr}>
                                    <td style={styles.td}>{p.nombre}</td>
                                    <td style={styles.td}>
                                        <span style={{ color: p.stock <= p.stock_minimo ? '#dc2626' : '#16a34a', fontWeight: '700' }}>
                                            {p.stock}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{p.stock_minimo}</td>
                                    <td style={styles.td}>S/ {parseFloat(p.precio_compra).toFixed(2)}</td>
                                    <td style={styles.td}>S/ {parseFloat(p.precio_venta).toFixed(2)}</td>
                                    <td style={styles.td}>
                                        <span style={{ ...styles.badge, backgroundColor: p.stock <= p.stock_minimo ? '#fee2e2' : '#dcfce7', color: p.stock <= p.stock_minimo ? '#dc2626' : '#16a34a' }}>
                                            {p.stock <= p.stock_minimo ? '⚠️ Bajo' : '✅ OK'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Historial */}
            {vista === 'historial' && (
                <div style={styles.tabla}>
                    <table style={styles.table}>
                        <thead><tr style={styles.thead}>
                            <th style={styles.th}>Fecha</th>
                            <th style={styles.th}>Producto</th>
                            <th style={styles.th}>Tipo</th>
                            <th style={styles.th}>Cantidad</th>
                            <th style={styles.th}>Motivo</th>
                        </tr></thead>
                        <tbody>
                            {historial.map(m => (
                                <tr key={m.id} style={styles.tr}>
                                    <td style={styles.td}>{new Date(m.fecha).toLocaleDateString('es-PE')}</td>
                                    <td style={styles.td}>{m.Producto?.nombre}</td>
                                    <td style={styles.td}>
                                        <span style={{ ...styles.badge, backgroundColor: m.tipo === 'entrada' ? '#dcfce7' : '#fee2e2', color: m.tipo === 'entrada' ? '#16a34a' : '#dc2626' }}>
                                            {m.tipo}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{m.cantidad}</td>
                                    <td style={styles.td}>{m.motivo || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Stock Bajo */}
            {vista === 'stock-bajo' && (
                <div style={styles.tabla}>
                    {productosBajoStock.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '40px', color: '#16a34a', fontSize: '16px' }}>
                            ✅ Todos los productos tienen stock suficiente
                        </p>
                    ) : (
                        <table style={styles.table}>
                            <thead><tr style={styles.thead}>
                                <th style={styles.th}>Producto</th>
                                <th style={styles.th}>Stock actual</th>
                                <th style={styles.th}>Stock mínimo</th>
                                <th style={styles.th}>Diferencia</th>
                            </tr></thead>
                            <tbody>
                                {productosBajoStock.map(p => (
                                    <tr key={p.id} style={styles.tr}>
                                        <td style={styles.td}>{p.nombre}</td>
                                        <td style={styles.td}><strong style={{ color: '#dc2626' }}>{p.stock}</strong></td>
                                        <td style={styles.td}>{p.stock_minimo}</td>
                                        <td style={styles.td}><span style={{ color: '#dc2626', fontWeight: '700' }}>-{p.stock_minimo - p.stock}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '30px', flex: 1 },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    titulo: { fontSize: '24px', fontWeight: '700', color: '#1e1b4b', margin: 0 },
    btnPrimario: { padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    resumenGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' },
    kpi: { backgroundColor: 'white', padding: '16px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', gap: '12px', alignItems: 'center' },
    kpiIcono: { fontSize: '28px' },
    kpiLabel: { margin: 0, fontSize: '12px', color: '#64748b' },
    kpiValor: { margin: 0, fontSize: '22px', fontWeight: '700' },
    formCard: { backgroundColor: 'white', padding: '24px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' },
    form: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'end', marginTop: '16px' },
    grupo: { display: 'flex', flexDirection: 'column' },
    label: { marginBottom: '5px', fontWeight: '600', color: '#374151', fontSize: '13px' },
    input: { padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' },
    tabs: { display: 'flex', gap: '8px', marginBottom: '16px' },
    tab: { padding: '8px 18px', border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: '#e2e8f0', color: '#475569', fontWeight: '600' },
    tabActivo: { backgroundColor: '#4f46e5', color: 'white' },
    tabla: { backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: { backgroundColor: '#f8fafc' },
    th: { padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '13px' },
    tr: { borderBottom: '1px solid #f1f5f9' },
    td: { padding: '12px 16px', fontSize: '14px', color: '#374151' },
    badge: { padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }
};

export default Inventario;