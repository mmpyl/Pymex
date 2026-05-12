import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const FEATURES = [
  'Dashboard en tiempo real',
  'Facturación electrónica',
  'Predicciones de demanda',
  'Panel Super Admin',
];

const LandingPage = () => {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <section className="mb-12 text-center">
        <h1 className="m-0 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">ERP SaaS para PYMES</h1>
        <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-600">
          Controla ventas, inventario, gastos, reportes y predicciones con una plataforma moderna
          multiempresa.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/register"
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-500"
          >
            Comenzar gratis
          </Link>
          <Link
            to="/login"
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-900 transition hover:bg-slate-50"
          >
            Iniciar sesión
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((item) => (
          <article key={item} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">{item}</h3>
            <p className="mt-2 text-sm text-slate-500">
              Diseño SaaS moderno, responsive y enfocado en productividad empresarial.
            </p>
          </article>
        ))}
      </section>
    </div>
  );
};

export default LandingPage;
