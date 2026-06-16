import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const RegisterEmpresa = () => {
  const [form, setForm] = useState({
    nombre_empresa: '',
    ruc: '',
    nombre_admin: '',
    email: '',
    password: '',
    confirmar_password: '',
    terminos: false
  });
  
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  // Validar campo individual
  const validarCampo = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'nombre_empresa':
        if (!value.trim()) error = 'El nombre de la empresa es requerido';
        else if (value.trim().length < 2) error = 'Mínimo 2 caracteres';
        break;
        
      case 'ruc':
        if (!value) error = 'El RUC es requerido';
        else if (!/^\d{11}$/.test(value)) error = 'RUC inválido (debe ser 11 dígitos)';
        break;
        
      case 'nombre_admin':
        if (!value.trim()) error = 'El nombre del administrador es requerido';
        else if (value.trim().length < 2) error = 'Mínimo 2 caracteres';
        break;
        
      case 'email':
        if (!value) error = 'El email es requerido';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Email inválido';
        break;
        
      case 'password':
        if (!value) error = 'La contraseña es requerida';
        else if (value.length < 8) error = 'Mínimo 8 caracteres';
        else if (!/[a-z]/.test(value)) error = 'Debe incluir una letra minúscula';
        else if (!/[A-Z]/.test(value)) error = 'Debe incluir una letra mayúscula';
        else if (!/[0-9]/.test(value)) error = 'Debe incluir un número';
        break;
        
      case 'confirmar_password':
        if (!value) error = 'Confirma tu contraseña';
        else if (value !== form.password) error = 'Las contraseñas no coinciden';
        break;
        
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setForm({ ...form, [name]: newValue });
    
    // Validar campo en tiempo real (solo si tiene valor)
    if (newValue) {
      const error = validarCampo(name, newValue);
      setErrores(prev => ({ ...prev, [name]: error }));
    } else {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar todos los campos
    const nuevosErrores = {};
    let hayErrores = false;
    
    ['nombre_empresa', 'ruc', 'nombre_admin', 'email', 'password', 'confirmar_password'].forEach(field => {
      const error = validarCampo(field, form[field]);
      if (error) {
        nuevosErrores[field] = error;
        hayErrores = true;
      }
    });
    
    if (!form.terminos) {
      nuevosErrores.terminos = 'Debes aceptar los términos y condiciones';
      hayErrores = true;
    }
    
    setErrores(nuevosErrores);
    
    if (hayErrores) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }
    
    setCargando(true);
    try {
      const datosEnvio = {
        nombre_empresa: form.nombre_empresa,
        ruc: form.ruc,
        nombre_admin: form.nombre_admin,
        email: form.email,
        password: form.password
      };
      
      await api.post('/auth/register-empresa', datosEnvio);
      toast.success('Empresa registrada exitosamente. Ya puedes iniciar sesión.');
      navigate('/empresa/login');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al registrar empresa');
    } finally {
      setCargando(false);
    }
  };

  const campo = (label, name, type = 'text', placeholder = '', required = true) => (
    <Input
      id={name}
      name={name}
      label={label}
      type={type}
      placeholder={placeholder}
      value={form[name]}
      onChange={handleChange}
      error={errores[name]}
      required={required}
    />
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-lg border-slate-200 shadow-2xl shadow-indigo-900/10">
        <CardHeader className="pb-4">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-lg font-bold text-white shadow-md">
            EP
          </div>
          <CardTitle className="text-2xl font-semibold text-indigo-900">Registrar Empresa</CardTitle>
          <CardDescription>
            Crea una cuenta para tu empresa y comienza a usar nuestra plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {campo('Nombre de la Empresa', 'nombre_empresa', 'text', 'Tu Empresa S.A.C.')}
              {campo('RUC', 'ruc', 'text', '20123456789')}
            </div>
            
            {campo('Nombre del Administrador', 'nombre_admin', 'text', 'Juan Pérez')}
            {campo('Email Corporativo', 'email', 'email', 'admin@tuempresa.com')}
            {campo('Contraseña', 'password', 'password', '••••••••')}
            {campo('Confirmar Contraseña', 'confirmar_password', 'password', '••••••••')}

            {/* Checkbox de términos y condiciones */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terminos"
                name="terminos"
                checked={form.terminos}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="terminos" className="text-sm text-slate-700">
                Acepto los{' '}
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 underline">
                  términos y condiciones
                </a>{' '}
                y la{' '}
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 underline">
                  política de privacidad
                </a>
              </label>
            </div>
            {errores.terminos && (
              <p className="text-xs text-red-600">{errores.terminos}</p>
            )}

            <Button 
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-lg" 
              type="submit" 
              disabled={cargando}
            >
              {cargando ? 'Registrando...' : 'Crear cuenta de empresa'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-700">
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

export default RegisterEmpresa;
