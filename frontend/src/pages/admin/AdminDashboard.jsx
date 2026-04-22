const Stat = ({ label, value }) => (
  <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
    <p className="m-0 text-xs text-slate-400">{label}</p>
    <h3 className="mt-2 text-2xl font-semibold text-white">{value}</h3>
  </div>
);

const AdminDashboard = () => {
  return (
    <div>
      <h1 className="mt-0 text-3xl font-bold tracking-tight text-white">Dashboard Super Admin</h1>
      <p className="mb-5 text-slate-400">Métricas globales del SaaS</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total empresas" value="--" />
        <Stat label="Empresas activas" value="--" />
        <Stat label="MRR" value="--" />
        <Stat label="Churn" value="--" />
      </div>
    </div>
  );
};

export default AdminDashboard;
