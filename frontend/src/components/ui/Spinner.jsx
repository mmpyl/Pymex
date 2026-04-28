import { clsx } from "clsx";

const sizeVariants = {
  xs: "w-3 h-3 border",
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-3",
  xl: "w-10 h-10 border-3",
  "2xl": "w-12 h-12 border-4",
};

const colorVariants = {
  default: "border-gray-200 dark:border-gray-700",
  primary: "border-primary-200 dark:border-primary-800",
  white: "border-white/30",
};

const barColorVariants = {
  default: "border-t-gray-600 dark:border-t-gray-300",
  primary: "border-t-primary-600 dark:border-t-primary-400",
  white: "border-t-white",
};

export function Spinner({ 
  size = "md", 
  color = "default",
  className,
  label,
}) {
  return (
    <div className={clsx("inline-flex flex-col items-center justify-center gap-2", className)}>
      <div
        className={clsx(
          "rounded-full animate-spin",
          sizeVariants[size],
          colorVariants[color],
          barColorVariants[color]
        )}
        role="status"
        aria-label={label || "Loading"}
      >
        {label && <span className="sr-only">{label}</span>}
      </div>
    </div>
  );
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  message = "Cargando...",
  backdrop = "light",
}) {
  if (!isLoading) return children;

  const backdropStyles = {
    light: "bg-white/80 dark:bg-gray-900/80",
    dark: "bg-gray-900/90",
    blur: "backdrop-blur-sm bg-white/50 dark:bg-gray-900/50",
  };

  return (
    <div className="relative">
      {children}
      <div
        className={clsx(
          "absolute inset-0 z-50 flex flex-col items-center justify-center",
          backdropStyles[backdrop]
        )}
      >
        <Spinner size="lg" color="primary" />
        {message && (
          <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export function LoadingPage({ message = "Cargando..." }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Spinner size="xl" color="primary" />
        {message && (
          <p className="mt-4 text-base font-medium text-gray-600 dark:text-gray-400">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
