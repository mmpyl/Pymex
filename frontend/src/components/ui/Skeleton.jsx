import { cn } from '@/lib/utils';

/**
 * Componente Skeleton para loading states
 * Mejora la percepción de rendimiento mientras se cargan datos
 */
export const Skeleton = ({ className, ...props }) => (
  <div
    className={cn(
      "animate-pulse rounded-md bg-slate-200 dark:bg-slate-700",
      className
    )}
    {...props}
  />
);

/**
 * Skeleton para texto
 */
export const SkeletonText = ({ lines = 3, className }) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={cn(
          "h-4 w-full",
          i === lines - 1 && "w-3/4"
        )}
      />
    ))}
  </div>
);

/**
 * Skeleton para tarjetas
 */
export const SkeletonCard = () => (
  <div className="rounded-lg border bg-card p-6 shadow-sm space-y-4">
    <Skeleton className="h-6 w-1/3" />
    <SkeletonText lines={3} />
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-9 w-24" />
      <Skeleton className="h-9 w-24" />
    </div>
  </div>
);

/**
 * Skeleton para tablas
 */
export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
    <div className="p-4 border-b">
      <Skeleton className="h-6 w-1/4" />
    </div>
    <div className="divide-y">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

/**
 * Skeleton para estadísticas
 */
export const SkeletonStat = () => (
  <div className="rounded-lg border bg-card p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
    <Skeleton className="h-8 w-32 mt-4" />
    <Skeleton className="h-3 w-20 mt-2" />
  </div>
);

/**
 * Skeleton para avatar
 */
export const SkeletonAvatar = ({ size = 'md' }) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <Skeleton className={cn("rounded-full", sizes[size])} />
  );
};

export default {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
  SkeletonStat,
  SkeletonAvatar,
};
