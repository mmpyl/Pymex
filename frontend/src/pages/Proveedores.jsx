import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Proveedores = () => {
    const [proveedores, setProveedores] = useState([]);
    const [form, setForm] = useState({ nombre: '', documento: '', email: '', telefono: '', direccion: '', contacto: '' });
    const [editando, setEditando] = useState(null);
    const [mostrarForm, setMostrarForm] = useState(false);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        const { data } = await api.get('/proveedores');
        setProveedores(data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editando) {
                await api.put(`/proveedores/${editando}`, form);
                toast.success('Proveedor actualizado');
            } else {
                await api.post('/proveedores', form);
                toast.success('Proveedor creado');
            }
            setForm({ nombre: '', documento: '', email: '', telefono: '', direccion: '', contacto: '' });
            setEditando(null);
            setMostrarForm(false);
            cargar();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al guardar');
        }
    };

    const iniciarEdicion = (p) => {
        setForm({ nombre: p.nombre, documento: p.documento || '', email: p.email || '', telefono: p.telefono || '', direccion: p.direccion || '', contacto: p.contacto || '' });
        setEditando(p.id);
        setMostrarForm(true);
    };

    const eliminar = async (id) => {
        if (!confirm('¿Eliminar este proveedor?')) return;
        await api.delete(`/proveedores/${id}`);
        toast.success('Proveedor eliminado');
        cargar();
    };

    const campos = [
        ['Nombre *', 'nombre', 'text'], ['RUC / Documento', 'documento', 'text'],
        ['Email', 'email', 'email'], ['Teléfono', 'telefono', 'text'],
        ['Contacto', 'contacto', 'text'], ['Dirección', 'direccion', 'text']
    ];

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.titulo}>Proveedores <span style={styles.count}>{proveedores.length}</span></h1>
                <button style={styles.btnPrimario} onClick={() => { setMostrarForm(!mostrarForm); setEditando(null); }}>
                    {mostrarForm ? 'Cancelar' : '+ Nuevo proveedor'}
                </button>
            </div>

            {mostrarForm && (
                <div style={styles.formCard}>
                    <h3 style={{ margin: '0 0 16px', color: '#1e1b4b' }}>{editando ? 'Editar proveedor' : 'Nuevo proveedor'}</h3>
                    <form onSubmit={handleSubmit} style={styles.form}>
                        {campos.map(([label, name, type]) => (
                            <div key={name} style={styles.grupo}>
                                <label style={styles.label}>{label}</label>
                                <input style={styles.input} type={type} value={form[name]} onChange={e => setForm({ ...form, [name]: e.target.value })} required={label.includes('*')} />
                            </div>
                        ))}
                        <button style={styles.btnPrimario} type="submit">{editando ? 'Actualizar' : 'Guardar'}</button>
                    </form>
                </div>
            )}

            <div style={styles.tabla}>
                <table style={styles.table}>
                    <thead><tr style={styles.thead}>
                        {['Nombre', 'Documento', 'Contacto', 'Teléfono', 'Email', 'Acciones'].map(c => <th key={c} style={styles.th}>{c}</th>)}
                    </tr></thead>
                    <tbody>
                        {proveedores.map(p => (
                            <tr key={p.id} style={styles.tr}>
                                <td style={styles.td}><strong>{p.nombre}</strong></td>
                                <td style={styles.td}>{p.documento || '—'}</td>
                                <td style={styles.td}>{p.contacto || '—'}</td>
                                <td style={styles.td}>{p.telefono || '—'}</td>
                                <td style={styles.td}>{p.email || '—'}</td>
                                <td style={styles.td}>
                                    <button onClick={() => iniciarEdicion(p)} style={styles.btnEditar}>Editar</button>
                                    <button onClick={() => eliminar(p.id)} style={styles.btnEliminar}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                        {proveedores.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No hay proveedores</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '30px', flex: 1 },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    titulo: { fontSize: '24px', fontWeight: '700', color: '#1e1b4b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' },
    count: { backgroundColor: '#e0e7ff', color: '#4f46e5', borderRadius: '12px', padding: '2px 10px', fontSize: '14px' },
    btnPrimario: { padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    btnEditar: { padding: '5px 12px', backgroundColor: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', marginRight: '6px' },
    btnEliminar: { padding: '5px 12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
    formCard: { backgroundColor: 'white', padding: '24px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' },
    form: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' },
    grupo: { display: 'flex', flexDirection: 'column' },
    label: { marginBottom: '5px', fontWeight: '600', color: '#374151', fontSize: '13px' },
    input: { padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' },
    tabla: { backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: { backgroundColor: '#f8fafc' },
    th: { padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '13px' },
    tr: { borderBottom: '1px solid #f1f5f9' },
    td: { padding: '12px 16px', fontSize: '14px', color: '#374151' }
};

export default Proveedores;