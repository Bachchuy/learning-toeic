import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "default" — flat Swiss card (border 1px, no shadow)
   *  "question" — left-border accent (Swiss precision mark for question stems)
   *  "stat"     — compact KPI tile with subtle warm background */
  variant?: "default" | "question" | "stat";
}

export function Card({
  className = "",
  variant = "default",
  children,
  ...props
}: CardProps) {
  const variantClasses = {
    default: "bg-white border border-[#E2E8F0] rounded-lg p-5",
    question:
      "bg-white border border-[#E2E8F0] rounded-lg p-5 border-l-[3px] border-l-[#2563EB]",
    stat: "bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4",
  }[variant];

  return (
    <div
      className={`${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex flex-col gap-1 mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-lg font-semibold tracking-tight text-[#0F172A] ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm text-[#475569] ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`space-y-3 ${className}`} {...props}>
      {children}
    </div>
  );
}
