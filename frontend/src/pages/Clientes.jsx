import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const camposForm = [
    ['Nombre completo *', 'nombre', 'text', true],
    ['DNI / RUC', 'documento', 'text', false],
    ['Email', 'email', 'email', false],
    ['Teléfono', 'telefono', 'text', false],
    ['Dirección', 'direccion', 'text', false]
];

const TablaEntidad = ({ datos, columnas, onEditar, onEliminar }) => (
    <div style={styles.tabla}>
        <table style={styles.table}>
            <thead><tr style={styles.thead}>
                {columnas.map(c => <th key={c} style={styles.th}>{c}</th>)}
                <th style={styles.th}>Acciones</th>
            </tr></thead>
            <tbody>
                {datos.map(item => (
                    <tr key={item.id} style={styles.tr}>
                        {columnas.map(c => <td key={c} style={styles.td}>{item[c.toLowerCase()] || '—'}</td>)}
                        <td style={styles.td}>
                            <button onClick={() => onEditar(item)} style={styles.btnEditar}>Editar</button>
                            <button onClick={() => onEliminar(item.id)} style={styles.btnEliminar}>Eliminar</button>
                        </td>
                    </tr>
                ))}
                {datos.length === 0 && <tr><td colSpan={columnas.length + 1} style={styles.sinDatos}>No hay registros</td></tr>}
            </tbody>
        </table>
    </div>
);

const Clientes = () => {
    const [clientes, setClientes] = useState([]);
    const [form, setForm] = useState({ nombre: '', documento: '', email: '', telefono: '', direccion: '' });
    const [editando, setEditando] = useState(null);
    const [mostrarForm, setMostrarForm] = useState(false);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        const { data } = await api.get('/clientes');
        setClientes(data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editando) {
                await api.put(`/clientes/${editando}`, form);
                toast.success('Cliente actualizado');
            } else {
                await api.post('/clientes', form);
                toast.success('Cliente creado');
            }
            setForm({ nombre: '', documento: '', email: '', telefono: '', direccion: '' });
            setEditando(null);
            setMostrarForm(false);
            cargar();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al guardar');
        }
    };

    const iniciarEdicion = (cliente) => {
        setForm({ nombre: cliente.nombre, documento: cliente.documento || '', email: cliente.email || '', telefono: cliente.telefono || '', direccion: cliente.direccion || '' });
        setEditando(cliente.id);
        setMostrarForm(true);
    };

    const eliminar = async (id) => {
        if (!confirm('¿Eliminar este cliente?')) return;
        await api.delete(`/clientes/${id}`);
        toast.success('Cliente eliminado');
        cargar();
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.titulo}>Clientes <span style={styles.count}>{clientes.length}</span></h1>
                <button style={styles.btnPrimario} onClick={() => { setMostrarForm(!mostrarForm); setEditando(null); setForm({ nombre: '', documento: '', email: '', telefono: '', direccion: '' }); }}>
                    {mostrarForm ? 'Cancelar' : '+ Nuevo cliente'}
                </button>
            </div>

            {mostrarForm && (
                <div style={styles.formCard}>
                    <h3 style={{ margin: '0 0 16px', color: '#1e1b4b' }}>{editando ? 'Editar cliente' : 'Nuevo cliente'}</h3>
                    <form onSubmit={handleSubmit} style={styles.form}>
                        {camposForm.map(([label, name, type, required]) => (
                            <div key={name} style={styles.grupo}>
                                <label style={styles.label}>{label}</label>
                                <input style={styles.input} type={type} value={form[name]} onChange={e => setForm({ ...form, [name]: e.target.value })} required={required} />
                            </div>
                        ))}
                        <button style={styles.btnPrimario} type="submit">{editando ? 'Actualizar' : 'Guardar'}</button>
                    </form>
                </div>
            )}

            <TablaEntidad
                datos={clientes}
                columnas={['Nombre', 'Documento', 'Email', 'Teléfono']}
                onEditar={iniciarEdicion}
                onEliminar={eliminar}
            />
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
    td: { padding: '12px 16px', fontSize: '14px', color: '#374151' },
    sinDatos: { textAlign: 'center', padding: '30px', color: '#94a3b8' }
};

export default Clientes;