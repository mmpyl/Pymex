const StatCard = ({ label, value, trend }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4">
    <p className="m-0 text-slate-500 text-sm">{label}</p>
    <h3 className="my-2 text-2xl">{value}</h3>
    {trend && <p className="m-0" style={{ color: trend > 0 ? '#16a34a' : '#dc2626' }}>{trend > 0 ? '+' : ''}{trend}%</p>}
  </div>
);

export default StatCard;
