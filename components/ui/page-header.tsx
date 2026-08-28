import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  /** Anasayfa vb. — tek satırlık karşılama; yükseklik ve padding sade. */
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-end sm:justify-between",
        compact ? "gap-2" : "gap-4",
        className,
      )}
    >
      <div className={cn(compact ? "max-w-3xl" : "max-w-2xl")}>
        {eyebrow ? (
          <p
            className={cn(
              "room-kicker text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--safir-deep)]",
              compact ? "mb-1" : "mb-2",
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        {compact ? (
          <h1 className="text-pretty text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">
            <span>{title}</span>
            {description ? (
              <span className="font-normal text-[var(--muted)]">
                <span aria-hidden="true" className="mx-2 text-[var(--border)]">
                  ·
                </span>
                {description}
              </span>
            ) : null}
          </h1>
        ) : (
          <>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">{title}</h1>
            {description ? (
              <div className="mt-2 max-w-2xl text-pretty text-sm leading-6 text-[var(--muted)]">
                {description}
              </div>
            ) : null}
          </>
        )}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function RoomFrame({
  children,
  className,
  ...rest
}: {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>) {
  const spacingOverride = Boolean(
    className?.split(/\s+/).some((token) => /!?space-y-/.test(token)),
  );
  return (
    <div className={cn("mx-auto max-w-6xl", !spacingOverride && "space-y-8", className)} {...rest}>
      {children}
    </div>
  );
}
