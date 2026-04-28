import { cva } from "class-variance-authority";
import { clsx } from "clsx";

const avatarVariants = cva(
  "inline-flex items-center justify-center font-medium rounded-full overflow-hidden shrink-0",
  {
    variants: {
      size: {
        xs: "w-6 h-6 text-xs",
        sm: "w-8 h-8 text-sm",
        md: "w-10 h-10 text-base",
        lg: "w-12 h-12 text-lg",
        xl: "w-16 h-16 text-xl",
        "2xl": "w-20 h-20 text-2xl",
      },
      variant: {
        solid: "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300",
        gradient: "bg-gradient-to-br from-primary-400 to-secondary-500 text-white",
        outline: "border-2 border-primary-200 dark:border-primary-800 bg-transparent",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "solid",
    },
  }
);

export function Avatar({ 
  src, 
  alt, 
  name, 
  size = "md", 
  variant = "solid", 
  className,
  fallback,
  ...props 
}) {
  const getInitials = (name) => {
    if (!name) return fallback || "?";
    const names = name.trim().split(" ");
    const initials = names.length > 1 
      ? names[0][0] + names[names.length - 1][0]
      : names[0][0];
    return initials.toUpperCase();
  };

  return (
    <div
      className={clsx(avatarVariants({ size, variant }), className)}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt || name || "Avatar"}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}

export function AvatarGroup({ children, max = 4, size = "md", className }) {
  const childArray = Array.isArray(children) ? children : [children];
  const visibleAvatars = childArray.slice(0, max);
  const remainingCount = childArray.length - max;

  return (
    <div className={clsx("flex -space-x-2", className)}>
      {visibleAvatars.map((child, index) =>
        child && typeof child === "object"
          ? { ...child, props: { ...child.props, size, key: index } }
          : child
      )}
      {remainingCount > 0 && (
        <div
          className={clsx(
            avatarVariants({ size, variant: "outline" }),
            "bg-white dark:bg-gray-800 border-2 border-white dark:border-gray-800"
          )}
        >
          <span className="text-xs font-medium">+{remainingCount}</span>
        </div>
      )}
    </div>
  );
}
