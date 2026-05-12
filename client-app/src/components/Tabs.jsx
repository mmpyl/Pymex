import { useState } from "react";
import { clsx } from "clsx";

export function Tabs({ 
  children, 
  defaultValue, 
  value, 
  onValueChange, 
  className,
  variant = "default",
}) {
  const [internalValue, setInternalValue] = useState(defaultValue || value);
  const controlledValue = value !== undefined ? value : internalValue;

  const handleValueChange = (newValue) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <div className={clsx("w-full", className)}>
      {React.Children.map(children, (child) => {
        if (typeof child === "string") return child;
        
        return React.cloneElement(child, {
          value: controlledValue,
          onValueChange: handleValueChange,
          variant,
        });
      })}
    </div>
  );
}

export function TabsList({ 
  children, 
  className,
  variant = "default",
}) {
  const variantClasses = {
    default: "bg-gray-100 dark:bg-gray-800 p-1 rounded-lg inline-flex",
    underline: "border-b border-gray-200 dark:border-gray-700 flex gap-6",
    pills: "flex gap-2",
  };

  return (
    <div
      className={clsx(variantClasses[variant], className)}
      role="tablist"
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ 
  children, 
  value, 
  onClick,
  className,
  variant = "default",
  ...props
}) {
  const isActive = props.value === value;

  const variantClasses = {
    default: clsx(
      "px-4 py-2 text-sm font-medium rounded-md transition-all",
      isActive
        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
    ),
    underline: clsx(
      "pb-3 text-sm font-medium transition-colors border-b-2",
      isActive
        ? "border-primary-600 text-primary-600 dark:text-primary-500"
        : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
    ),
    pills: clsx(
      "px-4 py-2 text-sm font-medium rounded-full transition-all",
      isActive
        ? "bg-primary-600 text-white"
        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
    ),
  };

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => onClick?.(value)}
      className={clsx(variantClasses[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ 
  children, 
  value, 
  className,
  ...props
}) {
  const isActive = props.value === value;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      className={clsx("mt-4 animate-in fade-in slide-in-from-top-2 duration-200", className)}
      {...props}
    >
      {children}
    </div>
  );
}
