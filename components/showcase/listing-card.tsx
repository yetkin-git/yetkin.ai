import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";

type LinkHref = ComponentProps<typeof LinkButton>["href"];

export function ListingCard({
  title,
  summary,
  price,
  priceCaption,
  badge,
  badgeTone = "safir",
  meta,
  kicker,
  moduleCode,
  extraBadge,
  extraBadgeTone = "safir",
  footerBadge,
  footerBadgeTone = "neutral",
  href,
  cta = "Aç",
  showcase = false,
  icon,
  className,
  lockLabel,
  rank,
  layout = "grid",
  hit = "cta",
  summaryClamp = 2,
}: {
  title: string;
  summary: string;
  price?: string;
  /** Fiyatın altında küçük ipucu (örn. KDV dahil). */
  priceCaption?: string;
  badge?: string;
  badgeTone?: BadgeTone;
  meta?: string;
  /** Seviye adı — modül kodu ile aynı satırda inline kicker (örn. Temel Seviye). */
  kicker?: string;
  /** Modül kodu — inline kicker solunda mono etiket (örn. PY-101). */
  moduleCode?: string;
  /** String → Badge; ReactNode → ham rozet (Quiet Luxury özel yüzeyler). */
  extraBadge?: ReactNode;
  extraBadgeTone?: BadgeTone;
  /** Durum rozeti — fiyat yanında, kart altı (taşmayan minimal sinyal). */
  footerBadge?: string;
  footerBadgeTone?: BadgeTone;
  href?: LinkHref;
  cta?: string;
  showcase?: boolean;
  icon?: ReactNode;
  className?: string;
  lockLabel?: string;
  rank?: 1 | 2 | 3;
  /** Izgara kartı veya tek satırlık liste satırı. */
  layout?: "grid" | "list";
  /** `card`: gövde hit target; iç CTA yok. `cta`: yalnız düğme (Freelancer). */
  hit?: "cta" | "card";
  /** Özet satır tavanı — akademi ön yüzü 3; vitrin varsayılanı 2. */
  summaryClamp?: 2 | 3 | 4;
}) {
  const isList = layout === "list";
  const cardHit = Boolean(href) && hit === "card";
  const hasInlineKicker = Boolean(moduleCode || kicker);
  const hasTopChrome = Boolean(
    rank || icon || badge || lockLabel || extraBadge || showcase || hasInlineKicker,
  );

  const card = (
    <Card
      variant={showcase ? "glass" : "default"}
      className={cn(
        "room-listing h-full",
        rank === 1 && "ring-1 ring-[var(--gold)]",
        isList && "p-4 sm:p-5",
        cardHit &&
          "pointer-events-none relative z-[1] transition-[border-color] duration-200 group-hover:border-[color-mix(in_srgb,var(--safir)_28%,transparent)]",
        className,
      )}
      bodyClassName={cn(
        "flex h-full text-[var(--foreground)]",
        isList ? "flex-col gap-3 sm:flex-row sm:items-center sm:gap-5" : "flex-col justify-between",
      )}
    >
      <div className={cn("min-w-0 flex-1", isList ? "space-y-2" : "flex flex-col")}>
        {hasTopChrome ? (
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
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
              {lockLabel ? <Badge tone="emerald">{lockLabel}</Badge> : null}
              {hasInlineKicker ? (
                <div className="flex min-w-0 items-center gap-2">
                  {moduleCode ? (
                    <span className="inline-flex shrink-0 rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-1.5 py-0.5 text-[11px] font-mono tracking-wide text-[var(--muted)]">
                      {moduleCode}
                    </span>
                  ) : null}
                  {moduleCode && kicker ? (
                    <span className="text-xs text-[var(--muted)]" aria-hidden="true">
                      ·
                    </span>
                  ) : null}
                  {kicker ? (
                    <span className="truncate text-xs font-medium text-[var(--muted)]">{kicker}</span>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="pointer-events-auto relative z-10 flex shrink-0 items-center justify-end gap-2">
              {extraBadge ? (
                typeof extraBadge === "string" ? (
                  <Badge tone={extraBadgeTone}>{extraBadge}</Badge>
                ) : (
                  extraBadge
                )
              ) : null}
              {showcase ? <Badge tone="gold">Vitrin</Badge> : null}
            </div>
          </div>
        ) : null}
        <div>
          <h3 className="min-w-0 text-base font-semibold tracking-tight text-[var(--foreground)]">
            {title}
          </h3>
        </div>
        <p
          className={cn(
            "mt-2 text-sm leading-6 text-[var(--muted)] sm:mt-1",
            summaryClamp === 3 ? "line-clamp-3" : summaryClamp === 4 ? "line-clamp-4" : "line-clamp-2",
          )}
        >
          {summary}
        </p>
        {meta ? <p className="mt-3 text-xs text-[var(--muted)] sm:mt-2">{meta}</p> : null}
      </div>
      <div
        className={cn(
          "flex items-center justify-between gap-4",
          isList
            ? "shrink-0 sm:min-w-[11rem] sm:flex-col sm:items-end sm:justify-center sm:gap-3"
            : "mt-auto pt-4",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="min-w-0">
            {price ? (
              <p className="listing-price truncate text-lg font-semibold tracking-tight" data-listing-price="">
                {price}
              </p>
            ) : (
              <span />
            )}
            {priceCaption ? (
              <p className="mt-0.5 truncate text-xs leading-4 text-[var(--muted)]">{priceCaption}</p>
            ) : null}
          </div>
          {footerBadge ? (
            <Badge tone={footerBadgeTone} className="shrink-0 normal-case tracking-tight">
              {footerBadge}
            </Badge>
          ) : null}
        </div>
        {href && hit === "cta" ? (
          <LinkButton
            href={href}
            variant={showcase ? "outline" : "primary"}
            size="sm"
            className="shrink-0 whitespace-nowrap"
          >
            {cta}
          </LinkButton>
        ) : hit === "card" && cta ? (
          <span
            className={buttonClassName("primary", "sm", "pointer-events-none shrink-0 whitespace-nowrap")}
            aria-hidden="true"
          >
            {cta}
          </span>
        ) : null}
      </div>
    </Card>
  );

  if (!cardHit || !href) {
    return card;
  }

  return (
    <div className="group relative h-full">
      <Link
        href={href}
        className="absolute inset-0 z-0 rounded-[var(--radius-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--safir-soft)] focus-visible:ring-offset-2"
        aria-label={[moduleCode, kicker, title, price, priceCaption, cta].filter(Boolean).join(". ")}
      />
      {card}
    </div>
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
