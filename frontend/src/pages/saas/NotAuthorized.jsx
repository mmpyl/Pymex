import { Link } from 'react-router-dom';

const NotAuthorized = () => (
  <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-6 text-center">
    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Acceso denegado</h2>
    <p className="mt-2 text-slate-600">No cuentas con permisos para acceder a esta sección.</p>
    <Link
      to="/dashboard"
      className="mt-5 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
    >
      Volver al dashboard
    </Link>
  </div>
);

export default NotAuthorized;
