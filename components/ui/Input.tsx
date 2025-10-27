import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-caption text-text-muted font-semibold mb-md uppercase tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full h-9 px-md border border-border rounded text-body text-text-primary bg-background-surface focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-fast disabled:opacity-50 disabled:bg-background ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-sm text-caption text-error">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;

