const PageHeader = ({ title, subtitle, action = null }) => (
  <header className="flex justify-between items-end mb-4">
    <div>
      <h1 className="m-0">{title}</h1>
      {subtitle && <p className="mt-1 mb-0 text-slate-500">{subtitle}</p>}
    </div>
    {action}
  </header>
);

export default PageHeader;
export { PageHeader };
