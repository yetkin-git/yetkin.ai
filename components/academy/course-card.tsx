"use client";

import { formatMinor } from "@/lib/kernel/money/format";
import type { AcademyCourseWithPrice } from "@/lib/academy/types";
import { ListingCard } from "@/components/showcase/listing-card";
import { IconHeart } from "@/components/ui/icons";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { academyInstructorBySlug } from "@/lib/academy/instructors";
import { academyModuleCodeBySlug } from "@/lib/academy/catalog-filter";
import { academyCourseLevelBySlug } from "@/lib/academy/course-level";
import type { AcademyCatalogLearnerStatus } from "@/lib/academy/catalog-learner";
import type { AcademyCatalogViewMode } from "@/lib/academy/catalog-view-pref";
import { resolveAcademyCatalogCardCta } from "@/lib/academy/storefront-cta";
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
  const moduleCode = academyModuleCodeBySlug(course.slug) || undefined;
  const levelKicker = levelLabel ? ACADEMY_SEN.catalog.badgeLevel(levelLabel) : undefined;
  const moneyLabel = course.priceMinor
    ? formatMinor(course.priceMinor, course.currencyCode)
    : ACADEMY_SEN.catalog.priceMissing;
  const storefront = resolveAcademyCatalogCardCta({
    slug: course.slug,
    owned,
    learnerStatus,
    priceLabel: moneyLabel,
  });
  const learnerLabel =
    learnerStatus === "continue"
      ? ACADEMY_SEN.catalog.statusContinue
      : learnerStatus === "completed"
        ? ACADEMY_SEN.catalog.statusCompleted
        : null;

  const chrome =
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

  return (
    <ListingCard
      layout={layout}
      hit="card"
      title={course.title}
      moduleCode={moduleCode}
      kicker={levelKicker}
      summary={course.summary}
      price={storefront.priceLabel}
      badge={statusBadge ?? undefined}
      lockLabel={course.purchasable ? undefined : ACADEMY_SEN.catalog.badgeClosed}
      meta={ACADEMY_SEN.catalog.cardMeta(lessonCount, instructor.name)}
      href={storefront.href}
      cta={storefront.cta}
      footerBadge={learnerLabel ?? undefined}
      footerBadgeTone={learnerStatus === "completed" ? "emerald" : "safir"}
      extraBadge={chrome}
      className="!p-4"
    />
  );
}
