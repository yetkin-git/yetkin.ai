import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export type CardVariant = "default" | "glass" | "featured" | "ink";

const VARIANT: Record<CardVariant, string> = {
  default:
    "border border-[color-mix(in_srgb,var(--foreground)_10%,transparent)] bg-[var(--surface)] shadow-sm",
  glass:
    "rail-glass border border-[color-mix(in_srgb,var(--foreground)_10%,transparent)] shadow-sm",
  featured:
    "border border-[color-mix(in_srgb,var(--safir)_18%,transparent)] bg-[var(--surface)] shadow-sm",
  ink: "border border-white/10 bg-[var(--surface-ink)] text-white shadow-sm",
};

export function Card({
  title,
  eyebrow,
  action,
  children,
  variant = "default",
  className = "",
  bodyClassName = "",
}: {
  title?: ReactNode;
  eyebrow?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "room-card rounded-[var(--radius-card)] p-6 transition-[border-color,box-shadow] duration-200",
        VARIANT[variant],
        className,
      )}
    >
      {eyebrow || title || action ? (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                {eyebrow}
              </p>
            ) : null}
            {title ? <h2 className="text-lg font-semibold tracking-tight">{title}</h2> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      <div className={cn("text-sm leading-6 text-[var(--muted)]", bodyClassName)}>{children}</div>
    </section>
  );
}
