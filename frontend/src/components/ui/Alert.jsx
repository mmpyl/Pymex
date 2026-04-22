const Alert = ({ title, description, variant = 'info' }) => {
  const variantStyles = {
    info: { border: 'border-blue-200 dark:border-blue-800', bg: 'bg-blue-50 dark:bg-blue-900/20', color: 'text-blue-900 dark:text-blue-300' },
    warning: { border: 'border-yellow-200 dark:border-yellow-800', bg: 'bg-yellow-50 dark:bg-yellow-900/20', color: 'text-yellow-900 dark:text-yellow-300' },
    danger: { border: 'border-red-200 dark:border-red-800', bg: 'bg-red-50 dark:bg-red-900/20', color: 'text-red-900 dark:text-red-300' }
  }[variant];
  
  return (
    <div className={`border ${variantStyles.border} ${variantStyles.bg} ${variantStyles.color} rounded-lg p-3`}>
      <strong>{title}</strong>
      {description && <p className="mt-1.5 mb-0">{description}</p>}
    </div>
  );
};

export default Alert;
