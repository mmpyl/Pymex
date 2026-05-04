const badgeVariants = {
  default: 'bg-slate-200 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800'
};

const Badge = ({ children, variant = 'default' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${badgeVariants[variant]}`}>
    {children}
  </span>
);

export default Badge;
