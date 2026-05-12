import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      // TODO: Implementar llamada real al API para reset de contraseña
      console.log('Reset password request:', data);
      
      setTimeout(() => {
        setIsSubmitted(true);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="space-y-3 text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              ¡Correo enviado!
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              Hemos enviado un enlace de recuperación a <strong>{register('email').ref?.value || 'tu correo'}</strong>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-gray-500">
              Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
            </p>
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-700 text-sm">
                ¿No recibiste el correo? Revisa tu carpeta de spam o intenta nuevamente.
              </AlertDescription>
            </Alert>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <Button 
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => navigate('/admin/login')}
            >
              Volver al login
            </Button>
            <Button
              variant="outline"
              className="w-full h-11"
              onClick={() => setIsSubmitted(false)}
            >
              Intentar con otro correo
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-2">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Recuperar contraseña
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-5">
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
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              className="w-full h-11 text-gray-600"
              onClick={() => navigate('/admin/login')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
