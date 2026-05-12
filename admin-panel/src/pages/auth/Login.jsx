import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      // TODO: Implementar llamada real al API de autenticación
      console.log('Login data:', data);
      
      // Simulación de login exitoso
      setTimeout(() => {
        navigate('/admin/dashboard');
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('Credenciales inválidas. Intente nuevamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-2">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Panel
          </CardTitle>
          <CardDescription className="text-base">
            Ingresa tus credenciales para acceder al panel de administración
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-5">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@empresa.com"
                  className="pl-10 h-11"
                  {...register('email', {
                    required: 'El correo es requerido',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Correo inválido',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11"
                  {...register('password', {
                    required: 'La contraseña es requerida',
                    minLength: {
                      value: 6,
                      message: 'Mínimo 6 caracteres',
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-600">Recordarme</span>
              </label>
              <Button
                type="button"
                variant="link"
                className="text-sm text-blue-600 hover:text-blue-700 p-0 h-auto"
                onClick={() => navigate('/admin/forgot-password')}
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isLoading}
            >
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </Button>
            
            <p className="text-sm text-gray-500 text-center">
              ¿No tienes una cuenta?{' '}
              <Button
                type="button"
                variant="link"
                className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
                onClick={() => navigate('/admin/register')}
              >
                Contactar administrador
              </Button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
