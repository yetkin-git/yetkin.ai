"use client";

import { useState } from "react";
import { CourseShelf, JuniorShelfTabs, type JuniorShelfTab } from "@/components/junior/course-shelf";
import { ProfileSwitcher } from "@/components/junior/profile-switcher";
import { WeeklyReport } from "@/components/junior/weekly-report";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { JUNIOR_ELECTIVE_QUOTA } from "@/lib/junior/limits";
import { juniorPackageCta } from "@/lib/junior/storefront-price";
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
  priceLabel,
  checkoutOpen = true,
  electiveNote,
  audit,
  planOpened = false,
  notice = null,
}: {
  courses: JuniorCourseShelf[];
  electiveCourses: JuniorCourseShelf[];
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
  priceLabel: string | null;
  /** `JUNIOR_CHECKOUT_OPEN` boşken false. Liste fiyatı tahsilat vaadi olmaz. */
  checkoutOpen?: boolean;
  electiveNote?: string;
  audit: boolean;
  planOpened?: boolean;
  notice?: string | null;
}) {
  const [tab, setTab] = useState<JuniorShelfTab>("Tüm Dersler");
  const selected = profiles?.find((profile) => profile.selected) ?? profiles?.[0] ?? null;
  const electiveOpen = tab === JUNIOR_ELECTIVE_CATEGORY;

  return (
    <div className="grid gap-2">
      <div className="relative flex items-start justify-between gap-3 overflow-visible">
        <div className="min-w-0">
          <p className="room-kicker mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--safir-deep)]">
            Junior
          </p>
          {/* H1 arama niyetini taşır: sayfanın title'ı («6. Sınıf Online Dersler») ile
              aynı kümeye konuşur. «Dersler» tek başına hangi sınıf/ders olduğunu söylemez. */}
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            6. Sınıf Online Dersler
          </h1>
          <p className="mt-1 text-sm leading-5 text-[var(--muted)]">
            Matematik, Fen Bilimleri, Türkçe, İngilizce ve Sosyal Bilgiler. Her kartın ilk konusu ücretsiz.
          </p>
        </div>
        <div className="flex max-w-[18rem] flex-wrap items-center justify-end gap-1.5 overflow-visible" aria-label="Vitrin eylemleri">
            {audit ? (
              <span className="inline-flex items-center rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--muted)]">
                Denetim açık
              </span>
            ) : null}
            {profiles && xp ? (
              <ProfileSwitcher
                profiles={profiles}
                xp={xp}
                ready={ready}
                planActive={planActive}
                gradeSwitchRights={gradeSwitchRights}
              />
            ) : (
              <LinkButton href={loginHref} size="sm" variant="outline" className="rounded-full !shadow-none">
                Veli girişi
              </LinkButton>
            )}
            <Button
              type="button"
              size="sm"
              variant={electiveOpen ? "primary" : "outline"}
              className="rounded-full !shadow-none"
              aria-pressed={electiveOpen}
              onClick={() => setTab(JUNIOR_ELECTIVE_CATEGORY)}
            >
              Seçmeli Dersler ({selectedElectives.length}/{JUNIOR_ELECTIVE_QUOTA})
            </Button>
            {weeklyReport && selected ? (
              <WeeklyReport variant="button" nickname={selected.nickname} report={weeklyReport} />
            ) : null}
            <LinkButton
              href={checkoutHref}
              size="sm"
              variant={planActive ? "outline" : "primary"}
              className="rounded-full !shadow-none"
            >
              {juniorPackageCta(priceLabel, checkoutOpen)}
            </LinkButton>
        </div>
      </div>
      <JuniorShelfTabs tab={tab} onTabChange={setTab} />
      {planOpened ? (
        <p className="text-sm leading-6">Yıllık paket açıldı. Kilitli çekirdek dersler hazır.</p>
      ) : null}
      {notice ? <p className="text-sm text-[var(--rose)]">{notice}</p> : null}
      <CourseShelf
        courses={courses}
        electiveCourses={electiveCourses}
        tab={tab}
        checkoutHref={checkoutHref}
        priceLabel={priceLabel}
        checkoutOpen={checkoutOpen}
        electiveNote={electiveNote}
        audit={audit}
        quota={
          selected
            ? {
                profileId: selected.id,
                selected: selectedElectives,
                planActive,
                picks,
                priceLabel,
              }
            : null
        }
      />
    </div>
  );
}
