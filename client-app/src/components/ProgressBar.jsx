import { cva } from "class-variance-authority";
import { clsx } from "clsx";

const progressVariants = cva(
  "w-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700",
  {
    variants: {
      size: {
        sm: "h-1",
        md: "h-2",
        lg: "h-3",
        xl: "h-4",
      },
      variant: {
        default: "",
        success: "",
        warning: "",
        danger: "",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

const barVariants = {
  default: "bg-primary-600 dark:bg-primary-500",
  success: "bg-green-600 dark:bg-green-500",
  warning: "bg-yellow-500 dark:bg-yellow-400",
  danger: "bg-red-600 dark:bg-red-500",
};

export function ProgressBar({ 
  value = 0, 
  max = 100, 
  size = "md", 
  variant = "default",
  showValue = false,
  animated = true,
  className,
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={clsx("w-full", className)}>
      <div className={clsx(progressVariants({ size, variant }))}>
        <div
          className={clsx(
            "h-full rounded-full transition-all duration-500 ease-out",
            barVariants[variant],
            animated && "animate-pulse"
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      {showValue && (
        <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 text-right">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}

export function ProgressCircle({ 
  value = 0, 
  max = 100, 
  size = 120, 
  strokeWidth = 8,
  variant = "default",
  showValue = true,
  label,
  className,
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colors = {
    default: "text-primary-600 dark:text-primary-500",
    success: "text-green-600 dark:text-green-500",
    warning: "text-yellow-500 dark:text-yellow-400",
    danger: "text-red-600 dark:text-red-500",
  };

  return (
    <div 
      className={clsx("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        className="transform -rotate-90 w-full h-full"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          className="text-gray-200 dark:text-gray-700"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className={clsx("transition-all duration-500 ease-out", colors[variant])}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(percentage)}%
          </span>
          {label && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
