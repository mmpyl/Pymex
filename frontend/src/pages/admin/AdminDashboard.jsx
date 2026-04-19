const Stat = ({ label, value }) => (
  <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: 12, padding: 16 }}>
    <p style={{ margin: 0, color: '#9ca3af', fontSize: 13 }}>{label}</p>
    <h3 style={{ margin: '8px 0 0 0', fontSize: 24, color: '#fff' }}>{value}</h3>
  </div>
);

const AdminDashboard = () => {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Dashboard Super Admin</h1>
      <p style={{ color: '#94a3b8' }}>Métricas globales del SaaS</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
        <Stat label="Total empresas" value="--" />
        <Stat label="Empresas activas" value="--" />
        <Stat label="MRR" value="--" />
        <Stat label="Churn" value="--" />
      </div>
    </div>
  );
};

export default AdminDashboard;
