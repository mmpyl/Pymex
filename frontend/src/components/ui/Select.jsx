const Select = ({ label, options = [], error, ...props }) => (
  <label style={{ display: 'grid', gap: 6 }}>
    {label && <span style={{ fontSize: 13, color: '#334155' }}>{label}</span>}
    <select
      {...props}
      style={{ border: '1px solid #cbd5e1', borderRadius: 10, padding: '10px 12px', background: '#fff' }}
    >
      {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
    {error && <small style={{ color: '#dc2626' }}>{error}</small>}
  </label>
);

export default Select;
