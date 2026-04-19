import StatCard from '../../components/ui/StatCard';

const DashboardPage = () => (
  <div style={{ display: 'grid', gap: 16 }}>
    <div>
      <h1 style={{ marginBottom: 4 }}>Super Admin Dashboard</h1>
      <p style={{ margin: 0, color: '#94a3b8' }}>Vista global del negocio SaaS</p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
      <StatCard label="Total empresas" value="124" />
      <StatCard label="Empresas activas" value="109" />
      <StatCard label="MRR" value="S/ 48,920" />
      <StatCard label="Churn" value="2.8%" />
      <StatCard label="Plan más usado" value="Pro" />
      <StatCard label="Nuevas empresas" value="14" />
    </div>
  </div>
);

export default DashboardPage;
