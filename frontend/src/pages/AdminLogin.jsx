import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import api from '../api/axios';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/admin/login', form);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo iniciar sesión staff');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-md border-slate-200 shadow-xl">
        <CardHeader>
          <CardTitle>Login Staff</CardTitle>
          <CardDescription>
            Acceso para administradores, moderadores y otros perfiles internos.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <Input
              id="staff-email"
              type="email"
              label="Email"
              placeholder="staff@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              disabled={loading}
            />
            <Input
              id="staff-password"
              type="password"
              label="Contraseña"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              disabled={loading}
            />

            {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-sm text-slate-500">
          ¿Eres cliente empresa?{' '}
          <Link className="ml-1 font-semibold text-indigo-600 hover:text-indigo-500" to="/empresa/login">
            Ir a login empresa
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
