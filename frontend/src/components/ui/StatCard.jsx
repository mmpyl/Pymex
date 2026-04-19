const StatCard = ({ label, value, trend }) => (
  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
    <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>{label}</p>
    <h3 style={{ margin: '8px 0', fontSize: 24 }}>{value}</h3>
    {trend && <p style={{ margin: 0, color: trend > 0 ? '#16a34a' : '#dc2626' }}>{trend > 0 ? '+' : ''}{trend}%</p>}
  </div>
);

export default StatCard;
