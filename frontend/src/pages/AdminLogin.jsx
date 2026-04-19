import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/admin/login', form);
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_usuario', JSON.stringify(data.admin));
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo iniciar sesión admin');
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '80px auto', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 20 }}>
      <h2>Super Admin Login</h2>
      <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
        <input type='email' placeholder='admin@email.com' value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input type='password' placeholder='••••••••' value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button type='submit'>Ingresar</button>
      </form>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
    </div>
  );
}
