export default function DashboardSaaS({ dashboard = {} }) {
  const cards = [
    ['Empresas', dashboard.total_empresas],
    ['Activas', dashboard.empresas_activas],
    ['Suspendidas', dashboard.empresas_suspendidas],
    ['MRR', `S/ ${dashboard.mrr || 0}`],
    ['Churn %', dashboard.churn_pct],
    ['Crec. mensual %', dashboard.crecimiento_mensual_pct]
  ];

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      {cards.map(([label, value]) => (
        <div key={label} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, minWidth: 180, background: '#f8fafc' }}>
          <div style={{ color: '#64748b' }}>{label}</div>
          <strong style={{ fontSize: 22 }}>{value ?? 0}</strong>
        </div>
      ))}
    </div>
  );
}
