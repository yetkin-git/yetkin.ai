"use client";

import { useState } from "react";
import { CourseShelf, type JuniorShelfTab } from "@/components/junior/course-shelf";
import { ProfileSwitcher } from "@/components/junior/profile-switcher";
import { WeeklyReport } from "@/components/junior/weekly-report";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { JUNIOR_ELECTIVE_QUOTA, JUNIOR_YEARLY_LIST_PRICE_LABEL } from "@/lib/junior/limits";
import type { JuniorWeeklyReport } from "@/lib/junior/report";
import {
  JUNIOR_ELECTIVE_CATEGORY,
  type JuniorCourseShelf,
  type JuniorProfileView,
  type JuniorXpView,
} from "@/lib/junior/types";

type ElectivePick = { slug: string; title: string; subject: string };

export function JuniorRoom({
  courses,
  electiveCourses,
  schoolWeek,
  loginHref,
  checkoutHref,
  planActive,
  profiles,
  xp,
  ready,
  gradeSwitchRights,
  selectedElectives,
  weeklyReport,
  picks,
}: {
  courses: JuniorCourseShelf[];
  electiveCourses: JuniorCourseShelf[];
  schoolWeek: number | null;
  loginHref: string;
  checkoutHref: string;
  planActive: boolean;
  profiles: JuniorProfileView[] | null;
  xp: JuniorXpView | null;
  ready: boolean;
  gradeSwitchRights: number;
  selectedElectives: readonly string[];
  weeklyReport: JuniorWeeklyReport | null;
  picks: readonly ElectivePick[];
}) {
  const [tab, setTab] = useState<JuniorShelfTab>("Tüm Dersler");
  const selected = profiles?.find((profile) => profile.selected) ?? profiles?.[0] ?? null;
  const electiveOpen = tab === JUNIOR_ELECTIVE_CATEGORY;

  return (
    <div className="grid gap-4">
      <div
        className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
        aria-label="Kompakt üst bar"
      >
        {profiles && xp ? (
          <ProfileSwitcher
            profiles={profiles}
            xp={xp}
            ready={ready}
            planActive={planActive}
            gradeSwitchRights={gradeSwitchRights}
          />
        ) : (
          <LinkButton href={loginHref} size="sm" variant="outline">
            Veli girişi
          </LinkButton>
        )}
        <div className="flex flex-wrap items-center gap-2 md:ml-auto">
          <Button
            type="button"
            size="sm"
            variant={electiveOpen ? "primary" : "outline"}
            aria-pressed={electiveOpen}
            onClick={() => setTab(JUNIOR_ELECTIVE_CATEGORY)}
          >
            Seçmeli Dersler ({selectedElectives.length}/{JUNIOR_ELECTIVE_QUOTA})
          </Button>
          {weeklyReport && selected ? (
            <WeeklyReport variant="button" nickname={selected.nickname} report={weeklyReport} />
          ) : null}
          <LinkButton href={checkoutHref} size="sm" variant={planActive ? "outline" : "primary"}>
            Paketi Al ({JUNIOR_YEARLY_LIST_PRICE_LABEL})
          </LinkButton>
        </div>
      </div>
      <CourseShelf
        courses={courses}
        electiveCourses={electiveCourses}
        schoolWeek={schoolWeek}
        tab={tab}
        onTabChange={setTab}
        quota={
          selected
            ? {
                profileId: selected.id,
                selected: selectedElectives,
                planActive,
                picks,
              }
            : null
        }
      />
    </div>
  );
}
