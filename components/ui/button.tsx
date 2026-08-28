import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export type ButtonVariant = "primary" | "ghost" | "secondary" | "outline" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--safir)] text-[var(--btn-on-accent)] shadow-[0_8px_18px_rgba(26,140,255,0.28)] hover:bg-[var(--safir-deep)] disabled:opacity-50",
  ghost: "bg-transparent text-[var(--foreground)] hover:bg-[var(--surface-muted)] disabled:opacity-50",
  secondary:
    "bg-[var(--surface-ink)] text-white hover:bg-[var(--surface-ink-soft)] disabled:opacity-50",
  outline:
    "border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--safir)] hover:text-[var(--safir-deep)] disabled:opacity-50",
  danger: "bg-[var(--rose-soft)] text-[var(--rose)] hover:bg-[var(--rose)] hover:text-white disabled:opacity-50",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "min-h-11 px-3 text-xs sm:h-8 sm:min-h-8",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export function buttonClassName(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className = "",
): string {
  return cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition duration-150",
    VARIANT[variant],
    SIZE[size],
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button type="button" className={buttonClassName(variant, size, className)} {...props}>
      {children}
    </button>
  );
}
