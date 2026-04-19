import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios'; 

const Reportes = () => {
    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');
    const [cargando, setCargando] = useState('');

    const descargar = async (tipo) => {
    setCargando(tipo);
        try {
            const params = desde && hasta ? `?desde=${desde}&hasta=${hasta}` : '';
            const urls = {
                'ventas-pdf':   `/reportes/ventas/pdf${params}`,
                'ventas-excel': `/reportes/ventas/excel${params}`,
                'gastos-excel': `/reportes/gastos/excel`
            };
    
            const response = await api.get(urls[tipo], { responseType: 'blob' });
            const url = window.URL.createObjectURL(response.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = tipo.includes('pdf') ? `reporte_${tipo}.pdf` : `reporte_${tipo}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('Reporte descargado');
        } catch {
            toast.error('Error al descargar reporte');
        } finally {
            setCargando('');
        }
    };

    const reportes = [
        { id: 'ventas-pdf', titulo: 'Reporte de Ventas', formato: 'PDF', icono: '📄', color: '#dc2626', bg: '#fee2e2', desc: 'Historial completo de ventas con totales' },
        { id: 'ventas-excel', titulo: 'Reporte de Ventas', formato: 'Excel', icono: '📊', color: '#16a34a', bg: '#dcfce7', desc: 'Ventas en hoja de cálculo editable' },
        { id: 'gastos-excel', titulo: 'Reporte de Gastos', formato: 'Excel', icono: '💸', color: '#d97706', bg: '#fef3c7', desc: 'Gastos agrupados por categoría' }
    ];

    return (
        <div style={styles.container}>
            <h1 style={styles.titulo}>Reportes</h1>

            {/* Filtro de fechas */}
            <div style={styles.filtroCard}>
                <h3 style={styles.filtroTitulo}>📅 Filtrar por fecha (opcional)</h3>
                <div style={styles.filtroRow}>
                    <div style={styles.grupo}>
                        <label style={styles.label}>Desde</label>
                        <input style={styles.input} type="date" value={desde} onChange={e => setDesde(e.target.value)} />
                    </div>
                    <div style={styles.grupo}>
                        <label style={styles.label}>Hasta</label>
                        <input style={styles.input} type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
                    </div>
                    <button style={styles.btnLimpiar} onClick={() => { setDesde(''); setHasta(''); }}>
                        Limpiar filtro
                    </button>
                </div>
                {desde && hasta && (
                    <p style={styles.filtroInfo}>
                        Reportes del {new Date(desde).toLocaleDateString('es-PE')} al {new Date(hasta).toLocaleDateString('es-PE')}
                    </p>
                )}
            </div>

            {/* Cards de reportes */}
            <div style={styles.grid}>
                {reportes.map(r => (
                    <div key={r.id} style={styles.card}>
                        <div style={{ ...styles.cardIcono, backgroundColor: r.bg, color: r.color }}>
                            {r.icono}
                        </div>
                        <div style={styles.cardBody}>
                            <h3 style={styles.cardTitulo}>{r.titulo}</h3>
                            <p style={styles.cardDesc}>{r.desc}</p>
                            <span style={{ ...styles.formatoBadge, backgroundColor: r.bg, color: r.color }}>
                                {r.formato}
                            </span>
                        </div>
                        <button
                            onClick={() => descargar(r.id)}
                            disabled={cargando === r.id}
                            style={{ ...styles.btnDescargar, backgroundColor: r.color, opacity: cargando === r.id ? 0.7 : 1 }}>
                            {cargando === r.id ? '⏳ Generando...' : '⬇ Descargar'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '30px', flex: 1 },
    titulo: { fontSize: '24px', fontWeight: '700', color: '#1e1b4b', marginBottom: '24px' },
    filtroCard: { backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '24px' },
    filtroTitulo: { margin: '0 0 14px', color: '#374151', fontSize: '15px' },
    filtroRow: { display: 'flex', gap: '16px', alignItems: 'end', flexWrap: 'wrap' },
    filtroInfo: { margin: '10px 0 0', fontSize: '13px', color: '#4f46e5', fontWeight: '600' },
    grupo: { display: 'flex', flexDirection: 'column' },
    label: { marginBottom: '5px', fontWeight: '600', color: '#374151', fontSize: '13px' },
    input: { padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' },
    btnLimpiar: { padding: '9px 16px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
    card: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' },
    cardIcono: { width: '52px', height: '52px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' },
    cardBody: { flex: 1 },
    cardTitulo: { margin: '0 0 6px', color: '#1e1b4b', fontSize: '16px' },
    cardDesc: { margin: '0 0 10px', color: '#64748b', fontSize: '13px' },
    formatoBadge: { padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' },
    btnDescargar: { padding: '10px', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'opacity 0.2s' }
};

export default Reportes;
