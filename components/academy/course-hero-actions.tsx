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
import { trackBeginCheckout } from "@/lib/kernel/telemetry/funnel";
import { FreePreviewLink } from "@/components/academy/free-preview-link";
import type { Route } from "next";

/**
 * Ders detay header. Satın alma açıksa fiyat satırı CTA’nın üstündedir.
 * Ücretsiz izleme, satın alma düğmesinin altında durur.
 */
export function CourseHeroActions({
  priceLabel,
  level,
  moduleCode,
  hasSealedAudio = false,
  narration = false,
  narrationLabel,
  comingSoon = false,
  audioPreview = false,
  primaryHref,
  primaryLabel,
  primaryAction = "none",
  itemId = null,
  itemName = null,
  valueMinor = null,
  currency = null,
  paytrCheckout = false,
  previewHref = null,
  catalogHref,
  catalogLabel,
}: {
  priceLabel: string;
  level: AcademyCourseLevel | null;
  moduleCode?: string | null;
  hasSealedAudio?: boolean;
  /** Kısa ses rozeti. Uzun makale / sınav / sertifika şeridi basılmaz. */
  narration?: boolean;
  /** Yarım mühürde dürüst sayım. Boşsa `narrationBadge` basılır. */
  narrationLabel?: string;
  /** Taze ingest yok — Yazılı compact vaadi basılmaz. */
  comingSoon?: boolean;
  /** Amiral 1. bölüm sesli; karaoke mührü yokken kısa rozet. */
  audioPreview?: boolean;
  primaryHref?: string | null;
  primaryLabel?: string | null;
  primaryAction?: AcademyAntreHeroAction;
  itemId?: string | null;
  itemName?: string | null;
  valueMinor?: number | null;
  currency?: string | null;
  /** Oturumlu satın alma — #satin-al yerine PayTR iFrame. */
  paytrCheckout?: boolean;
  /** Lisans yokken ilk ders. Boş kabukta verilmez. */
  previewHref?: string | null;
  catalogHref: Route;
  catalogLabel: string;
}) {
  const identity = ACADEMY_SEN.catalog.heroLevelIdentity(level, moduleCode);
  const buyPriced = primaryAction === "buy";
  const statusLabel = !buyPriced && priceLabel ? priceLabel : null;
  function onBuyIntent() {
    if (primaryAction !== "buy" || !itemId) {
      return;
    }
    trackBeginCheckout({ itemId, itemName, valueMinor, currency });
  }
  const buyControl =
    primaryHref && primaryLabel ? (
      paytrCheckout && primaryAction === "buy" ? (
        <Button
          size="lg"
          className="w-full tabular-nums"
          data-academy-hero-cta={primaryAction}
          data-academy-hero-paytr=""
          data-academy-hero-price=""
          onClick={() => {
            onBuyIntent();
            window.dispatchEvent(new Event(ACADEMY_HERO_PAYTR_EVENT));
          }}
        >
          {primaryLabel}
        </Button>
      ) : (
        <LinkButton
          href={primaryHref as Route}
          size="lg"
          variant={primaryAction === "play" || primaryAction === "exam" ? "success" : "primary"}
          className="w-full tabular-nums"
          data-academy-hero-cta={primaryAction}
          data-academy-hero-price={primaryAction === "buy" ? "" : undefined}
          onClick={onBuyIntent}
        >
          {primaryLabel}
        </LinkButton>
      )
    ) : null;
  return (
    <div className="flex w-full flex-col items-stretch gap-3 sm:w-max sm:shrink-0 sm:items-end">
      <div className="flex flex-wrap items-center justify-start gap-x-3 gap-y-2 sm:justify-end">
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
      {comingSoon ? (
        <span data-academy-hero-coming-soon="">
          <Badge tone="neutral" className="normal-case tracking-normal">
            {ACADEMY_SEN.catalog.comingSoonHint}
          </Badge>
        </span>
      ) : narration ? (
        <span data-academy-hero-audio="">
          <Badge tone="safir" className="normal-case tracking-normal">
            {narrationLabel || ACADEMY_SEN.catalog.narrationBadge}
          </Badge>
        </span>
      ) : hasSealedAudio ? (
        <span data-academy-hero-audio="">
          <Badge tone="safir" className="normal-case tracking-normal">
            {ACADEMY_SEN.catalog.heroAudioBadge}
          </Badge>
        </span>
      ) : audioPreview ? (
        <span data-academy-hero-audio="">
          <Badge tone="safir" className="normal-case tracking-normal">
            {ACADEMY_SEN.catalog.narrationBadge}
          </Badge>
        </span>
      ) : (
        <span data-academy-hero-article="">
          <Badge tone="neutral" className="normal-case tracking-normal">
            {ACADEMY_SEN.catalog.heroArticleBadge}
          </Badge>
        </span>
      )}
      </div>
      <div className="flex w-full min-w-[12rem] flex-col gap-2 sm:w-max sm:shrink-0">
        {buyPriced && priceLabel ? (
          <p
            className="text-left text-2xl font-semibold tabular-nums tracking-tight text-[var(--foreground)] sm:text-right"
            data-academy-price-lead=""
          >
            {priceLabel}
          </p>
        ) : null}
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-stretch">
          {buyControl ? <div className="sm:min-w-[12rem] sm:flex-1">{buyControl}</div> : null}
          {previewHref ? (
            <FreePreviewLink href={previewHref} surface="hero" className="w-full sm:w-auto sm:flex-1" />
          ) : null}
        </div>
        {previewHref ? (
          <p className="text-left text-sm leading-5 text-[var(--muted)] sm:text-right">
            {ACADEMY_SEN.course.previewLead}
          </p>
        ) : null}
        <LinkButton href={catalogHref} variant="outline" size="sm" className="w-full">
          {catalogLabel}
        </LinkButton>
      </div>
    </div>
  );
}
