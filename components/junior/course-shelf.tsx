"use client";

import { ElectiveGrid } from "@/components/junior/elective-grid";
import { ElectiveQuotaModal } from "@/components/junior/elective-quota-modal";
import { VisualCourseCards } from "@/components/junior/visual-course-cards";
import { formatJuniorElectiveShelfNote } from "@/lib/junior/elective-shelf-note";
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
  electiveNote,
  quota,
  audit = false,
}: {
  courses: JuniorCourseShelf[];
  electiveCourses: JuniorCourseShelf[];
  tab: JuniorShelfTab;
  checkoutHref: string;
  priceLabel?: string | null;
  /** `juniorElectiveOpenable` sonucundan kurulmuş vitrin cümlesi. */
  electiveNote?: string;
  /** Super Admin veya denetçi. Seçmeli kilitli kartın incele düğmesini açar. */
  audit?: boolean;
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
  const shelfElectives = electiveCourses.filter((course) => course.slug !== "jr_06_ing");
  const electiveCopy =
    electiveNote ??
    formatJuniorElectiveShelfNote(
      shelfElectives.map((course) => ({
        title: course.title,
        packageOpen:
          course.track === "elective" &&
          course.slug !== "jr_06_ing" &&
          course.lessons.length > 0 &&
          course.lessons.every((lesson) => lesson.status === "fresh"),
      })),
    );

  return (
    <div className="grid gap-3">
      {electiveOpen ? (
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm leading-6 text-[var(--muted)]">{electiveCopy}</p>
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
          <ElectiveGrid courses={shelfElectives} audit={audit} />
        </div>
      ) : (
        <VisualCourseCards
          courses={visible}
          checkoutHref={checkoutHref}
          priceLabel={priceLabel}
          profileId={quota?.profileId ?? ""}
        />
      )}
    </div>
  );
}
