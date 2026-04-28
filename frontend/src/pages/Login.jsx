import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setForm({ ...form, email });
    if (email && !validateEmail(email)) {
      setEmailError('Ingresa un email válido');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(form.email)) {
      setEmailError('Ingresa un email válido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/login', form);
      login(data, form.remember);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[420px_1fr]">
      <aside className="relative hidden overflow-hidden bg-slate-950 px-11 py-12 lg:flex lg:flex-col">
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute bottom-10 -right-28 h-56 w-56 rounded-full border border-white/10" />
        <div className="absolute -left-16 -top-16 h-52 w-52 rounded-full bg-amber-500/10" />

        <div className="mb-auto flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-lg font-bold tracking-tight text-white">
            SP
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">SaPyme</span>
        </div>

        <div className="mb-auto">
          <h1 className="mb-4 text-3xl font-semibold leading-tight tracking-tight text-white">
            Gestiona tu PYME con inteligencia
          </h1>
          <p className="text-sm leading-6 text-slate-300/80">
            Ventas, inventario, facturación electrónica y predicciones ML — todo en una sola plataforma.
          </p>

          <div className="mt-8 space-y-3">
            {[
              'Facturación SUNAT en 1 clic',
              'Predicciones de demanda con ML',
              'Dashboard en tiempo real',
              'Multi-usuario con roles',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2.5">
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M2 5l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-xs text-slate-300/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="mb-1 text-[11px] uppercase tracking-[0.08em] text-slate-400">Plataforma SaaS</p>
          <p className="text-sm text-slate-300">Diseñado para PYMES peruanas</p>
        </div>
      </aside>

      <section className="flex items-center justify-center p-6 lg:p-10">
        <Card className="w-full max-w-md border-slate-200 shadow-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl">Inicia sesión</CardTitle>
            <CardDescription>Ingresa tus credenciales para continuar.</CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                id="email"
                type="email"
                label="Email"
                placeholder="tu@empresa.com"
                value={form.email}
                onChange={handleEmailChange}
                error={emailError}
                autoComplete="email"
                required
                autoFocus
                disabled={loading}
              />

              <Input
                id="password"
                type="password"
                label="Contraseña"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
                required
                disabled={loading}
                showPasswordToggle
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    disabled={loading}
                  />
                  <span className="text-sm text-slate-600">Recordarme</span>
                </label>
                <Link 
                  to="/recuperar-password" 
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {error}
                </div>
              )}

              <Button type="submit" className="h-11 w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <SpinnerIcon />
                    Ingresando...
                  </span>
                ) : (
                  'Iniciar sesión'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500">
            <p>
              ¿No tienes cuenta?{' '}
              <Link className="font-semibold text-indigo-600 hover:text-indigo-500" to="/register">
                Regístrate gratis
              </Link>
            </p>
            <p>
              ¿Eres parte del staff?{' '}
              <Link className="font-semibold text-slate-700 hover:text-slate-600" to="/staff/login">
                Acceso staff
              </Link>
            </p>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" className="opacity-25" />
      <path d="M21 12a9 9 0 0 0-9-9" className="opacity-90" />
    </svg>
  );
}
