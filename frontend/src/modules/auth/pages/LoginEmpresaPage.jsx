import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function LoginEmpresa() {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
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
      const { data } = await api.post('/auth/login-empresa', form);
      // Guardar token y datos de la empresa
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.usuario));
      localStorage.setItem('empresa', JSON.stringify(data.empresa));
      
      if (form.remember) {
        localStorage.setItem('remember', 'true');
      }
      
      toast.success('Bienvenido a tu empresa');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 lg:grid lg:grid-cols-[420px_1fr]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-b from-indigo-950 via-indigo-900 to-indigo-800 px-11 py-12 lg:flex lg:flex-col">
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full border border-blue-400/10" />
        <div className="absolute bottom-10 -right-28 h-56 w-56 rounded-full border border-blue-400/10" />
        <div className="absolute -left-16 -top-16 h-52 w-52 rounded-full bg-blue-400/15" />

        <div className="mb-auto flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-lg font-bold tracking-tight text-white shadow-lg shadow-blue-500/25">
            EP
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">Empresas</span>
        </div>

        <div className="mb-auto">
          <h1 className="mb-4 text-3xl font-semibold leading-tight tracking-tight text-white">
            Gestiona tu empresa
          </h1>
          <p className="text-sm leading-6 text-indigo-200/90">
            Accede al panel de administración de tu empresa y gestiona todos tus recursos.
          </p>

          <div className="mt-8 space-y-3">
            {[
              'Dashboard empresarial',
              'Gestión de usuarios',
              'Reportes y análisis',
              'Configuración de empresa',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2.5">
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/25 text-blue-400">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M2 5l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-xs text-indigo-100/95">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
          <p className="mb-1 text-[11px] uppercase tracking-[0.08em] text-blue-400">Portal Empresas</p>
          <p className="text-sm text-indigo-100">Acceso exclusivo para clientes</p>
        </div>
      </aside>

      <section className="flex items-center justify-center p-6 lg:p-10">
        <Card className="w-full max-w-md border-slate-200 shadow-2xl shadow-indigo-900/10">
          <CardHeader className="space-y-1 pb-6">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-lg font-bold text-white shadow-md">
              EP
            </div>
            <CardTitle className="text-2xl font-semibold text-indigo-900">Acceso Empresas</CardTitle>
            <CardDescription className="text-slate-600">Ingresa las credenciales de tu empresa.</CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                id="email"
                type="email"
                label="Email Corporativo"
                placeholder="admin@tuempresa.com"
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
                  <span className="text-sm font-medium text-slate-700">Recordarme</span>
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

              <Button type="submit" className="h-11 w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-lg" disabled={loading}>
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

          <CardFooter className="flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-600">
            <p>
              ¿No tienes cuenta de empresa?{' '}
              <Link className="font-semibold text-indigo-600 hover:text-indigo-500" to="/register">
                Regístrate gratis
              </Link>
            </p>
            <p>
              ¿Eres usuario individual?{' '}
              <Link className="font-semibold text-slate-700 hover:text-slate-600" to="/login">
                Acceso personal
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
