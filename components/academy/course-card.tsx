"use client";

import { formatMinorCompact } from "@/lib/kernel/money/format";
import type { AcademyCourseWithPrice } from "@/lib/academy/types";
import { ListingCard } from "@/components/showcase/listing-card";
import { IconHeart, IconVolume } from "@/components/ui/icons";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { academyInstructorBySlug } from "@/lib/academy/instructors";
import { academyModuleCodeBySlug } from "@/lib/academy/catalog-filter";
import { academyCourseLevelBySlug } from "@/lib/academy/course-level";
import { academyCatalogSummaryBySlug } from "@/lib/academy/catalog-summaries";
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
  /** Satın alınmış eğitim — Super Admin lab overlay vitrinde owned basabilir; nakit değildir. */
  owned?: boolean;
  favorited?: boolean;
  onToggleFavorite?: () => void;
}) {
  const instructor = academyInstructorBySlug(course.slug);
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

  const hasAudio = academyCourseHasSealedAudio(course.slug);
  const audioBadge = hasAudio ? (
    <span
      data-academy-audio-badge=""
      title={ACADEMY_SEN.catalog.audioBadgeHint}
      aria-label={ACADEMY_SEN.catalog.audioBadgeHint}
      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--safir-soft)] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--safir-deep)] ring-1 ring-inset ring-[var(--safir-soft)]"
    >
      <IconVolume className="h-3 w-3" />
      {ACADEMY_SEN.catalog.audioBadge}
    </span>
  ) : null;
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
      summaryClamp={2}
      price={storefront.priceLabel}
      priceCaption={storefront.priceCaption ?? undefined}
      badge={statusBadge ?? undefined}
      lockLabel={course.purchasable ? undefined : ACADEMY_SEN.catalog.badgeClosed}
      meta={ACADEMY_SEN.catalog.cardMeta(lessonCount, instructor.name)}
      href={storefront.href}
      cta={storefront.cta}
      footerBadge={learnerLabel ?? undefined}
      footerBadgeTone={learnerStatus === "completed" ? "emerald" : "safir"}
      extraBadge={chrome}
      hitAriaExtra={hasAudio ? ACADEMY_SEN.catalog.audioBadgeHint : undefined}
      className="!p-4"
    />
  );
}
