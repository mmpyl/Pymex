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
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">ERP SaaS para PYMES</h1>
        <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-600">
          Controla ventas, inventario, gastos, reportes y predicciones con una plataforma moderna
          multiempresa.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
            to="/register"
          >
            Comenzar gratis
          </Link>
          <Link
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            to="/login"
          >
            Iniciar sesión
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((item) => (
          <Card className="border-slate-200" key={item}>
            <CardHeader>
              <CardTitle className="text-base">{item}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                Diseño SaaS moderno, responsive y enfocado en productividad empresarial.
              </p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
};

export default LandingPage;
