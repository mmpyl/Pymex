const Input = ({ label, error, style = {}, ...props }) => (
  <label style={{ display: 'grid', gap: 6 }}>
    {label && <span style={{ fontSize: 13, color: '#334155' }}>{label}</span>}
    <input
      {...props}
      style={{
        border: '1px solid #cbd5e1',
        borderRadius: 10,
        padding: '10px 12px',
        outline: 'none',
        ...style
      }}
    />
    {error && <small style={{ color: '#dc2626' }}>{error}</small>}
  </label>
);

export default Input;
