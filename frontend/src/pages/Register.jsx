import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Register = () => {
    const [form, setForm] = useState({
        empresa_nombre: '', empresa_email: '', empresa_ruc: '',
        nombre: '', email: '', password: ''
    });
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        try {
            await api.post('/auth/register', form);
            toast.success('Empresa registrada. Ya puedes iniciar sesión.');
            navigate('/empresa/login');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al registrar');
        } finally {
            setCargando(false);
        }
    };

    const campo = (label, name, type = 'text', placeholder = '') => (
        <div style={styles.grupo}>
            <label style={styles.label}>{label}</label>
            <input
                style={styles.input}
                type={type}
                placeholder={placeholder}
                value={form[name]}
                onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                required
            />
        </div>
    );

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.titulo}>Registra tu empresa</h1>

                <form onSubmit={handleSubmit}>
                    <p style={styles.seccion}>Datos de la empresa</p>
                    {campo('Nombre de la empresa', 'empresa_nombre', 'text', 'Mi Empresa S.A.')}
                    {campo('Email de la empresa', 'empresa_email', 'email', 'empresa@email.com')}
                    {campo('RUC', 'empresa_ruc', 'text', '20123456789')}

                    <p style={styles.seccion}>Tu cuenta de administrador</p>
                    {campo('Tu nombre', 'nombre', 'text', 'Juan Pérez')}
                    {campo('Tu email', 'email', 'email', 'tu@email.com')}
                    {campo('Contraseña', 'password', 'password', '••••••••')}

                    <button style={styles.btn} type="submit" disabled={cargando}>
                        {cargando ? 'Registrando...' : 'Crear cuenta'}
                    </button>
                </form>

                <p style={styles.login}>
                    ¿Ya tienes cuenta? <Link to="/empresa/login">Inicia sesión</Link>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', padding: '20px' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '480px' },
    titulo: { textAlign: 'center', color: '#1e1b4b', marginBottom: '24px' },
    seccion: { fontWeight: '700', color: '#4f46e5', margin: '20px 0 12px', fontSize: '14px', textTransform: 'uppercase' },
    grupo: { marginBottom: '14px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151', fontSize: '14px' },
    input: { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '10px' },
    login: { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }
};

export default Register;