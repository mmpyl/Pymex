import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import useAsyncOperation from '../hooks/useAsyncOperation';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSuccess = (data) => {
        login(data);
        navigate('/dashboard');
    };

    const { loading, execute } = useAsyncOperation(
        handleSuccess,
        null,
        {
            showToast: false, // Manejamos los toasts manualmente para personalizar
            successMessage: `Bienvenido`,
        }
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const { data } = await execute(() => api.post('/auth/login', form));
            toast.success(`Bienvenido ${data.usuario.nombre}`);
        } catch (error) {
            // El error ya fue manejado por el hook y mostrado en el interceptor
            // No hacemos nada adicional aquí
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <Card className="w-full max-w-md shadow-2xl border-slate-200">
                <CardHeader className="space-y-1 text-center pb-8">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        SaaS PYMES
                    </CardTitle>
                    <CardDescription className="text-slate-500 text-base">
                        Inicia sesión como usuario de empresa
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                                className="h-11"
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                                Contraseña
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                                className="h-11"
                                disabled={loading}
                            />
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full h-11 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Ingresando...
                                </span>
                            ) : (
                                'Ingresar'
                            )}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 pt-2">
                    <p className="text-center text-sm text-slate-500">
                        ¿No tienes cuenta?{' '}
                        <Link 
                            to="/register" 
                            className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                        >
                            Regístrate aquí
                        </Link>
                    </p>

                    <p className="text-center text-xs text-slate-400">
                        ¿Eres parte del staff?{' '}
                        <Link to="/staff/login" className="font-semibold text-slate-600 hover:text-slate-500 transition-colors">
                            Acceso staff
                        </Link>
                    </p>

                    <div className="text-xs text-center text-slate-400">
                        <p>Protegido con autenticación segura</p>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Login;