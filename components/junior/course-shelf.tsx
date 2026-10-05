"use client";

import { ElectiveGrid } from "@/components/junior/elective-grid";
import { ElectiveQuotaModal } from "@/components/junior/elective-quota-modal";
import { VisualCourseCards } from "@/components/junior/visual-course-cards";
import { JUNIOR_ELECTIVE_CATEGORY, type JuniorCourseShelf } from "@/lib/junior/types";

export const JUNIOR_SHELF_TABS = [
  "Tüm Dersler",
  "Matematik",
  "Fen Bilimleri",
  "Türkçe",
  "İngilizce",
  JUNIOR_ELECTIVE_CATEGORY,
] as const;

export type JuniorShelfTab = (typeof JUNIOR_SHELF_TABS)[number];

type ElectivePick = { slug: string; title: string; subject: string };

export function CourseShelf({
  courses,
  electiveCourses,
  schoolWeek,
  tab,
  onTabChange,
  quota,
}: {
  courses: JuniorCourseShelf[];
  electiveCourses: JuniorCourseShelf[];
  schoolWeek: number | null;
  tab: JuniorShelfTab;
  onTabChange: (tab: JuniorShelfTab) => void;
  quota: {
    profileId: string;
    selected: readonly string[];
    planActive: boolean;
    picks: readonly ElectivePick[];
  } | null;
}) {
  const core = courses.filter((course) => course.track === "core");
  const visible =
    tab === "Tüm Dersler" ? core : tab === JUNIOR_ELECTIVE_CATEGORY ? [] : core.filter((course) => course.subject === tab);
  const electiveOpen = tab === JUNIOR_ELECTIVE_CATEGORY;

  return (
    <div className="grid gap-4">
      {schoolWeek ? (
        <p className="text-sm text-[var(--muted)]">Okul haftası {schoolWeek}. İşaret, bu haftanın konusudur.</p>
      ) : null}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Ders filtresi">
        {JUNIOR_SHELF_TABS.map((label) => {
          const selected = tab === label;
          return (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onTabChange(label)}
              className={
                selected
                  ? "rounded-full bg-[var(--safir)] px-4 py-2 text-sm font-semibold text-white"
                  : "rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-sm font-semibold"
              }
            >
              {label}
            </button>
          );
        })}
      </div>
      {electiveOpen ? (
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm leading-6 text-[var(--muted)]">
              İlk konu ücretsizdir. Pakette en fazla üç ders durur.
            </p>
            {quota ? (
              <ElectiveQuotaModal
                profileId={quota.profileId}
                selected={quota.selected}
                planActive={quota.planActive}
                picks={quota.picks}
              />
            ) : null}
          </div>
          <ElectiveGrid courses={electiveCourses} />
        </div>
      ) : (
        <VisualCourseCards courses={visible} />
      )}
    </div>
  );
}
