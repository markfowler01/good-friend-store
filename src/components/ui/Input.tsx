import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full px-4 py-3 border rounded-lg outline-none transition text-sm",
            error
              ? "border-bca-red focus:ring-2 focus:ring-red-200"
              : "border-gray-300 focus:ring-2 focus:ring-bca-teal focus:border-transparent",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-bca-red">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
