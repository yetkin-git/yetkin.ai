"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import {
  academyCourseLevelTone,
  type AcademyCourseLevel,
} from "@/lib/academy/course-level";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { ACADEMY_HERO_PAYTR_EVENT, type AcademyAntreHeroAction } from "@/lib/academy/storefront-cta";
import type { Route } from "next";

/**
 * Ders detay header — DURUM A'da fiyat yalnız birincil CTA içinde.
 * Bağımsız ₺ satırı basılmaz. Satın alınmadıysa "Derse başla" basılmaz.
 */
export function CourseHeroActions({
  priceLabel,
  level,
  moduleCode,
  hasSealedAudio = false,
  primaryHref,
  primaryLabel,
  primaryAction = "none",
  paytrCheckout = false,
  catalogHref,
  catalogLabel,
}: {
  priceLabel: string;
  level: AcademyCourseLevel | null;
  moduleCode?: string | null;
  hasSealedAudio?: boolean;
  primaryHref?: string | null;
  primaryLabel?: string | null;
  primaryAction?: AcademyAntreHeroAction;
  /** Oturumlu satın alma — #satin-al yerine PayTR iFrame. */
  paytrCheckout?: boolean;
  catalogHref: Route;
  catalogLabel: string;
}) {
  const identity = ACADEMY_SEN.catalog.heroLevelIdentity(level, moduleCode);
  const buyPriced = primaryAction === "buy";
  const statusLabel = !buyPriced && priceLabel ? priceLabel : null;
  return (
    <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2">
      {statusLabel ? (
        <span data-academy-hero-status="">
          <Badge tone="safir" className="normal-case tracking-normal">
            {statusLabel}
          </Badge>
        </span>
      ) : null}
      {identity ? (
        <span data-academy-hero-identity="">
          <Badge
            tone={level ? academyCourseLevelTone(level) : "safir"}
            className="normal-case tracking-normal"
          >
            {identity}
          </Badge>
        </span>
      ) : null}
      {hasSealedAudio ? (
        <span data-academy-hero-audio="">
          <Badge tone="safir" className="normal-case tracking-normal">
            {ACADEMY_SEN.catalog.heroAudioBadge}
          </Badge>
        </span>
      ) : (
        <span data-academy-hero-article="">
          <Badge tone="neutral" className="normal-case tracking-normal">
            {ACADEMY_SEN.catalog.heroArticleBadge}
          </Badge>
        </span>
      )}
      {primaryHref && primaryLabel ? (
        paytrCheckout && primaryAction === "buy" ? (
          <Button
            size="sm"
            className="tabular-nums"
            data-academy-hero-cta={primaryAction}
            data-academy-hero-paytr=""
            data-academy-hero-price=""
            onClick={() => {
              window.dispatchEvent(new Event(ACADEMY_HERO_PAYTR_EVENT));
            }}
          >
            {primaryLabel}
          </Button>
        ) : (
          <LinkButton
            href={primaryHref as Route}
            size="sm"
            className="tabular-nums"
            data-academy-hero-cta={primaryAction}
            data-academy-hero-price={primaryAction === "buy" ? "" : undefined}
          >
            {primaryLabel}
          </LinkButton>
        )
      ) : null}
      <LinkButton href={catalogHref} variant="outline" size="sm">
        {catalogLabel}
      </LinkButton>
    </div>
  );
}
