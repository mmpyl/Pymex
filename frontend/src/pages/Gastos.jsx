import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const categorias = ['Alquiler', 'Servicios', 'Salarios', 'Transporte', 'Marketing', 'Suministros', 'Otros'];

const Gastos = () => {
    const [gastos, setGastos] = useState([]);
    const [form, setForm] = useState({ categoria: '', descripcion: '', monto: '' });
    const [mostrarForm, setMostrarForm] = useState(false);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        const { data } = await api.get('/gastos');
        setGastos(data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/gastos', form);
            toast.success('Gasto registrado');
            setForm({ categoria: '', descripcion: '', monto: '' });
            setMostrarForm(false);
            cargar();
        } catch (error) {
            toast.error('Error al registrar gasto');
        }
    };

    const totalGastos = gastos.reduce((sum, g) => sum + parseFloat(g.monto), 0);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.titulo}>Gastos</h1>
                <button style={styles.btnPrimario} onClick={() => setMostrarForm(!mostrarForm)}>
                    {mostrarForm ? 'Cancelar' : '+ Nuevo gasto'}
                </button>
            </div>

            <div style={styles.resumen}>
                Total gastos: <strong style={{ color: '#dc2626' }}>S/ {totalGastos.toFixed(2)}</strong>
            </div>

            {mostrarForm && (
                <div style={styles.formCard}>
                    <h3 style={styles.formTitulo}>Nuevo gasto</h3>
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.grupo}>
                            <label style={styles.label}>Categoría</label>
                            <select style={styles.input} value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} required>
                                <option value="">Seleccionar</option>
                                {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div style={styles.grupo}>
                            <label style={styles.label}>Descripción</label>
                            <input style={styles.input} type="text" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Detalle del gasto" />
                        </div>
                        <div style={styles.grupo}>
                            <label style={styles.label}>Monto (S/)</label>
                            <input style={styles.input} type="number" step="0.01" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} required />
                        </div>
                        <button style={styles.btnPrimario} type="submit">Guardar</button>
                    </form>
                </div>
            )}

            <div style={styles.tabla}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.thead}>
                            <th style={styles.th}>Fecha</th>
                            <th style={styles.th}>Categoría</th>
                            <th style={styles.th}>Descripción</th>
                            <th style={styles.th}>Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gastos.map((g) => (
                            <tr key={g.id} style={styles.tr}>
                                <td style={styles.td}>{new Date(g.fecha).toLocaleDateString('es-PE')}</td>
                                <td style={styles.td}><span style={styles.badge}>{g.categoria}</span></td>
                                <td style={styles.td}>{g.descripcion || '—'}</td>
                                <td style={styles.td}><strong style={{ color: '#dc2626' }}>S/ {parseFloat(g.monto).toFixed(2)}</strong></td>
                            </tr>
                        ))}
                        {gastos.length === 0 && (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No hay gastos aún</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '30px', flex: 1 },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    titulo: { fontSize: '24px', fontWeight: '700', color: '#1e1b4b' },
    resumen: { backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#92400e' },
    btnPrimario: { padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    formCard: { backgroundColor: 'white', padding: '24px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' },
    formTitulo: { marginBottom: '16px', color: '#1e1b4b' },
    form: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'end' },
    grupo: { display: 'flex', flexDirection: 'column' },
    label: { marginBottom: '5px', fontWeight: '600', color: '#374151', fontSize: '13px' },
    input: { padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' },
    tabla: { backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: { backgroundColor: '#f8fafc' },
    th: { padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '13px' },
    tr: { borderBottom: '1px solid #f1f5f9' },
    td: { padding: '12px 16px', fontSize: '14px', color: '#374151' },
    badge: { padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', backgroundColor: '#ede9fe', color: '#6d28d9' }
};

export default Gastos;