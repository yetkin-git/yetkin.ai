import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { StatItem } from "@/components/ui/stat-grid";

type LinkHref = ComponentProps<typeof Link>["href"];

export function PulseCard({
  title,
  live,
  liveHint = "Canlı",
  stats,
  children,
  href,
  hrefLabel,
}: {
  title: string;
  live: boolean;
  liveHint?: string;
  stats: StatItem[];
  children?: ReactNode;
  href: LinkHref;
  hrefLabel: string;
}) {
  const metrics = stats.slice(0, 2);

  return (
    <Link
      href={href}
      aria-label={hrefLabel}
      className="group block h-full min-w-0 rounded-[var(--radius-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--safir-soft)] focus-visible:ring-offset-2"
    >
      <Card
        variant="default"
        className="flex h-full min-w-0 flex-col !p-4 shadow-sm transition-[border-color,box-shadow] duration-200 group-hover:border-[color-mix(in_srgb,var(--safir)_28%,transparent)]"
        title={title}
        action={<Badge tone={live ? "emerald" : "neutral"}>{live ? liveHint : "Boş nabız"}</Badge>}
        bodyClassName="flex min-h-0 flex-1 flex-col text-[var(--foreground)]"
      >
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
          {metrics.map((item) => (
            <div key={item.label} className="min-w-0">
              <dt className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                {item.label}
              </dt>
              <dd className="mt-0.5 truncate text-lg font-semibold tabular-nums tracking-tight text-[var(--foreground)] sm:text-xl">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-auto pt-4">
          {children ? (
            <p className="truncate text-xs text-[var(--muted)]">{children}</p>
          ) : null}
          <p className="mt-1 text-xs font-medium text-[var(--safir-deep)]">{hrefLabel}</p>
        </div>
      </Card>
    </Link>
  );
}
