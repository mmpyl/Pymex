import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (emailValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError('Ingresa un email válido');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setEmailError('Ingresa un email válido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Se ha enviado un enlace de recuperación a tu correo');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar el correo de recuperación');
      toast.error('Error al enviar el correo de recuperación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <section className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-navy-900">Recuperar contraseña</h1>
          <p className="mt-2 text-slate-600">
            Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Recuperación de cuenta</CardTitle>
            <CardDescription>
              Te enviaremos un enlace para crear una nueva contraseña
            </CardDescription>
          </CardHeader>

          <CardContent>
            {sent ? (
              <div className="rounded-md border border-green-200 bg-green-50 p-4 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-semibold text-green-900">¡Correo enviado!</h3>
                <p className="mt-1 text-sm text-green-700">
                  Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-3 text-sm font-medium text-green-700 hover:text-green-600"
                >
                  Enviar otro correo
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                    Correo electrónico
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@empresa.com"
                    value={email}
                    onChange={handleEmailChange}
                    className="mt-1 h-11"
                    disabled={loading}
                  />
                  {emailError && (
                    <p className="mt-1 text-sm text-red-600">{emailError}</p>
                  )}
                </div>

                {error && (
                  <div
                    className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="h-11 w-full bg-gradient-to-r from-navy-600 to-navy-700 text-white hover:from-navy-700 hover:to-navy-800 shadow-md hover:shadow-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
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
                        <path
                          d="M21 12a9 9 0 0 0-9-9"
                          className="opacity-90"
                        />
                      </svg>
                      Enviando...
                    </span>
                  ) : (
                    'Enviar enlace de recuperación'
                  )}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-600">
            <p>
              ¿Recordaste tu contraseña?{' '}
              <Link
                className="font-semibold text-navy-600 hover:text-navy-500"
                to="/login"
              >
                Iniciar sesión
              </Link>
            </p>
            <p>
              ¿No tienes cuenta?{' '}
              <Link
                className="font-semibold text-navy-600 hover:text-navy-500"
                to="/register"
              >
                Regístrate gratis
              </Link>
            </p>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
