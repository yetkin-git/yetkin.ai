"use client";

import { ElectiveGrid } from "@/components/junior/elective-grid";
import { ElectiveQuotaModal } from "@/components/junior/elective-quota-modal";
import { VisualCourseCards } from "@/components/junior/visual-course-cards";
import { JUNIOR_QUIZ_PREPARING_LABEL } from "@/lib/junior/limits";
import { JUNIOR_ELECTIVE_CATEGORY, type JuniorCourseShelf } from "@/lib/junior/types";

export const JUNIOR_SHELF_TABS = [
  "Tüm Dersler",
  "Matematik",
  "Fen Bilimleri",
  "Türkçe",
  "İngilizce",
  "Sosyal Bilgiler",
  JUNIOR_ELECTIVE_CATEGORY,
] as const;

export type JuniorShelfTab = (typeof JUNIOR_SHELF_TABS)[number];

type ElectivePick = { slug: string; title: string; subject: string };

export function JuniorShelfTabs({
  tab,
  onTabChange,
}: {
  tab: JuniorShelfTab;
  onTabChange: (tab: JuniorShelfTab) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Ders filtresi">
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
                ? "rounded-full bg-[var(--safir)] px-3 py-1.5 text-sm font-semibold text-white"
                : "rounded-full border border-[var(--border-strong)] bg-white px-3 py-1.5 text-sm font-semibold"
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function CourseShelf({
  courses,
  electiveCourses,
  tab,
  checkoutHref,
  priceLabel = null,
  quota,
}: {
  courses: JuniorCourseShelf[];
  electiveCourses: JuniorCourseShelf[];
  tab: JuniorShelfTab;
  checkoutHref: string;
  priceLabel?: string | null;
  quota: {
    profileId: string;
    selected: readonly string[];
    planActive: boolean;
    picks: readonly ElectivePick[];
    priceLabel: string | null;
  } | null;
}) {
  const core = courses.filter((course) => course.track === "core");
  const visible =
    tab === "Tüm Dersler" ? core : tab === JUNIOR_ELECTIVE_CATEGORY ? [] : core.filter((course) => course.subject === tab);
  const electiveOpen = tab === JUNIOR_ELECTIVE_CATEGORY;

  return (
    <div className="grid gap-3">
      {electiveOpen ? (
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm leading-6 text-[var(--muted)]">
              {JUNIOR_QUIZ_PREPARING_LABEL}. Bu altı ders henüz tam ders değildir. Ses, soru ve ısınma
              hazır olunca çekirdek listeye katılır. Pakette en fazla üç ders durur.
            </p>
            {quota ? (
              <ElectiveQuotaModal
                profileId={quota.profileId}
                selected={quota.selected}
                planActive={quota.planActive}
                picks={quota.picks}
                priceLabel={quota.priceLabel}
              />
            ) : null}
          </div>
          <ElectiveGrid courses={electiveCourses} />
        </div>
      ) : (
        <VisualCourseCards
          courses={visible}
          checkoutHref={checkoutHref}
          priceLabel={priceLabel}
        />
      )}
    </div>
  );
}
