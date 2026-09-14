"use client";

import { formatMinorCompact } from "@/lib/kernel/money/format";
import type { AcademyCourseWithPrice } from "@/lib/academy/types";
import { ListingCard } from "@/components/showcase/listing-card";
import { IconBook, IconHeart, IconVolume } from "@/components/ui/icons";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { academyModuleCodeBySlug } from "@/lib/academy/catalog-filter";
import { academyCourseLevelBySlug } from "@/lib/academy/course-level";
import { academyCatalogSummaryBySlug } from "@/lib/academy/catalog-summaries";
import {
  ACADEMY_COURSE_COVER_SIZES,
  ACADEMY_FLAGSHIP_CHAPTER_ONE_DURATION_MIN,
  academyCourseCoverPath,
  academyCourseHasCinemaCover,
  academyCourseIsComingSoon,
} from "@/lib/academy/course-cover";
import type { AcademyCatalogLearnerStatus } from "@/lib/academy/catalog-learner";
import type { AcademyCatalogViewMode } from "@/lib/academy/catalog-view-pref";
import { resolveAcademyCatalogCardCta } from "@/lib/academy/storefront-cta";
import { academyCourseHasSealedAudio } from "@/lib/academy/pilot-sku";
import { cn } from "@/components/ui/cn";

export type CourseCardSurface = "catalog" | "library";

/**
 * Akademi kurs kartı — dürüst bilgi bloku: başlık, meta, fiyat *veya* erişim mührü.
 * Kartın tamamı tık. CTA satın alma durumuna bağlıdır.
 */
export function CourseCard({
  course,
  statusBadge,
  surface = "catalog",
  layout = "grid",
  lessonCount = 0,
  learnerStatus,
  featured = false,
  owned = false,
  favorited = false,
  onToggleFavorite,
}: {
  course: AcademyCourseWithPrice;
  statusBadge?: string | null;
  surface?: CourseCardSurface;
  layout?: AcademyCatalogViewMode;
  lessonCount?: number;
  learnerStatus?: AcademyCatalogLearnerStatus;
  /** Amiral SKU — vitrinde daha geniş kart ve üç satır özet. */
  featured?: boolean;
  /** Satın alınmış eğitim — Super Admin lab overlay vitrinde owned basabilir; nakit değildir. */
  owned?: boolean;
  favorited?: boolean;
  onToggleFavorite?: () => void;
}) {
  const isLibrary = surface === "library";
  const levelLabel = course.level?.trim() || academyCourseLevelBySlug(course.slug) || "";
  const summary = academyCatalogSummaryBySlug(course.slug) ?? course.summary;
  const moduleCode = academyModuleCodeBySlug(course.slug) || undefined;
  const levelKicker = levelLabel ? ACADEMY_SEN.catalog.badgeLevel(levelLabel) : undefined;
  const moneyLabel = course.priceMinor
    ? formatMinorCompact(course.priceMinor, course.currencyCode)
    : ACADEMY_SEN.catalog.priceMissing;
  const storefront = resolveAcademyCatalogCardCta({
    slug: course.slug,
    owned,
    learnerStatus,
    priceLabel: course.priceMinor ? moneyLabel : null,
  });
  const learnerLabel =
    learnerStatus === "continue"
      ? ACADEMY_SEN.catalog.statusContinue
      : learnerStatus === "completed"
        ? ACADEMY_SEN.catalog.statusCompleted
        : null;

  const comingSoon = academyCourseIsComingSoon(course.slug);
  const cinemaCover = academyCourseCoverPath(course.slug);
  const sealedAudio = academyCourseHasSealedAudio(course.slug);
  const hasAudio = sealedAudio || academyCourseHasCinemaCover(course.slug);
  const audioBadge = comingSoon ? (
    <span
      data-academy-coming-soon-badge=""
      title={ACADEMY_SEN.catalog.comingSoonHint}
      aria-label={ACADEMY_SEN.catalog.comingSoonHint}
      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-transparent px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--muted)] ring-1 ring-inset ring-[color-mix(in_srgb,var(--border)_70%,transparent)]"
    >
      {ACADEMY_SEN.catalog.comingSoonBadge}
    </span>
  ) : hasAudio ? (
    <span
      data-academy-audio-badge=""
      title={
        sealedAudio
          ? ACADEMY_SEN.catalog.audioBadgeHint
          : ACADEMY_SEN.catalog.cardMetaAudio(ACADEMY_FLAGSHIP_CHAPTER_ONE_DURATION_MIN)
      }
      aria-label={
        sealedAudio
          ? ACADEMY_SEN.catalog.audioBadgeHint
          : ACADEMY_SEN.catalog.cardMetaAudio(ACADEMY_FLAGSHIP_CHAPTER_ONE_DURATION_MIN)
      }
      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--safir-soft)] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--safir-deep)] ring-1 ring-inset ring-[var(--safir-soft)]"
    >
      <IconVolume className="h-3 w-3" />
      {ACADEMY_SEN.catalog.audioBadge}
    </span>
  ) : (
    <span
      data-academy-article-badge=""
      title={ACADEMY_SEN.catalog.articleBadgeHint}
      aria-label={ACADEMY_SEN.catalog.articleBadgeHint}
      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--surface)] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--muted)] ring-1 ring-inset ring-[var(--border)]"
    >
      <IconBook className="h-3 w-3" />
      {ACADEMY_SEN.catalog.articleBadge}
    </span>
  );
  const cardMeta = comingSoon
    ? ACADEMY_SEN.catalog.comingSoonMeta
    : hasAudio
      ? ACADEMY_SEN.catalog.cardMetaAudio(ACADEMY_FLAGSHIP_CHAPTER_ONE_DURATION_MIN)
      : ACADEMY_SEN.catalog.cardMeta(lessonCount);
  const hitAriaExtra = comingSoon
    ? ACADEMY_SEN.catalog.comingSoonHint
    : sealedAudio
      ? ACADEMY_SEN.catalog.audioBadgeHint
      : hasAudio
        ? ACADEMY_SEN.catalog.cardMetaAudio(ACADEMY_FLAGSHIP_CHAPTER_ONE_DURATION_MIN)
        : ACADEMY_SEN.catalog.articleBadgeHint;
  const favoriteButton =
    !isLibrary && onToggleFavorite ? (
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onToggleFavorite();
        }}
        aria-pressed={favorited}
        aria-label={favorited ? ACADEMY_SEN.catalog.favoriteRemove : ACADEMY_SEN.catalog.favoriteAdd}
        className={cn(
          "relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg border transition",
          favorited
            ? "border-[color-mix(in_srgb,var(--safir)_35%,transparent)] bg-[var(--safir-soft)] text-[var(--safir-deep)]"
            : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]",
        )}
      >
        <IconHeart filled={favorited} className="h-3.5 w-3.5" />
      </button>
    ) : null;
  const chrome = audioBadge || favoriteButton ? (
    <>
      {audioBadge}
      {favoriteButton}
    </>
  ) : null;

  return (
    <ListingCard
      layout={layout}
      hit="card"
      title={course.title}
      moduleCode={moduleCode}
      kicker={levelKicker}
      summary={summary}
      summaryClamp={featured ? 3 : 2}
      price={storefront.priceLabel}
      priceCaption={storefront.priceCaption ?? undefined}
      badge={statusBadge ?? (comingSoon ? undefined : ACADEMY_SEN.catalog.liveBadge)}
      lockLabel={comingSoon || course.purchasable ? undefined : ACADEMY_SEN.catalog.badgeClosed}
      meta={cardMeta}
      href={storefront.href || undefined}
      cta={storefront.cta}
      ctaSize="md"
      ctaVariant={owned ? "success" : comingSoon ? "outline" : "primary"}
      coverSrc={cinemaCover}
      coverComingSoon={comingSoon}
      comingSoonLabel={ACADEMY_SEN.catalog.comingSoonBadge}
      coverPriority={featured}
      coverSizes={ACADEMY_COURSE_COVER_SIZES}
      footerBadge={learnerLabel ?? undefined}
      footerBadgeTone={learnerStatus === "completed" ? "emerald" : "safir"}
      extraBadge={chrome}
      hitAriaExtra={hitAriaExtra}
      className={cn(
        featured &&
          "ring-1 ring-[color-mix(in_srgb,var(--safir)_42%,transparent)] bg-[color-mix(in_srgb,var(--safir-soft)_55%,var(--surface))]",
      )}
    />
  );
}
