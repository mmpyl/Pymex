const PageHeader = ({ title, subtitle, action = null }) => (
  <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 16 }}>
    <div>
      <h1 style={{ margin: 0 }}>{title}</h1>
      {subtitle && <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>{subtitle}</p>}
    </div>
    {action}
  </header>
);

export default PageHeader;
