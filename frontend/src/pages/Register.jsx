import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({
    empresa_nombre: '',
    empresa_email: '',
    empresa_ruc: '',
    empresa_telefono: '',
    nombre: '',
    email: '',
    password: '',
    confirmar_password: '',
    terminos: false
  });
  
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [fortalezaPassword, setFortalezaPassword] = useState(0);
  const navigate = useNavigate();

  // Validar fortaleza de contraseña
  const validarFortalezaPassword = (password) => {
    let fortaleza = 0;
    if (password.length >= 8) fortaleza++;
    if (/[a-z]/.test(password)) fortaleza++;
    if (/[A-Z]/.test(password)) fortaleza++;
    if (/[0-9]/.test(password)) fortaleza++;
    if (/[^a-zA-Z0-9]/.test(password)) fortaleza++;
    return fortaleza;
  };

  // Validar campo individual
  const validarCampo = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'empresa_nombre':
        if (!value.trim()) error = 'El nombre de la empresa es requerido';
        else if (value.trim().length < 3) error = 'Mínimo 3 caracteres';
        break;
        
      case 'empresa_email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Email inválido';
        }
        break;
        
      case 'empresa_ruc':
        if (!value) error = 'El RUC es requerido';
        else if (!/^\d{11}$/.test(value)) error = 'El RUC debe tener 11 dígitos';
        break;
        
      case 'empresa_telefono':
        if (value && !/^[\d+\-\s()]{8,15}$/.test(value)) {
          error = 'Teléfono inválido (8-15 caracteres)';
        }
        break;
        
      case 'nombre':
        if (!value.trim()) error = 'El nombre es requerido';
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
        else if (!/[^a-zA-Z0-9]/.test(value)) error = 'Debe incluir un símbolo especial';
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
    
    // Actualizar fortaleza de contraseña
    if (name === 'password') {
      setFortalezaPassword(validarFortalezaPassword(value));
    }
    
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
    
    ['empresa_nombre', 'empresa_email', 'empresa_ruc', 'empresa_telefono', 'nombre', 'email', 'password', 'confirmar_password'].forEach(field => {
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
        empresa_nombre: form.empresa_nombre,
        empresa_email: form.empresa_email || null,
        empresa_ruc: form.empresa_ruc,
        empresa_telefono: form.empresa_telefono || null,
        nombre: form.nombre,
        email: form.email,
        password: form.password
      };
      
      await api.post('/auth/register', datosEnvio);
      toast.success('Empresa registrada. Ya puedes iniciar sesión.');
      navigate('/empresa/login');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al registrar');
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

  const getFortalezaColor = () => {
    if (fortalezaPassword <= 2) return 'bg-red-500';
    if (fortalezaPassword <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getFortalezaTexto = () => {
    if (fortalezaPassword <= 2) return 'Débil';
    if (fortalezaPassword <= 3) return 'Media';
    return 'Fuerte';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-navy-50 via-white to-amber-50 p-4">
      <Card className="w-full max-w-xl border-slate-200 shadow-2xl shadow-navy-900/10">
        <CardHeader className="pb-4">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-navy-600 to-navy-700 text-lg font-bold text-white shadow-md">
            SP
          </div>
          <CardTitle className="text-2xl font-semibold text-navy-900">Registra tu empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-navy-600">Datos de la empresa</p>
            {campo('Nombre de la empresa', 'empresa_nombre', 'text', 'Mi Empresa S.A.')}
            {campo('Email de la empresa (opcional)', 'empresa_email', 'email', 'empresa@email.com', false)}
            {campo('RUC', 'empresa_ruc', 'text', '20123456789')}
            {campo('Teléfono de contacto (opcional)', 'empresa_telefono', 'tel', '+51 999 999 999', false)}

            <p className="pt-2 text-xs font-bold uppercase tracking-wider text-navy-600">Tu cuenta de administrador</p>
            {campo('Tu nombre', 'nombre', 'text', 'Juan Pérez')}
            {campo('Tu email', 'email', 'email', 'tu@email.com')}
            
            {/* Campo de contraseña con indicador de fortaleza */}
            <div>
              <Input
                id="password"
                name="password"
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                error={errores.password}
                required
              />
              {form.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${getFortalezaColor()}`}
                        style={{ width: `${(fortalezaPassword / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-700">{getFortalezaTexto()}</span>
                  </div>
                  <ul className="mt-1 text-xs text-slate-600 space-y-0.5">
                    <li className={form.password.length >= 8 ? 'text-green-600 font-medium' : ''}>• Mínimo 8 caracteres</li>
                    <li className={/[a-z]/.test(form.password) ? 'text-green-600 font-medium' : ''}>• Letra minúscula</li>
                    <li className={/[A-Z]/.test(form.password) ? 'text-green-600 font-medium' : ''}>• Letra mayúscula</li>
                    <li className={/[0-9]/.test(form.password) ? 'text-green-600 font-medium' : ''}>• Número</li>
                    <li className={/[^a-zA-Z0-9]/.test(form.password) ? 'text-green-600 font-medium' : ''}>• Símbolo especial</li>
                  </ul>
                </div>
              )}
            </div>
            
            {campo('Confirmar contraseña', 'confirmar_password', 'password', '••••••••')}

            {/* Checkbox de términos y condiciones */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terminos"
                name="terminos"
                checked={form.terminos}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-navy-600 focus:ring-navy-500 cursor-pointer"
              />
              <label htmlFor="terminos" className="text-sm text-slate-700">
                Acepto los{' '}
                <a href="#" className="font-medium text-navy-600 hover:text-navy-500 underline">
                  términos y condiciones
                </a>{' '}
                y la{' '}
                <a href="#" className="font-medium text-navy-600 hover:text-navy-500 underline">
                  política de privacidad
                </a>
              </label>
            </div>
            {errores.terminos && (
              <p className="text-xs text-red-600">{errores.terminos}</p>
            )}

            <Button className="w-full bg-gradient-to-r from-navy-600 to-navy-700 text-white hover:from-navy-700 hover:to-navy-800 shadow-md hover:shadow-lg" type="submit" disabled={cargando}>
              {cargando ? 'Registrando...' : 'Crear cuenta'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-700">
            ¿Ya tienes cuenta?{' '}
            <Link to="/empresa/login" className="font-semibold text-navy-600 hover:text-navy-500">
              Inicia sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
