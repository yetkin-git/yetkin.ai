import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export type StatItem = {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
};

export function StatGrid({ items, columns = 4 }: { items: StatItem[]; columns?: 2 | 3 | 4 }) {
  const grid =
    columns === 2 ? "sm:grid-cols-2" : columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4";
  return (
    <dl className={cn("grid grid-cols-1 gap-3", grid)}>
      {items.map((item) => (
        <div
          key={item.label}
          className="room-stat rounded-2xl border border-[color-mix(in_srgb,var(--foreground)_10%,transparent)] bg-[var(--surface)] p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {item.label}
            </dt>
            {item.icon ? (
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--safir-soft)] text-[var(--safir-deep)]">
                {item.icon}
              </span>
            ) : null}
          </div>
          <dd className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">{item.value}</dd>
          {item.hint ? <p className="mt-1 text-xs text-[var(--muted)]">{item.hint}</p> : null}
        </div>
      ))}
    </dl>
  );
}
