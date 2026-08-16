import type { ComponentProps, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { StatGrid, type StatItem } from "@/components/ui/stat-grid";

type LinkHref = ComponentProps<typeof LinkButton>["href"];

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
  return (
    <Card
      variant="glass"
      title={title}
      action={<Badge tone={live ? "emerald" : "neutral"}>{live ? liveHint : "Boş nabız"}</Badge>}
      bodyClassName="text-[var(--foreground)]"
    >
      <p className="mb-4 text-xs text-[var(--muted)]">
        {live ? liveHint : "Oturum veya veritabanı yok — dürüst boş nabız"}
      </p>
      <StatGrid items={stats} columns={2} />
      {children ? <div className="mt-4 text-sm text-[var(--muted)]">{children}</div> : null}
      <div className="mt-5">
        <LinkButton href={href} variant="outline" size="sm">
          {hrefLabel}
        </LinkButton>
      </div>
    </Card>
  );
}
