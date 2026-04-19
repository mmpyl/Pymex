import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [cargando, setCargando] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        try {
            const { data } = await api.post('/auth/login', form);
            login(data);
            toast.success(`Bienvenido ${data.usuario.nombre}`);
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al iniciar sesión');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.titulo}>SaaS PYMES</h1>
                <p style={styles.subtitulo}>Inicia sesión en tu cuenta</p>

                <form onSubmit={handleSubmit}>
                    <div style={styles.grupo}>
                        <label style={styles.label}>Email</label>
                        <input
                            style={styles.input}
                            type="email"
                            placeholder="tu@email.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                    <div style={styles.grupo}>
                        <label style={styles.label}>Contraseña</label>
                        <input
                            style={styles.input}
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>
                    <button style={styles.btn} type="submit" disabled={cargando}>
                        {cargando ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>

                <p style={styles.registro}>
                    ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
    titulo: { textAlign: 'center', color: '#1e1b4b', marginBottom: '4px' },
    subtitulo: { textAlign: 'center', color: '#64748b', marginBottom: '30px' },
    grupo: { marginBottom: '16px' },
    label: { display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151', fontSize: '14px' },
    input: { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' },
    registro: { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }
};

export default Login;