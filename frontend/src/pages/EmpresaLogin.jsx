import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function EmpresaLogin() {
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-xl">
        <CardHeader className="space-y-1 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold tracking-tight text-white">
              EP
            </div>
            <div>
              <CardTitle className="text-2xl">Acceso Empresas</CardTitle>
              <CardDescription>Ingresa tus credenciales para continuar.</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              id="empresa-email"
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
              id="empresa-password"
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
