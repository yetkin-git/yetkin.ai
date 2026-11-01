import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { StatItem } from "@/components/ui/stat-grid";

type LinkHref = ComponentProps<typeof Link>["href"];

export function PulseCard({
  title,
  live,
  liveHint = "Canlı",
  unavailableHint = "Henüz yüklenemedi",
  stats,
  children,
  href,
  hrefLabel,
  invite,
}: {
  title: string;
  live: boolean;
  liveHint?: string;
  unavailableHint?: string;
  stats: StatItem[];
  children?: ReactNode;
  href: LinkHref;
  hrefLabel: string;
  /** Sayaç 0 iken kart gövdesi: davet cümlesi + görünen eylem. Kartın kendisi bağlantıdır. */
  invite?: { message: string; cta: string };
}) {
  const metrics = stats.slice(0, 2);
  const metricGrid =
    metrics.length > 1 ? "grid grid-cols-2 gap-x-4 gap-y-1" : "grid grid-cols-1 gap-y-1";

  return (
    <Link
      href={href}
      aria-label={invite ? `${invite.message} ${invite.cta}` : hrefLabel}
      className="group block h-full min-w-0 rounded-[var(--radius-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--safir-soft)] focus-visible:ring-offset-2"
    >
      <Card
        variant="default"
        className="flex h-full min-w-0 flex-col !p-4 shadow-sm transition-[border-color,box-shadow] duration-200 group-hover:border-[color-mix(in_srgb,var(--safir)_28%,transparent)]"
        title={title}
        action={
          <Badge tone={live ? "emerald" : "amber"}>{live ? liveHint : unavailableHint}</Badge>
        }
        bodyClassName="flex min-h-0 flex-1 flex-col text-[var(--foreground)]"
      >
        {metrics.length > 0 ? (
          <dl className={metricGrid}>
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
        ) : null}
        {invite ? (
          <div className={metrics.length > 0 ? "mt-auto pt-4" : "mt-auto"}>
            <div className="rounded-2xl bg-[var(--safir-soft)] px-3 py-3">
              <p className="text-pretty text-sm font-medium leading-6 text-[var(--foreground)]">
                {invite.message}
              </p>
              <span className={buttonClassName("primary", "sm", "mt-3")}>{invite.cta}</span>
            </div>
          </div>
        ) : (
          <div className="mt-auto pt-4">
            {children ? (
              <p className="text-pretty text-xs leading-5 text-[var(--muted)]">{children}</p>
            ) : null}
            <p className="mt-1 text-xs font-medium text-[var(--safir-deep)]">{hrefLabel}</p>
          </div>
        )}
      </Card>
    </Link>
  );
}
