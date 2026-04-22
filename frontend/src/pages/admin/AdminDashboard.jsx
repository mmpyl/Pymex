const Stat = ({ label, value }) => (
  <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
    <p className="text-xs text-slate-400">{label}</p>
    <h3 className="mt-2 text-2xl font-semibold text-white">{value}</h3>
  </div>
);

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Dashboard Super Admin</h1>
        <p className="mt-1 text-slate-400">Métricas globales del SaaS</p>
      </div>

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
