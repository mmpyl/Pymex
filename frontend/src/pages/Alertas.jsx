import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const tipoConfig = {
    stock_bajo:    { color: '#dc2626', bg: '#fee2e2', icono: '📦', label: 'Stock bajo' },
    ventas_bajas:  { color: '#d97706', bg: '#fef3c7', icono: '📉', label: 'Ventas bajas' },
    gastos_altos:  { color: '#7c3aed', bg: '#ede9fe', icono: '💸', label: 'Gastos altos' },
    default:       { color: '#374151', bg: '#f1f5f9', icono: '🔔', label: 'Alerta' }
};

const Alertas = () => {
    const [alertas, setAlertas] = useState([]);
    const [filtro, setFiltro] = useState('todas');

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        const { data } = await api.get('/alertas');
        setAlertas(data);
    };

    const marcarLeida = async (id) => {
        await api.put(`/alertas/${id}/leer`);
        cargar();
    };

    const marcarTodas = async () => {
        await api.put('/alertas/todas/leer');
        toast.success('Todas las alertas marcadas como leídas');
        cargar();
    };

    const alertasFiltradas = filtro === 'todas' ? alertas
        : filtro === 'sin-leer' ? alertas.filter(a => !a.leido)
        : alertas.filter(a => a.tipo === filtro);

    const sinLeer = alertas.filter(a => !a.leido).length;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.titulo}>
                        Alertas
                        {sinLeer > 0 && <span style={styles.badge}>{sinLeer} sin leer</span>}
                    </h1>
                </div>
                {sinLeer > 0 && (
                    <button style={styles.btnSecundario} onClick={marcarTodas}>
                        ✓ Marcar todas como leídas
                    </button>
                )}
            </div>

            {/* Filtros */}
            <div style={styles.filtros}>
                {[
                    ['todas', 'Todas'],
                    ['sin-leer', `Sin leer (${sinLeer})`],
                    ['stock_bajo', '📦 Stock bajo'],
                    ['ventas_bajas', '📉 Ventas bajas']
                ].map(([key, label]) => (
                    <button key={key} onClick={() => setFiltro(key)}
                        style={{ ...styles.filtroBtn, ...(filtro === key ? styles.filtroBtnActivo : {}) }}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Lista de alertas */}
            <div style={styles.lista}>
                {alertasFiltradas.length === 0 ? (
                    <div style={styles.vacio}>
                        <p style={{ fontSize: '40px', margin: 0 }}>🎉</p>
                        <p>No hay alertas en esta categoría</p>
                    </div>
                ) : (
                    alertasFiltradas.map(alerta => {
                        const config = tipoConfig[alerta.tipo] || tipoConfig.default;
                        return (
                            <div key={alerta.id} style={{ ...styles.alertaCard, opacity: alerta.leido ? 0.6 : 1, borderLeft: `4px solid ${config.color}` }}>
                                <div style={{ ...styles.alertaIcono, backgroundColor: config.bg, color: config.color }}>
                                    {config.icono}
                                </div>
                                <div style={styles.alertaBody}>
                                    <div style={styles.alertaHeader}>
                                        <span style={{ ...styles.alertaTipo, backgroundColor: config.bg, color: config.color }}>
                                            {config.label}
                                        </span>
                                        <span style={styles.alertaFecha}>
                                            {new Date(alerta.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p style={styles.alertaMensaje}>{alerta.mensaje}</p>
                                </div>
                                {!alerta.leido && (
                                    <button onClick={() => marcarLeida(alerta.id)} style={styles.btnLeer}>
                                        ✓ Leído
                                    </button>
                                )}
                                {alerta.leido && <span style={styles.leidoLabel}>✓ Leído</span>}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '30px', flex: 1 },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    titulo: { fontSize: '24px', fontWeight: '700', color: '#1e1b4b', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' },
    badge: { backgroundColor: '#dc2626', color: 'white', borderRadius: '12px', padding: '2px 10px', fontSize: '13px', fontWeight: '700' },
    btnSecundario: { padding: '9px 18px', backgroundColor: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    filtros: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
    filtroBtn: { padding: '7px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: '#e2e8f0', color: '#475569', fontWeight: '600', fontSize: '13px' },
    filtroBtnActivo: { backgroundColor: '#4f46e5', color: 'white' },
    lista: { display: 'flex', flexDirection: 'column', gap: '12px' },
    alertaCard: { backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' },
    alertaIcono: { width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 },
    alertaBody: { flex: 1 },
    alertaHeader: { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' },
    alertaTipo: { padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' },
    alertaFecha: { fontSize: '12px', color: '#94a3b8' },
    alertaMensaje: { margin: 0, fontSize: '14px', color: '#374151' },
    btnLeer: { padding: '7px 14px', backgroundColor: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', flexShrink: 0 },
    leidoLabel: { fontSize: '12px', color: '#94a3b8', flexShrink: 0 },
    vacio: { textAlign: 'center', padding: '60px', color: '#94a3b8', backgroundColor: 'white', borderRadius: '10px' }
};

export default Alertas;