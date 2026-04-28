import { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";

export function Tooltip({ 
  children, 
  content, 
  position = "top", 
  delay = 200,
  className,
  arrow = true,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);
  const timeoutRef = useRef(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      adjustPosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const adjustPosition = () => {
    if (!tooltipRef.current || !triggerRef.current) return;

    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newPosition = position;

    // Check horizontal overflow
    if (position === "left" && tooltipRect.left < 0) {
      newPosition = "right";
    } else if (position === "right" && tooltipRect.right > viewportWidth) {
      newPosition = "left";
    }

    // Check vertical overflow
    if (position === "top" && tooltipRect.top < 0) {
      newPosition = "bottom";
    } else if (position === "bottom" && tooltipRect.bottom > viewportHeight) {
      newPosition = "top";
    }

    setActualPosition(newPosition);
  };

  useEffect(() => {
    if (isVisible) {
      window.addEventListener("resize", adjustPosition);
      return () => window.removeEventListener("resize", adjustPosition);
    }
  }, [isVisible]);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45",
    bottom: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45",
    left: "right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45",
    right: "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rotate-45",
  };

  return (
    <div
      ref={triggerRef}
      className="inline-block relative"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={clsx(
            "absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-gray-700 rounded-md shadow-lg whitespace-nowrap",
            positionClasses[actualPosition],
            className
          )}
          role="tooltip"
        >
          {content}
          {arrow && (
            <div
              className={clsx(
                "absolute w-2 h-2 bg-gray-900 dark:bg-gray-700",
                arrowClasses[actualPosition]
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}

export function TooltipProvider({ children }) {
  return <>{children}</>;
}
