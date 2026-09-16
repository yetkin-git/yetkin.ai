"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { LessonMediaPlayer } from "@/components/academy/lesson-media-player";
import { LessonKaraokeStrip } from "@/components/academy/lesson-karaoke-strip";
import { LessonStudyTabs } from "@/components/academy/lesson-study-tabs";
import { LessonCinemaEyeLayer } from "@/components/academy/lesson-visual-stage";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { normalizeAcronyms } from "@/lib/academy/acronym-normalizer";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { academyExamStartGateHref } from "@/lib/academy/continue-board";
import { ACADEMY_EXAM_PASS_SCORE } from "@/lib/academy/exam";
import {
  academyPlayerClockDurationSec,
  academySealedAudioDurationSec,
} from "@/lib/academy/lesson-audio";
import { academyBedOutroTailSec } from "@/lib/academy/lesson-bed-duck";
import {
  ACADEMY_LESSON_AUTO_ADVANCE_DEFAULT,
  canAdvanceAcademyPlayerLesson,
  hasAcademyLessonPlaybackReachedEnd,
  isAcademyPlayerExamReady,
  academyPlayerAutoAdvanceTargetKey,
  nextAcademyPlayerLesson,
  prevAcademyPlayerLesson,
  readAcademyLessonAutoAdvanceFromStorage,
  shouldAutoAdvanceAfterListenEnded,
  writeAcademyLessonAutoAdvanceToStorage,
} from "@/lib/academy/lesson-advance";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
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
  const idempotency = useIdempotencyKey();
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
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(ACADEMY_LESSON_AUTO_ADVANCE_DEFAULT);
  const [autoStartPlayback, setAutoStartPlayback] = useState(false);
  const autoAdvanceEnabledRef = useRef(autoAdvanceEnabled);
  const endedLessonKeyRef = useRef<string | null>(null);
  const playbackStartedKeyRef = useRef<string | null>(null);
  const lessonsRef = useRef(lessons);

  useEffect(() => {
    setAutoAdvanceEnabled(readAcademyLessonAutoAdvanceFromStorage());
  }, []);

  autoAdvanceEnabledRef.current = autoAdvanceEnabled;
  lessonsRef.current = lessons;

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
  const activeCompleted = active ? completedKeys.has(active.key) || active.completed : false;
  const activeForAdvance = active ? { ...active, completed: activeCompleted } : null;
  const canAdvance = canAdvanceAcademyPlayerLesson(activeForAdvance, nextLesson);
  const canGoPrev = Boolean(prevLesson?.open);
  const canGoNext = Boolean(nextLesson && (nextLesson.open || canAdvance));
  const activeClockDurationSec = active
    ? academyPlayerClockDurationSec({
        audioDuration: 0,
        sealedDuration: academySealedAudioDurationSec(courseSlug, active.key),
        spokenDuration: 0,
        outroTailSec: academyBedOutroTailSec(active.key),
      })
    : 0;
  const activeTitle = active ? normalizeAcronyms(active.title) : "";
  const playerLayer = useMemo(
    () => (active ? academyCitizenPlayerLayer(courseSlug, active.key) : { kind: "article" as const }),
    [active, courseSlug],
  );
  const karaoke = playerLayer.kind === "article+karaoke" ? playerLayer : null;
  const eyeStage = karaoke ? loadAcademyLessonVisualStage(karaoke.lessonKey) : null;

  useEffect(() => {
    endedLessonKeyRef.current = null;
    playbackStartedKeyRef.current = null;
    setMediaElapsed(0);
    setMediaPlaying(false);
  }, [activeKey]);

  function selectLesson(lessonKey: string, options?: { autoStart?: boolean }) {
    if (!lessonKey || lessonKey === activeKey) {
      return;
    }
    setError(null);
    setMediaElapsed(0);
    setMediaPlaying(false);
    if (options?.autoStart) {
      setAutoStartPlayback(true);
    } else {
      setAutoStartPlayback(false);
    }
    setActiveKey(lessonKey);
  }

  function goToNextLesson(lessonKey: string) {
    selectLesson(lessonKey, { autoStart: true });
  }

  function autoAdvanceNextLesson(endedLessonKey: string) {
    const sequential = academyPlayerAutoAdvanceTargetKey({
      autoAdvanceEnabled: autoAdvanceEnabledRef.current,
      lessons: lessonsRef.current,
      endedLessonKey,
    });
    if (!sequential) {
      return;
    }
    goToNextLesson(sequential);
  }

  function onToggleAutoAdvance() {
    setAutoAdvanceEnabled((current) => {
      const next = !current;
      writeAcademyLessonAutoAdvanceToStorage(next);
      return next;
    });
  }

  async function completeLesson(
    lessonKey: string,
    options?: { advance?: boolean },
  ): Promise<{ ok: boolean; nextLessonKey: string | null }> {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/academy/courses/${courseId}/curriculum`,
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json", ...idempotency.headers() },
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
      // API `player.nextLessonKey` ilk tamamlanmamış derstir (devam paneli).
      // Oynatıcı geçişi müfredat sırasındaki +1 adımdır; tamamlanmış ders atlanmaz.
      const sequentialKey = nextAcademyPlayerLesson(lessonsRef.current, lessonKey)?.key ?? null;
      if ((options?.advance ?? true) && sequentialKey) {
        if (autoAdvanceEnabledRef.current) {
          autoAdvanceNextLesson(lessonKey);
        } else {
          selectLesson(sequentialKey, { autoStart: false });
        }
      }
      router.refresh();
      return { ok: true, nextLessonKey: sequentialKey };
    } catch {
      setError(copy.completeFail);
      return { ok: false, nextLessonKey: null };
    } finally {
      setPending(false);
      idempotency.rotate();
    }
  }

  function onMediaEnded(endedLessonKey?: string) {
    if (!active) {
      return;
    }
    const key = endedLessonKey ?? active.key;
    if (key !== active.key) {
      return;
    }
    if (endedLessonKeyRef.current === key) {
      return;
    }
    if (playbackStartedKeyRef.current !== key) {
      return;
    }
    if (pending && active.open && !activeCompleted) {
      return;
    }
    const shouldAdvance = shouldAutoAdvanceAfterListenEnded({
      autoAdvanceEnabled: autoAdvanceEnabledRef.current,
      fallback: false,
    });
    endedLessonKeyRef.current = key;
    if (active.open && !activeCompleted) {
      void completeLesson(key, { advance: shouldAdvance }).then((result) => {
        if (result.ok) {
          return;
        }
        endedLessonKeyRef.current = null;
        if (shouldAdvance) {
          autoAdvanceNextLesson(key);
        }
      });
      return;
    }
    if (shouldAdvance) {
      autoAdvanceNextLesson(key);
    }
  }

  useEffect(() => {
    if (!active || mediaElapsed < 1) {
      return;
    }
    if (
      !hasAcademyLessonPlaybackReachedEnd({
        currentTime: mediaElapsed,
        durationSec: activeClockDurationSec,
      })
    ) {
      return;
    }
    onMediaEnded(active.key);
  }, [active, activeClockDurationSec, mediaElapsed, pending]);

  function onPrevLesson() {
    if (!prevLesson?.open) {
      return;
    }
    selectLesson(prevLesson.key, { autoStart: false });
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
      selectLesson(nextLesson.key, { autoStart: false });
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
      data-academy-autoplay={autoAdvanceEnabled ? "on" : "off"}
    >
      <div className="academy-player-playlist-head shrink-0 flex items-center justify-between gap-2 px-1 pb-2">
        <p className="min-w-0 truncate text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
          {copy.playlistLabel}
        </p>
        <button
          type="button"
          role="switch"
          aria-checked={autoAdvanceEnabled}
          aria-label={copy.autoAdvance}
          data-academy-autoplay-toggle=""
          className="academy-player-autoplay"
          onClick={onToggleAutoAdvance}
        >
          <span className="academy-player-autoplay-label">{copy.autoAdvance}</span>
          <span
            className="academy-player-autoplay-track"
            data-on={autoAdvanceEnabled ? "true" : "false"}
            aria-hidden
          >
            <span className="academy-player-autoplay-thumb" />
          </span>
        </button>
      </div>
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
                  selectLesson(lesson.key, { autoStart: true });
                }}
                className={`academy-player-rail-item flex w-full items-center gap-2.5 rounded-[0.9rem] px-3.5 py-2.5 text-left text-[13px] leading-snug tracking-[-0.014em] ${
                  selected ? "academy-player-rail-item--active" : "text-[var(--muted)]"
                } disabled:cursor-not-allowed disabled:opacity-45`}
                data-academy-lesson-delivery={media.kind === "audio" ? "karaoke" : "article"}
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
                data-academy-lesson-delivery={karaoke ? "karaoke" : "article"}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  karaoke
                    ? "bg-[var(--safir-soft)] text-[var(--safir-deep)]"
                    : "border border-slate-200 bg-white text-slate-600"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${karaoke ? "bg-[var(--safir)]" : "bg-slate-400"}`} />
                {karaoke ? copy.modeKaraoke : copy.modeArticle}
              </span>
            </header>

            {karaoke ? (
              <section
                className="academy-player-karaoke academy-cinema-stage overflow-hidden rounded-2xl border border-slate-200 bg-slate-950"
                data-academy-karaoke="sealed"
                data-academy-media="sealed-wav"
                data-academy-canvas="full"
                data-academy-directing="punchcard"
                data-academy-player-stack="visual-karaoke-transport"
              >
                {eyeStage ? (
                  <LessonCinemaEyeLayer
                    stage={eyeStage}
                    currentTime={mediaElapsed}
                    playing={mediaPlaying}
                    captions={false}
                  />
                ) : null}
                <LessonKaraokeStrip
                  cues={karaoke.cues}
                  currentTime={mediaElapsed}
                  playing={mediaPlaying}
                />
                <LessonMediaPlayer
                  key={active.key}
                  courseSlug={courseSlug}
                  lessonKey={active.key}
                  lessonTitle={activeTitle}
                  autoStart={autoStartPlayback}
                  onSpokenElapsedChange={setMediaElapsed}
                  onPlayingChange={(playing) => {
                    setMediaPlaying(playing);
                    if (playing) {
                      playbackStartedKeyRef.current = active.key;
                      setAutoStartPlayback(false);
                    }
                  }}
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
