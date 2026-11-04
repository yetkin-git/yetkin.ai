"use client";

import { useMemo, type ReactNode } from "react";

import type { AcademyCourseWithPrice } from "@/lib/academy/types";
import { CourseCard, type CourseCardSurface } from "@/components/academy/course-card";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";
import {
  EMPTY_ACADEMY_CATALOG_LEARNER_BOARD,
  type AcademyCatalogLearnerBoard,
} from "@/lib/academy/catalog-learner";
import { orderAcademyCatalogByCurriculum } from "@/lib/academy/catalog-filter";
import {
  ACADEMY_FLAGSHIP_SKU_SLUG,
  filterAcademyVitrineCatalog,
} from "@/lib/academy/pilot-sku";

export type AcademyCatalogShelf = "catalog" | "owned" | "favorites";

/** İleri raf. Telefonda bir kolon, tablette iki, masaüstünde üç eşit kart. */
export const ACADEMY_CATALOG_GRID_CLASS =
  "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";

/**
 * Vitrin — yayınlanan eğitimler aynı sayfada şeffaf karttır.
 *
 * `01_office_ai` temel kart olarak önde durur. İleri modüller aynı sayfanın
 * ızgarasındadır; `/academy/ileri` onları gizleyen kapı değildir.
 * Kart gövdesi o eğitimin kendi sayfasına gider. Satın alma ve ücretsiz ders
 * düğmeleri aynı eğitimin kendi adresine bakar.
 * Üst çubuktaki «Ücretsiz Dersi İzle» yalnız demo oynatıcıdır.
 * «Eğitimleri İncele» vitrine gider, oynatıcıya gitmez.
 */
export function CourseList({
  courses,
  extraBadge,
  surface = "catalog",
  learnerBoard = EMPTY_ACADEMY_CATALOG_LEARNER_BOARD,
  lessonCounts = {},
  title = ACADEMY_SEN.catalog.title,
  certificatesCta = ACADEMY_SEN.catalog.certificatesCta,
  lead = null,
  footer = null,
  buyHrefs = {},
  saleHolds = {},
  advancedOnly = false,
}: {  courses: AcademyCourseWithPrice[];
  extraBadge?: string | null;
  /** Katalog/vitrin: keşif kartı. Kütüphane: fiyat yok. */
  surface?: CourseCardSurface;
  learnerBoard?: AcademyCatalogLearnerBoard;
  /** Sunucu müfredat uzunlukları — istemci curriculum çekmez. */
  lessonCounts?: Readonly<Record<string, number>>;
  title?: string;
  certificatesCta?: string;
  /** Resume şeridi — başlık satırı ile liste arasında. */
  lead?: ReactNode;
  /** Yasal künye — katalog gövdesinin sonunda, doğal kaydırmada. */
  footer?: ReactNode;
  /** Slug → Satın Al hedefi. Oturum varsa kasa, yoksa giriş. */
  buyHrefs?: Readonly<Record<string, string>>;
  /** Slug → kapalı kaydın açık nedeni. */
  saleHolds?: Readonly<Record<string, string | null>>;
  /** `/academy/ileri` kipi: yalnız ileri raf basılır, kahraman kart basılmaz. */
  advancedOnly?: boolean;
}) {
  const copy = ACADEMY_SEN.catalog;
  const visible = useMemo(
    () => filterAcademyVitrineCatalog(orderAcademyCatalogByCurriculum(courses)),
    [courses],
  );
  const ordered = visible;
  const ownedSet = useMemo(() => new Set(learnerBoard.ownedSlugs), [learnerBoard.ownedSlugs]);

  const heroCourse = ordered.find((course) => course.slug === ACADEMY_FLAGSHIP_SKU_SLUG) ?? null;
  const advancedCourses = ordered.filter((course) => course.slug !== ACADEMY_FLAGSHIP_SKU_SLUG);

  const heroPreviewHref = `/academy/${ACADEMY_FLAGSHIP_SKU_SLUG}/oyna`;

  const renderCard = (course: AcademyCourseWithPrice, featured: boolean) => {
    const owned = ownedSet.has(course.slug);
    const cardSurface: CourseCardSurface =
      surface === "library" || owned ? "library" : "catalog";
    return (
      <CourseCard
        course={course}
        statusBadge={extraBadge}
        surface={cardSurface}
        layout="grid"
        featured={featured}
        lessonCount={lessonCounts[course.slug] ?? 0}
        learnerStatus={learnerBoard.statusBySlug[course.slug]}
        owned={owned}
        buyHref={buyHrefs[course.slug] ?? null}
        saleHold={saleHolds[course.slug] ?? null}
      />
    );
  };

  let body: ReactNode;
  if (courses.length === 0 || visible.length === 0) {    body = (
      <Card variant="default" className="border-dashed shadow-sm" data-academy-production-band="">
        <p className="text-base font-semibold text-[var(--foreground)]">{copy.empty}</p>
        <p className="mt-2 text-sm text-[var(--muted)]">{copy.description}</p>
      </Card>
    );
  } else if (advancedOnly) {
    // `/academy/ileri` — kahraman kart burada basılmaz, yalnız ileri raf.
    body = (
      <section data-academy-catalog-series-list="" data-academy-advanced-room="">
        <p className="mb-4 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          {copy.advancedRoomLead}
        </p>
        {/* Kart başlıkları `h3`tür. Arada `h2` olmadan sayfa h1 → h3 atlıyordu
            (SEO ve ekran okuyucu hiyerarşisi). Başlık aynı zamanda modül niyetini taşır. */}
        <h2 className="mb-3 text-sm font-semibold tracking-tight text-[var(--foreground)]">
          {copy.advancedListHeading}
        </h2>
        <ul className={ACADEMY_CATALOG_GRID_CLASS}>
          {advancedCourses.map((course) => (
            <li
              key={course.id}
              className="min-w-0 h-full flex flex-col justify-between"
              data-academy-catalog-series={course.slug}
              data-academy-advanced-module=""
            >
              {renderCard(course, false)}
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <LinkButton href="/academy" variant="outline">
            {copy.advancedRoomBackCta}
          </LinkButton>
        </div>
      </section>
    );
  } else {
    body = (
      <section data-academy-catalog-series-list="" data-academy-vitrine-mix="">
        {heroCourse ? (
          <div data-academy-flagship-shelf="" className="mb-6">
            <h2 className="mb-3 text-sm font-semibold tracking-tight text-[var(--foreground)]">
              {copy.boardTitle}
            </h2>
            <h3 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
              {copy.flagshipShelfTitle}
            </h3>
            <p className="mb-3 mt-1 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              {copy.flagshipShelfNote}
            </p>
            <ul className="grid max-w-3xl grid-cols-1 gap-6">
              <li
                className="min-w-0 h-full flex flex-col justify-between"
                data-academy-catalog-series={heroCourse.slug}
                data-academy-flagship-card=""
              >
                {renderCard(heroCourse, true)}
              </li>
            </ul>
          </div>
        ) : null}
        {advancedCourses.length > 0 ? (
          <div data-academy-advanced-shelf="">
            <h2 className="mb-3 text-sm font-semibold tracking-tight text-[var(--foreground)]">
              {copy.advancedShelfTitle}
            </h2>
            <p className="mb-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              {copy.advancedShelfNote}
            </p>
            <ul className={ACADEMY_CATALOG_GRID_CLASS}>
              {advancedCourses.map((course) => (
                <li
                  key={course.id}
                  className="min-w-0 h-full flex flex-col justify-between"
                  data-academy-catalog-series={course.slug}
                  data-academy-advanced-module=""
                >
                  {renderCard(course, false)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section
      aria-label={title}
      className="flex flex-col gap-3"
      data-academy-pilot-room=""
      data-academy-vitrine-mode={advancedOnly ? "advanced" : "mix"}
    >
      <div className="relative z-10 flex flex-col gap-3">
        <div
          className="flex flex-wrap items-center justify-between gap-2"
          data-academy-catalog-header=""
        >
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--safir-deep)]">
              {copy.eyebrow}
            </p>
            <h1 className="text-pretty text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted)]">{copy.description}</p>
            <p className="mt-2 text-sm font-medium text-[var(--safir-deep)]">{copy.stats}</p>
            {/* Ücretsiz ders yalnız demo oynatıcıya gider. Eğitimleri İncele vitrinde kalır. */}
            {!advancedOnly ? (
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <LinkButton
                  href={heroPreviewHref}
                  size="lg"
                  variant="success"
                  className="w-full sm:w-auto"
                  data-academy-hero-preview-cta=""
                >
                  {copy.heroPreviewCta}
                </LinkButton>
                <LinkButton
                  href="/academy"
                  size="lg"
                  className="w-full sm:w-auto"
                  data-academy-hero-browse-cta=""
                >
                  {PUBLIC_SEN.home.academyCta}
                </LinkButton>
              </div>
            ) : null}
            {!advancedOnly ? (
              <p className="mt-2 text-xs leading-6 text-[var(--muted)]">{copy.heroLead}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <LinkButton href="/academy/certificates" variant="outline" className="shrink-0">
              {certificatesCta}
            </LinkButton>
            <LinkButton href="/academy/dogrula" variant="ghost" className="shrink-0">
              {copy.verifyCta}
            </LinkButton>
          </div>
        </div>
        {lead}
      </div>
      <div className="pb-4" data-academy-catalog-scroll="">
        {body}
        {footer ? (
          <div data-academy-catalog-colophon="" className="mt-4">
            {footer}
          </div>
        ) : null}
      </div>
    </section>
  );
}
