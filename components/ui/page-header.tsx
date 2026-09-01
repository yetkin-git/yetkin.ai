import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
  compact = false,
  tight = false,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  /** Anasayfa vb. — tek satırlık karşılama; yükseklik ve padding sade. */
  compact?: boolean;
  /** Katalog vb. — küçük başlık, altta tek satır açıklama, aksiyonlar başlık hizasında. */
  tight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:justify-between",
        tight ? "gap-2 sm:items-start" : compact ? "gap-2 sm:items-end" : "gap-4 sm:items-end",
        className,
      )}
    >
      <div className={cn(compact && !tight ? "max-w-3xl" : "max-w-2xl")}>
        {eyebrow ? (
          <p
            className={cn(
              "room-kicker text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--safir-deep)]",
              compact || tight ? "mb-1" : "mb-2",
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        {compact && !tight ? (
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
            <h1
              className={cn(
                "font-semibold tracking-tight text-[var(--foreground)]",
                tight ? "text-2xl" : "text-3xl",
              )}
            >
              {title}
            </h1>
            {description ? (
              <div
                className={cn(
                  "max-w-2xl text-pretty",
                  tight
                    ? "mt-1 text-sm leading-5 text-[var(--muted)]"
                    : "mt-2 text-base leading-7 text-slate-600",
                )}
              >
                {description}
              </div>
            ) : null}
          </>
        )}
      </div>
      {actions ? (
        <div className={cn("flex flex-wrap items-center gap-2", tight && "shrink-0")}>{actions}</div>
      ) : null}
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
