import { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";

export function Dropdown({ 
  trigger, 
  children, 
  position = "bottom-right", 
  className,
  align = "right",
  closeOnClick = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const positionClasses = {
    "bottom-left": "top-full left-0 mt-2",
    "bottom-right": "top-full right-0 mt-2",
    "bottom-center": "top-full left-1/2 -translate-x-1/2 mt-2",
    "top-left": "bottom-full left-0 mb-2",
    "top-right": "bottom-full right-0 mb-2",
    "top-center": "bottom-full left-1/2 -translate-x-1/2 mb-2",
  };

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (onClick) => {
    if (closeOnClick) {
      setIsOpen(false);
    }
    if (onClick) {
      onClick();
    }
  };

  // Clone children to add click handlers
  const clonedChildren = React.Children.map(children, (child) => {
    if (typeof child === "string") return child;
    
    const originalOnClick = child.props?.onClick;
    return React.cloneElement(child, {
      onClick: () => handleItemClick(originalOnClick),
    });
  });

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <div onClick={handleTriggerClick}>
        {trigger}
      </div>
      
      {isOpen && (
        <div
          className={clsx(
            "absolute z-50 min-w-[200px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1",
            positionClasses[position],
            className
          )}
        >
          {clonedChildren}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ 
  children, 
  icon, 
  onClick, 
  disabled, 
  divider,
  className,
}) {
  if (divider) {
    return <hr className="my-1 border-gray-200 dark:border-gray-700" />;
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors",
        disabled
          ? "text-gray-400 cursor-not-allowed"
          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700",
        className
      )}
    >
      {icon && (
        <span className="w-5 h-5 flex items-center justify-center text-gray-500">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}

export function DropdownHeader({ children, className }) {
  return (
    <div
      className={clsx(
        "px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700",
        className
      )}
    >
      {children}
    </div>
  );
}
