import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="room-kicker mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--safir-deep)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">{title}</h1>
        {description ? <div className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</div> : null}
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
  return (
    <div className={cn("mx-auto max-w-6xl space-y-8", className)} {...rest}>
      {children}
    </div>
  );
}
