import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
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
    <Input
      id={name}
      label={label}
      type={type}
      placeholder={placeholder}
      value={form[name]}
      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      required
    />
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-xl border-slate-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-center">Registra tu empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Datos de la empresa</p>
            {campo('Nombre de la empresa', 'empresa_nombre', 'text', 'Mi Empresa S.A.')}
            {campo('Email de la empresa', 'empresa_email', 'email', 'empresa@email.com')}
            {campo('RUC', 'empresa_ruc', 'text', '20123456789')}

            <p className="pt-2 text-xs font-bold uppercase tracking-wider text-indigo-600">Tu cuenta de administrador</p>
            {campo('Tu nombre', 'nombre', 'text', 'Juan Pérez')}
            {campo('Tu email', 'email', 'email', 'tu@email.com')}
            {campo('Contraseña', 'password', 'password', '••••••••')}

            <Button className="w-full" type="submit" disabled={cargando}>
              {cargando ? 'Registrando...' : 'Crear cuenta'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{' '}
            <Link to="/empresa/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Inicia sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
