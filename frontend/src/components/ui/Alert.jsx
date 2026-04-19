const Alert = ({ title, description, variant = 'info' }) => {
  const styles = {
    info: { border: '#bfdbfe', bg: '#eff6ff', color: '#1e3a8a' },
    warning: { border: '#fde68a', bg: '#fffbeb', color: '#92400e' },
    danger: { border: '#fecaca', bg: '#fef2f2', color: '#991b1b' }
  }[variant];

  return (
    <div style={{ border: `1px solid ${styles.border}`, background: styles.bg, color: styles.color, borderRadius: 10, padding: 12 }}>
      <strong>{title}</strong>
      {description && <p style={{ margin: '6px 0 0 0' }}>{description}</p>}
    </div>
  );
};

export default Alert;
