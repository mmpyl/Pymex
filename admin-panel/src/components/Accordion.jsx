import { useState } from "react";
import { clsx } from "clsx";

export function Accordion({ 
  children, 
  type = "single", 
  defaultValue, 
  value, 
  onValueChange,
  className,
}) {
  const [internalValue, setInternalValue] = useState(defaultValue || (type === "single" ? null : []));
  const controlledValue = value !== undefined ? value : internalValue;

  const handleValueChange = (itemValue) => {
    if (type === "single") {
      const newValue = controlledValue === itemValue ? null : itemValue;
      if (value === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    } else {
      const newValue = controlledValue.includes(itemValue)
        ? controlledValue.filter((v) => v !== itemValue)
        : [...controlledValue, itemValue];
      if (value === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    }
  };

  const isOpen = (itemValue) => {
    if (type === "single") {
      return controlledValue === itemValue;
    }
    return controlledValue.includes(itemValue);
  };

  return (
    <div className={clsx("w-full", className)}>
      {React.Children.map(children, (child) => {
        if (typeof child === "string") return child;
        
        return React.cloneElement(child, {
          isOpen: isOpen(child.props.value),
          onToggle: () => handleValueChange(child.props.value),
          type,
        });
      })}
    </div>
  );
}

export function AccordionItem({ 
  children, 
  value, 
  isOpen, 
  onToggle,
  className,
}) {
  return (
    <div
      className={clsx(
        "border-b border-gray-200 dark:border-gray-700 last:border-0",
        className
      )}
    >
      {React.Children.map(children, (child) => {
        if (typeof child === "string") return child;
        
        if (child.type === AccordionTrigger) {
          return React.cloneElement(child, {
            isOpen,
            onToggle,
          });
        }
        if (child.type === AccordionContent) {
          return React.cloneElement(child, {
            isOpen,
          });
        }
        return child;
      })}
    </div>
  );
}

export function AccordionTrigger({ 
  children, 
  isOpen, 
  onToggle,
  className,
  icon,
}) {
  return (
    <button
      onClick={onToggle}
      className={clsx(
        "w-full flex items-center justify-between py-4 px-2 text-left font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md",
        className
      )}
      aria-expanded={isOpen}
    >
      <span>{children}</span>
      {icon || (
        <svg
          className={clsx(
            "w-5 h-5 text-gray-500 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      )}
    </button>
  );
}

export function AccordionContent({ 
  children, 
  isOpen,
  className,
}) {
  return (
    <div
      className={clsx(
        "overflow-hidden transition-all duration-300 ease-in-out",
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}
    >
      <div className={clsx("pb-4 px-2 text-sm text-gray-600 dark:text-gray-400", className)}>
        {children}
      </div>
    </div>
  );
}
