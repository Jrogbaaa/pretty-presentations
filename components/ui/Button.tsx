import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "icon";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded transition-fast focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles = {
      primary: "bg-primary text-white hover:bg-primary-hover active:bg-primary-active",
      secondary: "bg-transparent text-text-secondary border border-border hover:bg-background",
      icon: "bg-transparent text-text-secondary hover:bg-background active:bg-border",
    };

    const sizeStyles = {
      sm: "h-8 px-md text-caption",
      md: "h-9 px-lg text-body",
      lg: "h-10 px-xl text-body",
    };

    const iconSizeStyles = {
      sm: "w-8 h-8",
      md: "w-9 h-9",
      lg: "w-10 h-10",
    };

    const sizeClass = variant === "icon" ? iconSizeStyles[size] : sizeStyles[size];

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeClass} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;

