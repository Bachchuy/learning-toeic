import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ id, label, error, hint, className = "", disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-wider text-[#475569]"
        >
          {label}
        </label>
        <input
          id={inputId}
          ref={ref}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          className={`h-11 w-full rounded-lg px-3.5 text-[16px] text-[#0F172A] bg-white transition-colors border ${
            error
              ? "border-[#BE123C] focus:border-[#BE123C]"
              : "border-[#8190A6] focus:border-[#2563EB]"
          } disabled:bg-[#F1F5F9] disabled:text-[#475569] disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-1 ${className}`}
          {...props}
        />
        {error ? (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-xs font-medium text-[#BE123C]"
          >
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-xs text-[#475569]">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
