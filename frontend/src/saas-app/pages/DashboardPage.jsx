import { BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';

const ventasData = [
  { mes: 'Ene', ventas: 18000, gastos: 9000 },
  { mes: 'Feb', ventas: 22000, gastos: 11000 },
  { mes: 'Mar', ventas: 26000, gastos: 14000 },
  { mes: 'Abr', ventas: 30000, gastos: 14500 }
];

const topProductos = [
  { nombre: 'Producto A', ventas: 120 },
  { nombre: 'Producto B', ventas: 93 },
  { nombre: 'Producto C', ventas: 77 }
];

const DashboardPage = () => {
  const ventasMes = 30000;
  const gastosMes = 14500;
  const utilidad = ventasMes - gastosMes;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <h1 style={{ marginBottom: 4 }}>Dashboard Empresa</h1>
        <p style={{ margin: 0, color: '#64748b' }}>Resumen operativo y financiero</p>
      </div>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
        <StatCard label="Ventas del mes" value={`S/ ${ventasMes.toLocaleString()}`} trend={8} />
        <StatCard label="Gastos del mes" value={`S/ ${gastosMes.toLocaleString()}`} trend={-2} />
        <StatCard label="Utilidad" value={`S/ ${utilidad.toLocaleString()}`} trend={11} />
        <StatCard label="Ticket promedio" value="S/ 84" trend={6} />
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        <Card title="Ventas vs Gastos">
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ventasData}>
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line dataKey="ventas" stroke="#2563eb" strokeWidth={3} />
                <Line dataKey="gastos" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Top productos">
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductos} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="nombre" width={80} />
                <Tooltip />
                <Bar dataKey="ventas" fill="#6366f1" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 12 }}>
        <Card title="Alertas">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Stock bajo en 3 productos.</li>
            <li>1 pago de proveedor pendiente.</li>
          </ul>
        </Card>
        <Card title="Predicciones ML">
          <p style={{ marginTop: 0 }}>Demanda esperada próxima semana: <strong>+12%</strong></p>
          <p style={{ marginBottom: 0 }}>Riesgo quiebre stock: <strong>Moderado</strong></p>
        </Card>
      </section>
    </div>
  );
};

export default DashboardPage;
