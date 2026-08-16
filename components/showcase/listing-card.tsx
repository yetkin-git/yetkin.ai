import type { ComponentProps, ReactNode } from "react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { cn } from "@/components/ui/cn";

type LinkHref = ComponentProps<typeof LinkButton>["href"];

export function ListingCard({
  title,
  summary,
  price,
  badge,
  badgeTone = "safir",
  meta,
  href,
  cta = "Aç",
  showcase = false,
  icon,
  className,
  lockLabel,
  rank,
}: {
  title: string;
  summary: string;
  price?: string;
  badge?: string;
  badgeTone?: BadgeTone;
  meta?: string;
  href?: LinkHref;
  cta?: string;
  showcase?: boolean;
  icon?: ReactNode;
  className?: string;
  lockLabel?: string;
  rank?: 1 | 2 | 3;
}) {
  return (
    <Card
      variant={showcase ? "glass" : "default"}
      className={cn("room-listing h-full", rank === 1 && "ring-1 ring-[var(--gold)]", className)}
      bodyClassName="flex h-full flex-col text-[var(--foreground)]"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {rank ? (
            <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-[var(--gold-soft)] px-2 text-xs font-bold text-[var(--gold)]">
              {rank}
            </span>
          ) : null}
          {icon ? (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--safir-soft)] text-[var(--safir-deep)]">
              {icon}
            </span>
          ) : null}
          {badge ? <Badge tone={badgeTone}>{badge}</Badge> : null}
          {lockLabel ? (
            <Badge tone="emerald">{lockLabel}</Badge>
          ) : null}
        </div>
        {showcase ? <Badge tone="gold">Vitrin</Badge> : null}
      </div>
      <h3 className="text-base font-semibold tracking-tight text-[var(--foreground)]">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-[var(--muted)]">{summary}</p>
      {meta ? <p className="mt-3 text-xs text-[var(--muted)]">{meta}</p> : null}
      <div className="mt-4 flex items-center justify-between gap-3">
        {price ? <p className="listing-price text-lg font-semibold tracking-tight">{price}</p> : <span />}
        {href ? (
          <LinkButton href={href} variant={showcase ? "outline" : "primary"} size="sm">
            {cta}
          </LinkButton>
        ) : null}
      </div>
    </Card>
  );
}

export function Vitrine({
  title = "Vitrin örneği",
  hint,
  children,
}: {
  title?: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="gold">{title}</Badge>
        <p className="text-sm text-[var(--muted)]">{hint}</p>
      </div>
      {children}
    </div>
  );
}
