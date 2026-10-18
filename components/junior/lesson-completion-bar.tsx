"use client";

import { useCallback, useEffect, useState, type ReactElement } from "react";
import {
  JUNIOR_MICRO_PROGRESS_EVENT,
  microCompletionPercent,
  readMicroProgress,
  type JuniorMicroProgressEventDetail,
  type MicroLessonBand,
} from "@/lib/junior/micro-progress";
import { JUNIOR_VECTOR_STEP_COUNT } from "@/lib/junior/types";

export type JuniorLessonCompletionBarProps = {
  profileId: string;
  lessonKey: string;
  /** Sahne / mikro-adım toplamı. Varsayılan 12. */
  totalScenes?: number;
  band?: MicroLessonBand;
  /** Kartlarda ince şerit; sağ panelde tam etiket. */
  compact?: boolean;
};

export function useJuniorLessonCompletionPercent(input: {
  profileId: string;
  lessonKey: string;
  totalScenes?: number;
  band?: MicroLessonBand;
}): number {
  const {
    profileId,
    lessonKey,
    totalScenes = JUNIOR_VECTOR_STEP_COUNT,
    band = "junior",
  } = input;
  const [percent, setPercent] = useState(0);

  const refresh = useCallback(() => {
    const record = readMicroProgress(band, profileId, lessonKey);
    setPercent(microCompletionPercent(record, totalScenes));
  }, [band, lessonKey, profileId, totalScenes]);

  useEffect(() => {
    refresh();
    function onProgress(event: Event) {
      const detail = (event as CustomEvent<JuniorMicroProgressEventDetail>).detail;
      if (!detail) {
        return;
      }
      if (detail.band !== band) {
        return;
      }
      if (detail.lessonKey !== lessonKey) {
        return;
      }
      if ((detail.profileId.trim() || "anon") !== (profileId.trim() || "anon")) {
        return;
      }
      refresh();
    }
    window.addEventListener(JUNIOR_MICRO_PROGRESS_EVENT, onProgress);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(JUNIOR_MICRO_PROGRESS_EVENT, onProgress);
      window.removeEventListener("storage", refresh);
    };
  }, [band, lessonKey, profileId, refresh]);

  return percent;
}

/** `% Kaç Bitirdim?` — izlenen sahnelerden canlı yüzde. */
export function JuniorLessonCompletionBar(props: JuniorLessonCompletionBarProps): ReactElement {
  const {
    profileId,
    lessonKey,
    totalScenes = JUNIOR_VECTOR_STEP_COUNT,
    band = "junior",
    compact = false,
  } = props;
  const percent = useJuniorLessonCompletionPercent({
    profileId,
    lessonKey,
    totalScenes,
    band,
  });

  if (compact) {
    return (
      <div
        data-junior-lesson-completion=""
        data-junior-completion-percent={percent}
        className="grid gap-1"
        aria-label={`Ders ilerleme ${percent} yüzde`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
            % Kaç Bitirdim?
          </span>
          <span className="text-[11px] font-black tabular-nums text-slate-800">{percent}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--safir)] to-emerald-500 transition-[width] duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      data-junior-lesson-completion=""
      data-junior-completion-percent={percent}
      className="flex w-[5.5rem] shrink-0 flex-col justify-center rounded-2xl border border-slate-200 bg-slate-50 px-2 py-1.5 xl:mt-3 xl:w-auto xl:px-3 xl:py-3"
      aria-label={`Ders ilerleme ${percent} yüzde`}
    >
      <p className="hidden text-xs font-bold text-slate-500 xl:block">% Kaç Bitirdim?</p>
      <p className="text-sm font-black leading-tight tabular-nums text-slate-900 xl:mt-1 xl:text-lg">
        {percent}%
      </p>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200 xl:mt-2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--safir)] to-emerald-500 transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-1 hidden text-[10px] font-semibold leading-tight text-slate-500 xl:block">
        İzlenen sahneler
      </p>
    </div>
  );
}
