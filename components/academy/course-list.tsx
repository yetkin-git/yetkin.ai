"use client";

import { useMemo, type ReactNode } from "react";

import type { AcademyCourseWithPrice } from "@/lib/academy/types";
import { CourseCard, type CourseCardSurface } from "@/components/academy/course-card";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import {
  EMPTY_ACADEMY_CATALOG_LEARNER_BOARD,
  type AcademyCatalogLearnerBoard,
} from "@/lib/academy/catalog-learner";
import { orderAcademyCatalogByCurriculum } from "@/lib/academy/catalog-filter";
import { ACADEMY_FLAGSHIP_SKU_SLUG, filterAcademyPilotCatalog } from "@/lib/academy/pilot-sku";
import { cn } from "@/components/ui/cn";

export type AcademyCatalogShelf = "catalog" | "owned" | "favorites";

/** Tek raf — beş compact SKU; amiral `md:col-span-2`. */
export const ACADEMY_CATALOG_GRID_CLASS = "grid gap-4 md:grid-cols-3";

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
}: {
  courses: AcademyCourseWithPrice[];
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
}) {
  const copy = ACADEMY_SEN.catalog;
  const visible = useMemo(() => filterAcademyPilotCatalog(courses), [courses]);
  const ordered = useMemo(() => orderAcademyCatalogByCurriculum(visible), [visible]);
  const ownedSet = useMemo(() => new Set(learnerBoard.ownedSlugs), [learnerBoard.ownedSlugs]);

  let body: ReactNode;
  if (courses.length === 0 || visible.length === 0) {
    body = (
      <Card variant="default" className="border-dashed shadow-sm">
        <p className="text-base font-semibold text-[var(--foreground)]">{copy.empty}</p>
        <p className="mt-2 text-sm text-[var(--muted)]">{copy.description}</p>
      </Card>
    );
  } else {
    body = (
      <section data-academy-catalog-series-list="">
        <ul className={ACADEMY_CATALOG_GRID_CLASS}>
          {ordered.map((course) => {
            const owned = ownedSet.has(course.slug);
            const cardSurface: CourseCardSurface =
              surface === "library" || owned ? "library" : "catalog";
            const featured = course.slug === ACADEMY_FLAGSHIP_SKU_SLUG;
            return (
              <li
                key={course.id}
                className={cn("h-full", featured && "md:col-span-2")}
                data-academy-catalog-series={course.slug}
                data-academy-flagship-card={featured ? "" : undefined}
              >
                <CourseCard
                  course={course}
                  statusBadge={extraBadge}
                  surface={cardSurface}
                  layout="grid"
                  featured={featured}
                  lessonCount={lessonCounts[course.slug] ?? 0}
                  learnerStatus={learnerBoard.statusBySlug[course.slug]}
                  owned={owned}
                />
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  return (
    <section
      aria-label={title}
      className="flex flex-col gap-3"
      data-academy-pilot-room=""
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
            <h1 className="text-pretty text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">
              {title}
            </h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--muted)]">{copy.description}</p>
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
