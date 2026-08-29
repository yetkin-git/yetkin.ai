"use client";

import { useMemo, type ReactNode } from "react";

import type { AcademyCourseWithPrice } from "@/lib/academy/types";
import { CourseCard, type CourseCardSurface } from "@/components/academy/course-card";
import { AcademyPilotPath } from "@/components/academy/pilot-path";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import {
  EMPTY_ACADEMY_CATALOG_LEARNER_BOARD,
  type AcademyCatalogLearnerBoard,
} from "@/lib/academy/catalog-learner";
import { filterAcademyPilotCatalog } from "@/lib/academy/pilot-sku";

export type AcademyCatalogShelf = "catalog" | "owned" | "favorites";

/** Dört kart vitrin — 2 sütun ızgara; eski 3 sütun pazar ızgarası kapalı. */
export const ACADEMY_CATALOG_GRID_CLASS = "grid gap-4 sm:grid-cols-2";

export function CourseList({
  courses,
  extraBadge,
  surface = "catalog",
  learnerBoard = EMPTY_ACADEMY_CATALOG_LEARNER_BOARD,
  lessonCounts = {},
  title = ACADEMY_SEN.catalog.title,
  certificatesCta = ACADEMY_SEN.catalog.certificatesCta,
  lead = null,
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
  /** Resume şeridi — başlık satırı ile yol haritası arasında. */
  lead?: ReactNode;
}) {
  const copy = ACADEMY_SEN.catalog;
  const pathway = ACADEMY_SEN.pilotPath;
  const visible = useMemo(() => filterAcademyPilotCatalog(courses), [courses]);
  const ownedSet = useMemo(() => new Set(learnerBoard.ownedSlugs), [learnerBoard.ownedSlugs]);

  let body: ReactNode;
  if (courses.length === 0 || visible.length === 0) {
    body = (
      <Card variant="default" className="border-dashed shadow-sm">
        <p className="text-base font-semibold text-[var(--foreground)]">{copy.empty}</p>
        <p className="mt-2 text-sm text-[var(--muted)]">{pathway.lead}</p>
      </Card>
    );
  } else {
    body = (
      <ul className={ACADEMY_CATALOG_GRID_CLASS}>
        {visible.map((course) => {
          const owned = ownedSet.has(course.slug);
          const cardSurface: CourseCardSurface = surface === "library" || owned ? "library" : "catalog";
          return (
            <li key={course.id} className="h-full">
              <CourseCard
                course={course}
                statusBadge={extraBadge}
                surface={cardSurface}
                layout="grid"
                lessonCount={lessonCounts[course.slug] ?? 0}
                learnerStatus={learnerBoard.statusBySlug[course.slug]}
                owned={owned}
              />
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <section
      aria-label={pathway.title}
      className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden"
      data-academy-pilot-room=""
    >
      <div className="relative z-10 flex flex-shrink-0 flex-col gap-3">
        <div
          className="flex flex-wrap items-center justify-between gap-2"
          data-academy-catalog-header=""
        >
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--safir-deep)]">
              {pathway.eyebrow}
            </p>
            <h1 className="text-pretty text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">
              {title}
            </h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--muted)]">{pathway.lead}</p>
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
        <AcademyPilotPath />
      </div>
      <div
        className="min-h-0 flex-1 overflow-y-auto pr-2 pb-8"
        data-academy-catalog-scroll=""
      >
        {body}
      </div>
    </section>
  );
}
