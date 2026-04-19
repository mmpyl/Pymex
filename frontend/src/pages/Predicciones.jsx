import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../api/axios';
import toast from 'react-hot-toast';

const riesgoConfig = {
    critico: { color: '#dc2626', bg: '#fee2e2', label: '🔴 Crítico' },
    alto:    { color: '#d97706', bg: '#fef3c7', label: '🟠 Alto' },
    medio:   { color: '#2563eb', bg: '#dbeafe', label: '🔵 Medio' },
    bajo:    { color: '#16a34a', bg: '#dcfce7', label: '🟢 Bajo' },
    sin_ventas: { color: '#6b7280', bg: '#f3f4f6', label: '⚪ Sin ventas' }
};

const Predicciones = () => {
    const [ventasPred, setVentasPred]     = useState([]);
    const [demandaPred, setDemandaPred]   = useState([]);
    const [stockPred, setStockPred]       = useState([]);
    const [cargando, setCargando]         = useState(true);
    const [entrenando, setEntrenando]     = useState(false);
    const [vista, setVista]               = useState('ventas');

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        setCargando(true);
        try {
            const [v, d, s] = await Promise.all([
                api.get('/ml/ventas?meses=6'),
                api.get('/ml/demanda'),
                api.get('/ml/stock')
            ]);
            setVentasPred(v.data.predicciones || []);
            setDemandaPred(d.data.predicciones || []);
            setStockPred(s.data.predicciones || []);
        } catch {
            toast.error('Activa el servicio ML (puerto 8000)');
        } finally {
            setCargando(false);
        }
    };

    const entrenar = async () => {
        setEntrenando(true);
        try {
            await api.post('/ml/entrenar');
            toast.success('Modelos entrenados correctamente');
            cargar();
        } catch {
            toast.error('Error al entrenar modelos');
        } finally {
            setEntrenando(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.titulo}>🤖 Predicciones ML</h1>
                <button style={styles.btnEntrenar} onClick={entrenar} disabled={entrenando}>
                    {entrenando ? '⏳ Entrenando...' : '🔄 Entrenar modelos'}
                </button>
            </div>

            <p style={styles.subtitulo}>
                Las predicciones se generan con tus datos históricos usando Random Forest y XGBoost.
            </p>

            {/* Tabs */}
            <div style={styles.tabs}>
                {[
                    ['ventas',  '📈 Ventas futuras'],
                    ['demanda', '📦 Demanda por producto'],
                    ['stock',   '⚠️ Quiebre de stock']
                ].map(([key, label]) => (
                    <button key={key} onClick={() => setVista(key)}
                        style={{ ...styles.tab, ...(vista === key ? styles.tabActivo : {}) }}>
                        {label}
                    </button>
                ))}
            </div>

            {cargando ? (
                <div style={styles.cargando}>⏳ Cargando predicciones...</div>
            ) : (
                <>
                    {/* VENTAS */}
                    {vista === 'ventas' && (
                        <div style={styles.card}>
                            <h2 style={styles.cardTitulo}>Predicción de ventas — próximos 6 meses</h2>
                            <p style={styles.cardDesc}>Modelo: <strong>Random Forest</strong> — Basado en tus ventas históricas</p>
                            {ventasPred.length > 0 && !ventasPred[0]?.error ? (
                                <>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={ventasPred}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="periodo" />
                                            <YAxis />
                                            <Tooltip formatter={v => `S/ ${parseFloat(v).toFixed(2)}`} />
                                            <Bar dataKey="ventas_predichas" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Ventas predichas" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <div style={styles.predGrid}>
                                        {ventasPred.map((p, i) => (
                                            <div key={i} style={styles.predCard}>
                                                <p style={styles.predMes}>{p.periodo}</p>
                                                <p style={styles.predValor}>S/ {parseFloat(p.ventas_predichas).toFixed(2)}</p>
                                                <p style={styles.predConf}>Confianza: {p.confianza}%</p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div style={styles.sinDatos}>
                                    <p>⚠️ {ventasPred[0]?.error || 'Sin datos suficientes'}</p>
                                    <p style={{ fontSize: '13px', color: '#94a3b8' }}>Registra más ventas y presiona "Entrenar modelos"</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* DEMANDA */}
                    {vista === 'demanda' && (
                        <div style={styles.card}>
                            <h2 style={styles.cardTitulo}>Demanda predicha por producto — próximo mes</h2>
                            <p style={styles.cardDesc}>Modelo: <strong>XGBoost</strong> — Cuánto vas a vender de cada producto</p>
                            {demandaPred.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={demandaPred.slice(0, 10)} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" />
                                            <YAxis dataKey="producto" type="category" width={130} tick={{ fontSize: 12 }} />
                                            <Tooltip formatter={v => `${v} unidades`} />
                                            <Bar dataKey="demanda_predicha" fill="#16a34a" radius={[0, 6, 6, 0]} name="Unidades" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <table style={{ ...styles.table, marginTop: '20px' }}>
                                        <thead><tr style={styles.thead}>
                                            <th style={styles.th}>Producto</th>
                                            <th style={styles.th}>Demanda predicha</th>
                                            <th style={styles.th}>Método</th>
                                            <th style={styles.th}>Confianza</th>
                                        </tr></thead>
                                        <tbody>
                                            {demandaPred.map((p, i) => (
                                                <tr key={i} style={styles.tr}>
                                                    <td style={styles.td}>{p.producto}</td>
                                                    <td style={styles.td}><strong>{p.demanda_predicha} uds</strong></td>
                                                    <td style={styles.td}><span style={styles.metodoBadge}>{p.metodo}</span></td>
                                                    <td style={styles.td}>{p.confianza}%</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            ) : (
                                <div style={styles.sinDatos}>Sin datos de demanda disponibles</div>
                            )}
                        </div>
                    )}

                    {/* STOCK */}
                    {vista === 'stock' && (
                        <div style={styles.card}>
                            <h2 style={styles.cardTitulo}>Predicción de quiebre de stock</h2>
                            <p style={styles.cardDesc}>Basado en la velocidad de ventas de los últimos 30 días</p>
                            {stockPred.length > 0 ? (
                                <table style={styles.table}>
                                    <thead><tr style={styles.thead}>
                                        <th style={styles.th}>Producto</th>
                                        <th style={styles.th}>Stock actual</th>
                                        <th style={styles.th}>Ventas/día</th>
                                        <th style={styles.th}>Días para quiebre</th>
                                        <th style={styles.th}>Riesgo</th>
                                        <th style={styles.th}>Compra sugerida</th>
                                    </tr></thead>
                                    <tbody>
                                        {stockPred.map((p, i) => {
                                            const cfg = riesgoConfig[p.riesgo] || riesgoConfig.bajo;
                                            return (
                                                <tr key={i} style={styles.tr}>
                                                    <td style={styles.td}><strong>{p.producto}</strong></td>
                                                    <td style={styles.td}>{p.stock_actual} uds</td>
                                                    <td style={styles.td}>{p.ventas_dia} uds/día</td>
                                                    <td style={styles.td}>
                                                        <strong style={{ color: cfg.color }}>
                                                            {p.dias_para_quiebre >= 999 ? '∞' : `${p.dias_para_quiebre} días`}
                                                        </strong>
                                                    </td>
                                                    <td style={styles.td}>
                                                        <span style={{ ...styles.riesgoBadge, backgroundColor: cfg.bg, color: cfg.color }}>
                                                            {cfg.label}
                                                        </span>
                                                    </td>
                                                    <td style={styles.td}>
                                                        {p.recomendacion_compra > 0
                                                            ? <span style={styles.compraBadge}>+{p.recomendacion_compra} uds</span>
                                                            : <span style={{ color: '#94a3b8' }}>OK</span>
                                                        }
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={styles.sinDatos}>Sin productos para analizar</div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '30px', flex: 1 },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
    titulo: { fontSize: '24px', fontWeight: '700', color: '#1e1b4b', margin: 0 },
    subtitulo: { color: '#64748b', fontSize: '14px', marginBottom: '24px' },
    btnEntrenar: { padding: '10px 20px', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    tabs: { display: 'flex', gap: '8px', marginBottom: '20px' },
    tab: { padding: '9px 18px', border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: '#e2e8f0', color: '#475569', fontWeight: '600' },
    tabActivo: { backgroundColor: '#4f46e5', color: 'white' },
    cargando: { textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '16px' },
    card: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
    cardTitulo: { fontSize: '18px', fontWeight: '700', color: '#1e1b4b', margin: '0 0 6px' },
    cardDesc: { fontSize: '13px', color: '#64748b', marginBottom: '20px' },
    predGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginTop: '20px' },
    predCard: { backgroundColor: '#f8fafc', borderRadius: '8px', padding: '14px', textAlign: 'center', borderTop: '3px solid #4f46e5' },
    predMes: { margin: '0 0 4px', fontSize: '12px', color: '#64748b', fontWeight: '600' },
    predValor: { margin: '0 0 4px', fontSize: '18px', fontWeight: '700', color: '#4f46e5' },
    predConf: { margin: 0, fontSize: '11px', color: '#94a3b8' },
    sinDatos: { textAlign: 'center', padding: '40px', color: '#94a3b8', backgroundColor: '#f8fafc', borderRadius: '8px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: { backgroundColor: '#f8fafc' },
    th: { padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '13px' },
    tr: { borderBottom: '1px solid #f1f5f9' },
    td: { padding: '12px 16px', fontSize: '14px', color: '#374151' },
    metodoBadge: { padding: '2px 8px', backgroundColor: '#ede9fe', color: '#6d28d9', borderRadius: '10px', fontSize: '11px', fontWeight: '600' },
    riesgoBadge: { padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' },
    compraBadge: { padding: '3px 10px', backgroundColor: '#fef3c7', color: '#d97706', borderRadius: '10px', fontSize: '12px', fontWeight: '600' }
};

export default Predicciones;