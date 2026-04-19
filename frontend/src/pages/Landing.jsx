import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const planes = [
  { nombre: 'Básico', precio: 'S/ 79', descripcion: 'Operación inicial para PYMES (sin ML)' },
  { nombre: 'Pro', precio: 'S/ 149', descripcion: 'Más usuarios y reportes (sin ML)' },
  { nombre: 'Business', precio: 'S/ 299', descripcion: 'Incluye predicción de ventas ML' },
  { nombre: 'Enterprise', precio: 'Custom', descripcion: 'Predicción + API Access + SLA' }
];

export default function Landing() {
  const [form, setForm] = useState({
    empresa_nombre: '',
    empresa_email: '',
    nombre: '',
    email: '',
    password: ''
  });
  const [mensaje, setMensaje] = useState('');

  const iniciarTrial = async (e) => {
    e.preventDefault();
    setMensaje('');
    try {
      const { data } = await api.post('/auth/start-trial', form);
      setMensaje(`✅ Trial creado para ${data.empresa.nombre}. Revisa tu login.`);
      setForm({ empresa_nombre: '', empresa_email: '', nombre: '', email: '', password: '' });
    } catch (error) {
      setMensaje(`❌ ${error.response?.data?.error || 'No se pudo iniciar trial'}`);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', color: '#fff' }}>
        <h2 style={{ margin: 0 }}>SaPyme Cloud</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to='/login' style={{ color: '#fff' }}>Login</Link>
          <Link to='/register' style={{ color: '#fff' }}>Registro</Link>
        </div>
      </header>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
        <h1>SaaS para PYMES listo para crecer</h1>
        <p>Controla ventas, inventario y métricas con planes escalables y administración multi-tenant.</p>

        <h3>Planes</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
          {planes.map((plan) => (
            <div key={plan.nombre} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
              <h4 style={{ margin: '0 0 6px' }}>{plan.nombre}</h4>
              <strong>{plan.precio} / mes</strong>
              <p style={{ color: '#475569' }}>{plan.descripcion}</p>
            </div>
          ))}
        </div>

        <h3>Inicia Trial Gratis</h3>
        <form onSubmit={iniciarTrial} style={{ display: 'grid', gap: 8, maxWidth: 500 }}>
          <input placeholder='Empresa' value={form.empresa_nombre} onChange={(e) => setForm({ ...form, empresa_nombre: e.target.value })} required />
          <input placeholder='Email empresa' type='email' value={form.empresa_email} onChange={(e) => setForm({ ...form, empresa_email: e.target.value })} required />
          <input placeholder='Nombre admin' value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          <input placeholder='Email admin' type='email' value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input placeholder='Password' type='password' value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <button type='submit'>Activar trial</button>
        </form>
        {mensaje && <p>{mensaje}</p>}
      </section>
    </div>
  );
}
