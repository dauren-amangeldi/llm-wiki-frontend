import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
}

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50";
  const variants: Record<string, string> = {
    primary: "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover-bg)] shadow-[var(--btn-primary-shadow)] px-4 py-2",
    secondary: "border border-[var(--border)] bg-transparent text-[var(--text)] hover:bg-[var(--accent-soft)] px-4 py-2",
    ghost: "bg-transparent text-[var(--text-muted)] hover:bg-[var(--accent-soft)] px-2 py-1",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
