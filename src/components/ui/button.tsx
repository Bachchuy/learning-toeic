import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "default" | "sm" | "cta";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "secondary",
      size = "default",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Height & padding rules from §5.5 (48px CTA / 44px secondary / 36px sm)
    const sizeClasses = {
      cta: "h-12 px-6 text-[16px] font-semibold", // 48px
      default: "h-11 px-4 text-[15px] font-medium", // 44px
      sm: "h-9 px-3 text-[13px] font-medium", // 36px
    }[size];

    const variantClasses = {
      primary:
        "bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-none border border-transparent",
      secondary:
        "bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#8190A6]",
      ghost:
        "bg-transparent hover:bg-[#F1F5F9] text-[#0F172A] border border-transparent",
      destructive:
        "bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#BE123C] border border-[#FECDD3]",
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center gap-2 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2 ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
