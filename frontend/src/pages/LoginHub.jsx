import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';

const cardStyle = 'w-full max-w-md border-slate-200 shadow-md hover:shadow-xl transition-shadow';

export default function LoginHub() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid gap-6 md:grid-cols-2">
        <Card className={cardStyle}>
          <CardHeader>
            <CardTitle>Acceso Staff</CardTitle>
            <CardDescription>
              Para administradores, moderadores y otros perfiles internos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/staff/login"
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Ir a login de staff
            </Link>
          </CardContent>
        </Card>

        <Card className={cardStyle}>
          <CardHeader>
            <CardTitle>Acceso Empresas</CardTitle>
            <CardDescription>
              Para usuarios clientes de empresa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/empresa/login"
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Ir a login de empresa
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
