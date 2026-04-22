import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/login', form);
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: 'hsl(var(--background))',
      }}
    >
      <div
        style={{
          width: 420,
          flexShrink: 0,
          background: 'var(--navy-900)',
          display: 'flex',
          flexDirection: 'column',
          padding: '48px 44px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            right: -80,
            width: 320,
            height: 320,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: -120,
            width: 220,
            height: 220,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: -60,
            left: -60,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(240,128,32,0.06)',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'auto' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'var(--amber-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 700,
              color: 'white',
              letterSpacing: '-1px',
            }}
          >
            SP
          </div>
          <span style={{ fontSize: 20, fontWeight: 600, color: 'white', letterSpacing: '-0.3px' }}>
            SaPyme
          </span>
        </div>

        <div style={{ marginBottom: 'auto' }}>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: 'white',
              letterSpacing: '-1px',
              lineHeight: 1.15,
              margin: '0 0 16px',
            }}
          >
            Gestiona tu PYME con inteligencia
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(184,202,224,0.75)', lineHeight: 1.6, margin: 0 }}>
            Ventas, inventario, facturación electrónica y predicciones ML — todo en una sola
            plataforma.
          </p>

          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              'Facturación SUNAT en 1 clic',
              'Predicciones de demanda con ML',
              'Dashboard en tiempo real',
              'Multi-usuario con roles',
            ].map((feature) => (
              <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'rgba(240,128,32,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    stroke="var(--amber-400)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 5l2 2 4-4" />
                  </svg>
                </div>
                <span style={{ fontSize: 13, color: 'rgba(184,202,224,0.85)' }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            padding: '12px 16px',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: 'rgba(184,202,224,0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              marginBottom: 4,
            }}
          >
            Plataforma SaaS
          </div>
          <div style={{ fontSize: 13, color: 'rgba(184,202,224,0.8)' }}>
            Diseñado para PYMES peruanas
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.5px', margin: '0 0 6px' }}>
              Inicia sesión
            </h2>
            <p style={{ fontSize: 14, color: 'hsl(var(--muted-foreground))', margin: 0 }}>
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 20 }}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <circle cx="7" cy="7" r="6" />
                <path d="M7 4v3.5M7 9.5v.5" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={`form-input${error ? ' error' : ''}`}
                placeholder="tu@empresa.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                className={`form-input${error ? ' error' : ''}`}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <SpinnerIcon />
                  Ingresando...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: 24,
              paddingTop: 24,
              borderTop: '1px solid hsl(var(--border))',
              textAlign: 'center',
              fontSize: 13,
              color: 'hsl(var(--muted-foreground))',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <p style={{ margin: 0 }}>
              ¿No tienes cuenta?{' '}
              <Link to="/register" style={{ color: 'var(--navy-600)', fontWeight: 600, textDecoration: 'none' }}>
                Regístrate gratis
              </Link>
            </p>
            <p style={{ margin: 0 }}>
              ¿Eres parte del staff?{' '}
              <Link to="/staff/login" style={{ color: 'var(--navy-600)', fontWeight: 600, textDecoration: 'none' }}>
                Acceso staff
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
      <path
        d="M7 1v2M7 11v2M1 7h2M11 7h2M2.9 2.9l1.4 1.4M9.7 9.7l1.4 1.4M11.1 2.9L9.7 4.3M4.3 9.7l-1.4 1.4"
        opacity="0.4"
      />
      <path d="M7 1v2" opacity="1" />
    </svg>
  );
}
