"use client";

import { useEffect, useMemo, useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { LessonMediaPlayer } from "@/components/academy/lesson-media-player";
import { LessonStudyTabs } from "@/components/academy/lesson-study-tabs";
import { LessonTeleprompter } from "@/components/academy/lesson-teleprompter";
import { LessonCinemaEyeLayer } from "@/components/academy/lesson-visual-stage";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { normalizeAcronyms } from "@/lib/academy/acronym-normalizer";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { academyExamStartGateHref } from "@/lib/academy/continue-board";
import { ACADEMY_EXAM_PASS_SCORE } from "@/lib/academy/exam";
import {
  canAdvanceAcademyPlayerLesson,
  isAcademyPlayerExamReady,
  nextAcademyPlayerLesson,
  prevAcademyPlayerLesson,
} from "@/lib/academy/lesson-advance";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";
import {
  academyLessonKindLabel,
  academyLessonMediaMeta,
} from "@/lib/academy/lesson-meta";
import { loadAcademyLessonVisualStage } from "@/lib/academy/lesson-visual-stage";
import type { AcademyLessonDiagramSlot, AcademyLessonMicroVideoSlot } from "@/lib/academy/lesson-media";

export type CurriculumPlayerLesson = {
  key: string;
  order: number;
  title: string;
  body: string;
  completed: boolean;
  open: boolean;
  contentVersion?: string;
  completedAt?: Date | string | null;
  diagrams?: readonly AcademyLessonDiagramSlot[];
  microVideos?: readonly AcademyLessonMicroVideoSlot[];
};

export function CurriculumPlayer({
  courseId,
  courseSlug,
  lessons,
  curriculumComplete,
  workTasksComplete,
}: {
  courseId: string;
  courseSlug: string;
  lessons: CurriculumPlayerLesson[];
  curriculumComplete: boolean;
  workTasksComplete?: boolean;
}) {
  const router = useRouter();
  const copy = ACADEMY_SEN.player;
  const outline = ACADEMY_SEN.outline;
  const firstOpen = lessons.find((lesson) => lesson.open && !lesson.completed) ?? lessons[0];
  const [activeKey, setActiveKey] = useState(firstOpen?.key ?? lessons[0]?.key ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [mediaElapsed, setMediaElapsed] = useState(0);
  const [mediaPlaying, setMediaPlaying] = useState(false);
  const [completedKeys, setCompletedKeys] = useState(
    () => new Set(lessons.filter((lesson) => lesson.completed).map((lesson) => lesson.key)),
  );

  useEffect(() => {
    setCompletedKeys(new Set(lessons.filter((lesson) => lesson.completed).map((lesson) => lesson.key)));
  }, [lessons]);

  const active = lessons.find((lesson) => lesson.key === activeKey) ?? firstOpen;
  const examOpen = isAcademyPlayerExamReady({
    curriculumComplete,
    workTasksComplete,
    lessons,
    completedKeys,
  });
  const nextLesson = active ? nextAcademyPlayerLesson(lessons, active.key) : null;
  const prevLesson = active ? prevAcademyPlayerLesson(lessons, active.key) : null;
  const canAdvance = canAdvanceAcademyPlayerLesson(active ?? null, nextLesson);
  const canGoPrev = Boolean(prevLesson?.open);
  const canGoNext = Boolean(nextLesson && (nextLesson.open || canAdvance));
  const activeCompleted = active ? completedKeys.has(active.key) || active.completed : false;
  const activeTitle = active ? normalizeAcronyms(active.title) : "";
  const playerLayer = useMemo(
    () => (active ? academyCitizenPlayerLayer(courseSlug, active.key) : { kind: "article" as const }),
    [active, courseSlug],
  );
  const karaoke = playerLayer.kind === "article+karaoke" ? playerLayer : null;
  const eyeStage = karaoke ? loadAcademyLessonVisualStage(karaoke.lessonKey) : null;

  useEffect(() => {
    setMediaElapsed(0);
    setMediaPlaying(false);
  }, [activeKey]);

  function goToNextLesson(lessonKey: string) {
    setError(null);
    setActiveKey(lessonKey);
  }

  async function completeLesson(lessonKey: string): Promise<{ ok: boolean; nextLessonKey: string | null }> {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/academy/courses/${courseId}/curriculum`,
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ lessonKey }),
        }),
      );
      const parsed = parseRailClientJson<{
        player?: { curriculumComplete?: boolean; nextLessonKey?: string | null };
      }>(await response.json());
      if (!parsed.ok) {
        setError(parsed.error || copy.completeFail);
        return { ok: false, nextLessonKey: null };
      }
      setCompletedKeys((current) => {
        const next = new Set(current);
        next.add(lessonKey);
        return next;
      });
      const nextKey = parsed.data.player?.nextLessonKey ?? null;
      if (nextKey) {
        goToNextLesson(nextKey);
      }
      router.refresh();
      return { ok: true, nextLessonKey: nextKey };
    } catch {
      setError(copy.completeFail);
      return { ok: false, nextLessonKey: null };
    } finally {
      setPending(false);
    }
  }

  function onMediaEnded() {
    if (!active || pending) {
      return;
    }
    if (active.open && !activeCompleted) {
      void completeLesson(active.key);
      return;
    }
    if (nextLesson && canGoNext) {
      goToNextLesson(nextLesson.key);
    }
  }

  function onPrevLesson() {
    if (!prevLesson?.open) {
      return;
    }
    setError(null);
    setActiveKey(prevLesson.key);
  }

  function onNextOrComplete() {
    if (!active) {
      return;
    }
    if (active.open && !activeCompleted) {
      void completeLesson(active.key);
      return;
    }
    if (nextLesson && canGoNext) {
      goToNextLesson(nextLesson.key);
    }
  }

  const examLaunchLabel = copy.examLaunchCta(
    lessons.filter((lesson) => completedKeys.has(lesson.key) || lesson.completed).length,
    lessons.length,
    ACADEMY_EXAM_PASS_SCORE,
  );
  const primaryLabel = pending
    ? copy.completing
    : examOpen
      ? examLaunchLabel
      : active && active.open && !activeCompleted
        ? copy.completeCta
        : copy.nextLessonCta;
  const primaryDisabled = pending || (!examOpen && !(active?.open && !activeCompleted) && !canGoNext);

  const playlist = (
    <aside
      className="academy-player-rail flex min-h-0 flex-col overflow-hidden max-lg:max-h-28 lg:sticky lg:top-3 lg:max-h-[calc(100dvh-5.5rem)] lg:self-start"
      data-academy-player-playlist=""
    >
      <p className="shrink-0 px-1 pb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
        {copy.playlistLabel}
      </p>
      <ol
        className="flex min-h-0 gap-2 overflow-x-auto overscroll-contain pr-1 lg:flex-1 lg:flex-col lg:space-y-2 lg:gap-0 lg:overflow-y-auto"
        aria-label={copy.playlistLabel}
      >
        {lessons.map((lesson) => {
          const selected = lesson.key === active?.key;
          const completed = completedKeys.has(lesson.key) || lesson.completed;
          const media = academyLessonMediaMeta({ ...lesson, courseSlug });
          const kindLabel = academyLessonKindLabel(media.kind, outline);
          return (
            <li key={lesson.key} className="max-lg:min-w-[16rem] max-lg:shrink-0">
              <button
                type="button"
                disabled={!lesson.open}
                aria-current={selected ? "true" : undefined}
                onClick={() => {
                  if (lesson.key === active?.key) {
                    return;
                  }
                  setError(null);
                  setActiveKey(lesson.key);
                }}
                className={`academy-player-rail-item flex w-full items-center gap-2.5 rounded-[0.9rem] px-3.5 py-2.5 text-left text-[13px] leading-snug tracking-[-0.014em] ${
                  selected ? "academy-player-rail-item--active" : "text-[var(--muted)]"
                } disabled:cursor-not-allowed disabled:opacity-45`}
              >
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    selected
                      ? "bg-[var(--safir)] shadow-[0_0_10px_var(--safir)]"
                      : completed
                        ? "bg-[var(--muted)]"
                        : "bg-transparent"
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className={`block line-clamp-2 font-medium ${selected ? "text-white" : "text-[var(--foreground)]"}`}>
                    {lesson.order}. {normalizeAcronyms(lesson.title)}
                  </span>
                  <span className={`block text-[11px] ${selected ? "text-white/70" : "text-[var(--muted)]"}`}>
                    {kindLabel} · {outline.durationMin(media.durationMin)}
                    {completed ? ` · ${copy.alreadyDone}` : ""}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </aside>
  );

  return (
    <div
      className="academy-player-shell grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_auto] gap-5 overflow-visible lg:grid-cols-[minmax(0,1fr)_19rem] lg:grid-rows-[auto] lg:items-start lg:gap-6"
      data-academy-player="article"
      data-academy-player-layout="document"
    >
      {active ? (
        <>
          <div
            className="academy-player-main relative flex min-h-0 min-w-0 flex-col gap-5 lg:col-start-1"
            data-academy-hybrid="media-then-study"
          >
            <header className="shrink-0 px-1 sm:px-0 flex flex-wrap items-center justify-between gap-2">
              <h2 className="truncate text-[1.125rem] font-semibold tracking-[-0.032em] text-slate-900 sm:text-[1.375rem] sm:leading-[1.2]">
                {activeTitle}
              </h2>
              <span
                data-academy-mode-badge=""
                data-academy-mode={karaoke ? "karaoke" : "article"}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  karaoke
                    ? "bg-[var(--safir-soft)] text-[var(--safir-deep)]"
                    : "border border-slate-200 bg-white text-slate-600"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${karaoke ? "bg-[var(--safir)]" : "bg-slate-400"}`} />
                {karaoke ? "Sesli anlatım" : "Makale"}
              </span>
            </header>

            {karaoke ? (
              <section
                className="academy-player-karaoke academy-player-widescreen academy-cinema-stage overflow-hidden rounded-2xl border border-slate-200 bg-slate-950"
                data-academy-karaoke="sealed"
                data-academy-media="sealed-wav"
              >
                {eyeStage ? (
                  <LessonCinemaEyeLayer
                    stage={eyeStage}
                    currentTime={mediaElapsed}
                    playing={mediaPlaying}
                    captions={false}
                  />
                ) : null}
                <LessonTeleprompter
                  cues={karaoke.cues}
                  elapsedSec={mediaElapsed}
                  playing={mediaPlaying}
                  overlay
                />
                <LessonMediaPlayer
                  key={active.key}
                  courseSlug={courseSlug}
                  lessonKey={active.key}
                  lessonTitle={activeTitle}
                  onSpokenElapsedChange={setMediaElapsed}
                  onPlayingChange={setMediaPlaying}
                  onEnded={onMediaEnded}
                />
              </section>
            ) : null}

            <LessonStudyTabs
              lessonKey={active.key}
              articleBody={active.body}
              courseSlug={courseSlug}
              examOpen={examOpen}
              lessonOrder={active.order}
              lessonTotal={lessons.length}
              nextLessonTitle={nextLesson ? normalizeAcronyms(nextLesson.title) : undefined}
            />

            <div
              className="academy-player-dock academy-player-action-bar relative z-10 shrink-0 px-1 py-2 sm:px-0"
              data-academy-player-dock=""
            >
              <div className="academy-player-dock-inner flex flex-wrap items-center justify-between gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="min-h-10 rounded-full px-4 text-[13px] font-medium"
                  data-academy-prev-lesson-cta=""
                  onClick={onPrevLesson}
                  disabled={!canGoPrev || pending}
                >
                  {copy.prevLessonCta}
                </Button>
                {examOpen ? (
                  <LinkButton
                    href={academyExamStartGateHref(courseSlug) as Route}
                    size="sm"
                    variant="success"
                    className="min-h-10 rounded-full px-5 text-[13px]"
                    data-academy-next-lesson-cta=""
                    data-academy-exam-launch=""
                  >
                    {examLaunchLabel}
                  </LinkButton>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    className="min-h-10 rounded-full px-5 text-[13px]"
                    data-academy-next-lesson-cta=""
                    onClick={onNextOrComplete}
                    disabled={primaryDisabled}
                  >
                    {primaryLabel}
                  </Button>
                )}
              </div>
              {error ? (
                <p aria-live="assertive" className="mt-2 text-xs text-[var(--rose)]">
                  {error}
                </p>
              ) : null}
            </div>
          </div>
          {playlist}
        </>
      ) : (
        <p className="text-[15px] text-[var(--muted)]">{copy.openCta}</p>
      )}
    </div>
  );
}
