"use client";

import { useCallback, useEffect, useState, type ReactElement, type ReactNode } from "react";
import { ActivityBadgeModal } from "@/components/junior/activity-modal";
import { useJuniorLessonCompletionPercent } from "@/components/junior/lesson-completion-bar";
import { getJuniorLessonBlueprint } from "@/lib/junior/lesson-engine";
import {
  badgeProgressCount,
  combinedReportScore,
  JUNIOR_BADGE_UNLOCK_THRESHOLD,
  JUNIOR_LESSON_PROGRESS_EVENT,
  markBadgeCelebrated,
  readLessonProgress,
  type JuniorLessonProgress,
  type JuniorLessonProgressEventDetail,
} from "@/lib/junior/progress-tracker";
import type { MicroLessonBand } from "@/lib/junior/micro-progress";

export type QuickToolsStatus = {
  solved: number;
  total: number;
  badge: boolean;
};

export type QuickToolsProps = {
  lessonKey: string;
  profileId?: string;
  /** Pilot timeline cue sayısı; `% Kaç Bitirdim?` hesabı. */
  totalScenes?: number;
  band?: MicroLessonBand;
  /** Araç sekmeleri (Etkinlikler / Soru Bankası / …). */
  tools: ReactNode;
  /** Üst bileşenden gelen anlık stüdyo durumu (yedek; LocalStorage birincil). */
  status?: QuickToolsStatus;
};

function emptyProgress(): JuniorLessonProgress {
  return {
    completedGames: [],
    activityScore: null,
    quizScore: null,
    badgeUnlocked: false,
    badgeCelebrated: false,
  };
}

export function QuickTools({
  lessonKey,
  profileId = "",
  totalScenes,
  band = "junior",
  tools,
  status,
}: QuickToolsProps): ReactElement {
  const [progress, setProgress] = useState<JuniorLessonProgress>(emptyProgress);
  const [celebrate, setCelebrate] = useState(false);
  const watchPercent = useJuniorLessonCompletionPercent({
    profileId,
    lessonKey,
    totalScenes,
    band,
  });

  const refresh = useCallback(() => {
    setProgress(readLessonProgress(profileId, lessonKey));
  }, [lessonKey, profileId]);

  useEffect(() => {
    refresh();
    function onProgress(event: Event) {
      const detail = (event as CustomEvent<JuniorLessonProgressEventDetail>).detail;
      if (!detail) {
        return;
      }
      if (detail.lessonKey !== lessonKey) {
        return;
      }
      if ((detail.profileId.trim() || "anon") !== (profileId.trim() || "anon")) {
        return;
      }
      setProgress(detail.progress);
      if (detail.justUnlockedBadge && !detail.progress.badgeCelebrated) {
        setCelebrate(true);
      }
    }
    window.addEventListener(JUNIOR_LESSON_PROGRESS_EVENT, onProgress);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(JUNIOR_LESSON_PROGRESS_EVENT, onProgress);
      window.removeEventListener("storage", refresh);
    };
  }, [lessonKey, profileId, refresh]);

  const solved = Math.max(badgeProgressCount(progress), status?.solved ?? 0);
  const total = status?.total ?? JUNIOR_BADGE_UNLOCK_THRESHOLD;
  const badge = progress.badgeUnlocked || Boolean(status?.badge);
  const reportScore = combinedReportScore(progress);
  const blueprint = getJuniorLessonBlueprint(lessonKey);

  function closeCelebrate() {
    setCelebrate(false);
    markBadgeCelebrated(profileId, lessonKey);
    refresh();
  }

  return (
    <aside
      data-junior-studio-dock=""
      data-junior-quick-tools=""
      className="flex min-w-0 items-stretch gap-2 rounded-2xl border border-[var(--border)] bg-white p-2 xl:sticky xl:top-0 xl:block xl:self-start xl:p-3"
    >
      <p className="hidden text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500 xl:block">
        Hızlı araçlar
      </p>

      <div
        data-junior-progress-panel=""
        data-junior-lesson-completion=""
        data-junior-completion-percent={watchPercent}
        className="flex w-[5.5rem] shrink-0 flex-col justify-center rounded-2xl border border-slate-200 bg-slate-50 px-2 py-1.5 xl:mt-3 xl:w-auto xl:px-3 xl:py-3"
        aria-label={`Ders ilerleme ${watchPercent} yüzde`}
      >
        <p className="hidden text-xs font-bold text-slate-500 xl:block">İlerleme durumu</p>
        <p className="text-sm font-black leading-tight tabular-nums text-slate-900 xl:mt-1 xl:text-lg">
          {watchPercent}%
        </p>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200 xl:mt-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--safir)] to-emerald-500 transition-[width] duration-300"
            style={{ width: `${watchPercent}%` }}
          />
        </div>
        <p className="mt-1 hidden text-[10px] font-semibold leading-tight text-slate-500 xl:block">
          % Kaç Bitirdim? · {progress.completedGames.length} oyun tamam
        </p>
      </div>

      <div
        className="flex w-[5.5rem] shrink-0 flex-col justify-center rounded-2xl border border-slate-200 bg-slate-50 px-2 py-1.5 xl:mt-3 xl:w-auto xl:px-3 xl:py-3"
        data-junior-score-panel=""
      >
        <p className="hidden text-xs font-bold text-slate-500 xl:block">Puan durumu</p>
        <p className="text-sm font-black leading-tight text-slate-900 xl:mt-1 xl:text-lg">
          {solved} / {total}
        </p>
        {reportScore !== null ? (
          <p
            className="mt-0.5 text-[10px] font-extrabold tabular-nums text-emerald-700 xl:text-xs"
            data-junior-report-score=""
          >
            Karne: %{reportScore}
          </p>
        ) : (
          <p className="mt-0.5 hidden text-[10px] font-semibold text-slate-500 xl:block">
            Etkinlik / test puanı bekleniyor
          </p>
        )}
      </div>

      <div
        className={`flex w-[5.5rem] shrink-0 flex-col justify-center rounded-2xl border px-2 py-1.5 xl:mt-3 xl:w-auto xl:px-3 xl:py-3 ${
          badge ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-slate-50"
        }`}
        data-junior-studio-badge=""
        data-junior-badge-panel=""
      >
        <p className="hidden text-xs font-bold text-slate-500 xl:block">Rozet sistemi</p>
        <p
          className={`text-[10px] font-extrabold leading-tight xl:mt-1 xl:text-xs ${
            badge ? "animate-badge-pop text-amber-800" : "text-slate-600"
          }`}
          data-junior-badge-label=""
        >
          {badge
            ? blueprint.badge.chipLabel
            : `Rozet ${JUNIOR_BADGE_UNLOCK_THRESHOLD} oyunda açılır`}
        </p>
      </div>

      {tools}

      <ActivityBadgeModal open={celebrate} lessonKey={lessonKey} onClose={closeCelebrate} />
    </aside>
  );
}
