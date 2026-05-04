import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();

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

  const submit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(form.email)) {
      setEmailError('Ingresa un email válido');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/admin/login', form);
      const { token, admin } = response.data;
      if (token) {
        loginAdmin({ token, admin }, form.remember);
      }
      navigate('/super-admin');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo iniciar sesión staff');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-xl">
        <CardHeader>
          <CardTitle>Login Staff</CardTitle>
          <CardDescription>
            Acceso para administradores, moderadores y otros perfiles internos.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <Input
              id="admin-email"
              type="email"
              label="Email"
              placeholder="staff@email.com"
              value={form.email}
              onChange={handleEmailChange}
              error={emailError}
              disabled={loading}
              required
              autoFocus
            />
            <Input
              id="admin-password"
              type="password"
              label="Contraseña"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              disabled={loading}
              required
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
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="border-t border-slate-200 pt-5 text-sm text-slate-500">
          ¿Eres cliente empresa?{' '}
          <Link to="/empresa/login" className="ml-1 font-semibold text-indigo-600 hover:text-indigo-500">
            Ir a login empresa
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
