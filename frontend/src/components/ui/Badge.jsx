const palette = {
  default: { bg: '#e2e8f0', color: '#1e293b' },
  success: { bg: '#dcfce7', color: '#166534' },
  warning: { bg: '#fef3c7', color: '#92400e' },
  danger: { bg: '#fee2e2', color: '#b91c1c' }
};

const Badge = ({ children, variant = 'default' }) => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    background: palette[variant].bg,
    color: palette[variant].color
  }}>{children}</span>
);

export default Badge;
