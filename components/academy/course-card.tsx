"use client";

import type { Route } from "next";
import { BeginCheckoutLink } from "@/components/academy/begin-checkout-link";
import { LinkButton } from "@/components/ui/link-button";
import type { AcademyCourseWithPrice } from "@/lib/academy/types";
import { ListingCard } from "@/components/showcase/listing-card";
import { IconBook, IconHeart, IconVolume } from "@/components/ui/icons";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { academyModuleCodeBySlug } from "@/lib/academy/catalog-filter";
import { academyCourseLevelBySlug } from "@/lib/academy/course-level";
import { academyCatalogSummaryBySlug } from "@/lib/academy/catalog-summaries";
import { academyStorefrontTitleBySlug } from "@/lib/academy/course-titles";
import {
  ACADEMY_COURSE_COVER_SIZES,
  academyCourseCoverPath,
  academyCourseHasCinemaCover,
  academyCourseIsComingSoon,
} from "@/lib/academy/course-cover";
import type { AcademyCatalogLearnerStatus } from "@/lib/academy/catalog-learner";
import type { AcademyCatalogViewMode } from "@/lib/academy/catalog-view-pref";
import { resolveAcademyCatalogCardCta } from "@/lib/academy/storefront-cta";
import { curriculumLessonKeysForSlug } from "@/lib/academy/curricula/lesson-index";
import {
  ACADEMY_OFF201_STOREFRONT_SLUG,
  academyCourseHasSealedAudio,
  academyMediaSealedLessonKeys,
  isAcademyVitrineShellSkuSlug,
} from "@/lib/academy/pilot-sku";
import { OFF_101_EXEMPTION_PATH } from "@/lib/academy/off101-exemption";
import {
  academyShowcasePrice,
  PUBLIC_PRICE_PREPARING_LABEL,
} from "@/lib/pricing/showcase-price";
import { cn } from "@/components/ui/cn";

function academyTrackTone(slug: string): { label: string; border: string; badge: string } {
  if (slug.startsWith("01_office")) {
    return {
      label: "Ofis",
      border: "!border-t-4 !border-t-blue-600",
      badge: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100",
    };
  }
  if (slug.startsWith("02_ecommerce")) {
    return {
      label: "E-Ticaret",
      border: "!border-t-4 !border-t-orange-500",
      badge: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-100",
    };
  }
  if (slug.startsWith("03_social")) {
    return {
      label: "Sosyal Medya",
      border: "!border-t-4 !border-t-fuchsia-500",
      badge: "bg-fuchsia-50 text-fuchsia-700 ring-1 ring-inset ring-fuchsia-100",
    };
  }
  if (slug.startsWith("04_chatbot")) {
    return {
      label: "Chatbot",
      border: "!border-t-4 !border-t-emerald-500",
      badge: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100",
    };
  }
  if (slug.startsWith("05_prompt")) {
    return {
      label: "Prompt",
      border: "!border-t-4 !border-t-indigo-500",
      badge: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-100",
    };
  }
  return {
    label: "Uzmanlık",
    border: "!border-t-4 !border-t-slate-400",
    badge: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
  };
}

export type CourseCardSurface = "catalog" | "library";

/**
 * Akademi kurs kartı — dürüst bilgi bloku: başlık, meta, fiyat *veya* erişim mührü.
 * Fiyatlı kartta birincil eylem Hemen Katıl'dır. Ücretsiz ilk ders onun yanındadır.
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
  buyHref = null,
  saleHold = null,
  favorited = false,
  onToggleFavorite,
}: {
  course: AcademyCourseWithPrice;
  statusBadge?: string | null;
  surface?: CourseCardSurface;
  layout?: AcademyCatalogViewMode;
  lessonCount?: number;
  learnerStatus?: AcademyCatalogLearnerStatus;
  /** Öne çıkan temel eğitim — aynı ebatta kart; ince çerçeve ve üç satır özet. */
  featured?: boolean;
  /** Satın alınmış eğitim — Super Admin lab overlay vitrinde owned basabilir; nakit değildir. */
  owned?: boolean;
  /** Oturumlu kasa çapası veya oturumsuz giriş. Boşsa kart `#satin-al` basar. */
  buyHref?: string | null;
  /** Kapalı kayıtta yayın, fiyat veya ses/metin eksiği. */
  saleHold?: string | null;
  favorited?: boolean;
  onToggleFavorite?: () => void;
}) {
  const isLibrary = surface === "library";
  const levelLabel = course.level?.trim() || academyCourseLevelBySlug(course.slug) || "";
  const displayTitle = academyStorefrontTitleBySlug(course.slug) ?? course.title;
  const summary = academyCatalogSummaryBySlug(course.slug) ?? course.summary;
  const moduleCode = academyModuleCodeBySlug(course.slug) || undefined;
  const levelKicker = featured
    ? ACADEMY_SEN.catalog.flagshipBadge
    : levelLabel
      ? ACADEMY_SEN.catalog.badgeLevel(levelLabel)
      : undefined;
  const showcase = academyShowcasePrice({
    slug: course.slug,
    catalogAmountMinor: course.priceMinor,
    isPublished: course.isPublished,
  });
  const moneyLabel =
    showcase.honesty === "live" ? showcase.label : ACADEMY_SEN.catalog.priceMissing;
  const freeGuide = isAcademyVitrineShellSkuSlug(course.slug);
  const comingSoon = !freeGuide && academyCourseIsComingSoon(course.slug);
  const unpublished = !comingSoon && !course.isPublished;
  const saleClosed = !comingSoon && !unpublished && !owned && !course.purchasable;
  const storefront = resolveAcademyCatalogCardCta({
    slug: course.slug,
    owned,
    learnerStatus,
    priceLabel: showcase.honesty === "live" ? moneyLabel : null,
    purchasable: comingSoon || unpublished ? undefined : course.purchasable,
    isPublished: comingSoon ? undefined : course.isPublished,
    saleHold,
    buyHref,
    hero: featured,
  });
  const learnerLabel =
    learnerStatus === "continue"
      ? ACADEMY_SEN.catalog.statusContinue
      : learnerStatus === "completed"
        ? ACADEMY_SEN.catalog.statusCompleted
        : null;
  const courseDetailHref = `/academy/${course.slug}`;
  const coursePlayerHref = `/academy/${course.slug}/oyna`;
  const browseHref = owned ? coursePlayerHref : courseDetailHref;
  const purchaseHref = storefront.href;
  const separateBuy =
    Boolean(purchaseHref) && purchaseHref !== browseHref && !storefront.ctaDisabled;

  const cinemaCover = course.coverImage ?? academyCourseCoverPath(course.slug);
  const sealedAudio = academyCourseHasSealedAudio(course.slug);
  const sealedLessonCount = academyMediaSealedLessonKeys(course.slug).length;
  const rosterCount = lessonCount || curriculumLessonKeysForSlug(course.slug).length;
  const partialNarration =
    course.slug === ACADEMY_OFF201_STOREFRONT_SLUG &&
    sealedLessonCount > 0 &&
    rosterCount > sealedLessonCount;
  const partialNarrationLabel = ACADEMY_SEN.catalog.sealedLessonBadge(sealedLessonCount, rosterCount);
  const hasAudio = sealedAudio || academyCourseHasCinemaCover(course.slug);
  const narrationMeta =
    rosterCount > 0
      ? ACADEMY_SEN.catalog.cardMetaNarration(rosterCount)
      : ACADEMY_SEN.catalog.narrationBadge;
  const audioBadge = comingSoon ? (
    <span
      data-academy-coming-soon-badge=""
      title={ACADEMY_SEN.catalog.comingSoonHint}
      aria-label={ACADEMY_SEN.catalog.comingSoonHint}
      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-transparent px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--muted)] ring-1 ring-inset ring-[color-mix(in_srgb,var(--border)_70%,transparent)]"
    >
      {ACADEMY_SEN.catalog.comingSoonBadge}
    </span>
  ) : partialNarration ? (
    <span
      data-academy-audio-badge=""
      title={partialNarrationLabel}
      aria-label={partialNarrationLabel}
      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--safir-soft)] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--safir-deep)] ring-1 ring-inset ring-[var(--safir-soft)]"
    >
      <IconVolume className="h-3 w-3" />
      {partialNarrationLabel}
    </span>
  ) : hasAudio ? (
    <span
      data-academy-audio-badge=""
      title={sealedAudio ? ACADEMY_SEN.catalog.audioBadgeHint : narrationMeta}
      aria-label={sealedAudio ? ACADEMY_SEN.catalog.audioBadgeHint : narrationMeta}
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
    : partialNarration
      ? partialNarrationLabel
      : hasAudio
        ? narrationMeta
        : ACADEMY_SEN.catalog.cardMeta(lessonCount);
  const hitAriaExtra = comingSoon
    ? ACADEMY_SEN.catalog.comingSoonHint
    : partialNarration
      ? partialNarrationLabel
      : sealedAudio
        ? ACADEMY_SEN.catalog.audioBadgeHint
        : hasAudio
          ? narrationMeta
          : ACADEMY_SEN.catalog.articleBadgeHint;
  const track = academyTrackTone(course.slug);
  const priceBadgeText = freeGuide
    ? null
    : showcase.honesty === "planned"
      ? PUBLIC_PRICE_PREPARING_LABEL
      : storefront.priceLabel || null;
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
  const chrome = (
    <>
      <span className={cn("inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold", track.badge)}>
        {track.label}
      </span>
      {priceBadgeText ? (
        <span className="inline-flex shrink-0 items-center rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-bold tracking-tight text-white shadow-sm">
          {priceBadgeText}
        </span>
      ) : null}
      {audioBadge}
      {favoriteButton}
    </>
  );

  return (
    <ListingCard
      layout={layout}
      hit="card"
      title={displayTitle}
      moduleCode={course.slug === ACADEMY_OFF201_STOREFRONT_SLUG ? undefined : moduleCode}
      kicker={
        course.slug === ACADEMY_OFF201_STOREFRONT_SLUG ? "İleri Ofis Eğitimi" : levelKicker
      }
      summary={summary}
      footnote={
        course.slug === ACADEMY_OFF201_STOREFRONT_SLUG ? ACADEMY_SEN.catalog.off201Advisory : undefined
      }
      hold={!owned && storefront.ctaDisabled ? saleHold : null}
      summaryClamp={featured ? 3 : 2}
      price={
        freeGuide
          ? undefined
          : showcase.honesty === "planned"
            ? PUBLIC_PRICE_PREPARING_LABEL
            : storefront.priceLabel
      }
      priceCaption={freeGuide ? undefined : (storefront.priceCaption ?? undefined)}
      badge={
        freeGuide
          ? ACADEMY_SEN.catalog.freeGuideBadge
          : showcase.honesty === "planned"
            ? PUBLIC_PRICE_PREPARING_LABEL
            : unpublished
              ? ACADEMY_SEN.catalog.unpublishedBadge
              : saleClosed
                ? ACADEMY_SEN.catalog.pricePending
                : (statusBadge ?? (comingSoon ? undefined : ACADEMY_SEN.catalog.liveBadge))
      }
      lockLabel={undefined}
      meta={cardMeta}
      href={browseHref}
      cta={storefront.cta}
      navigateWhenDisabled={course.isPublished || !storefront.ctaDisabled}
      cardVariant={isLibrary ? "default" : "glass"}
      ctaSlot={
        freeGuide ? (
          <LinkButton
            href={coursePlayerHref as Route}
            size="md"
            variant="primary"
            className="pointer-events-auto relative z-10 h-auto min-h-10 w-full whitespace-normal px-3 py-2 text-center leading-5"
            data-academy-catalog-cta=""
          >
            {storefront.cta}
          </LinkButton>
        ) : separateBuy && purchaseHref ? (
          <BeginCheckoutLink
            href={purchaseHref as Route}
            size="md"
            variant="primary"
            className="pointer-events-auto relative z-10 h-auto min-h-10 w-full whitespace-normal px-3 py-2 text-center leading-5"
            data-academy-catalog-cta=""
            itemId={course.slug}
            itemName={displayTitle}
            valueMinor={course.priceMinor}
            currency={course.currencyCode}
          >
            {storefront.cta}
          </BeginCheckoutLink>
        ) : undefined
      }
      secondaryHref={storefront.secondaryHref || undefined}
      secondaryCta={storefront.secondaryCta || undefined}
      tertiaryHref={!isLibrary && !freeGuide ? OFF_101_EXEMPTION_PATH : undefined}
      tertiaryCta={!isLibrary && !freeGuide ? ACADEMY_SEN.exemption.cta : undefined}
      ctaDisabled={freeGuide ? false : storefront.ctaDisabled}
      ctaSize="md"
      ctaVariant={
        freeGuide
          ? "primary"
          : storefront.ctaDisabled || comingSoon || unpublished
            ? "outline"
            : owned
              ? "success"
              : "primary"
      }
      coverSrc={cinemaCover}
      coverAlt={`${displayTitle} eğitim kapağı`}
      coverComingSoon={comingSoon}
      comingSoonLabel={ACADEMY_SEN.catalog.comingSoonBadge}
      coverPriority={featured}
      coverSizes={ACADEMY_COURSE_COVER_SIZES}
      footerBadge={learnerLabel ?? undefined}
      footerBadgeTone={learnerStatus === "completed" ? "emerald" : "safir"}
      extraBadge={chrome}
      hitAriaExtra={hitAriaExtra}
      footerLayout="stack"
      className={cn(
        "flex h-full min-w-0 flex-col overflow-hidden",
        track.border,
        featured && "ring-1 ring-[color-mix(in_srgb,var(--safir)_42%,transparent)]",
      )}
    />
  );
}
