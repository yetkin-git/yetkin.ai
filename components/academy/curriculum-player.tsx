"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IconCheck } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/link-button";
import { LessonAssistantPanel } from "@/components/academy/lesson-assistant-panel";
import { LessonMediaPlayer } from "@/components/academy/lesson-media-player";
import { LessonPromptConsole } from "@/components/academy/lesson-prompt-console";
import { LessonStudyTabs } from "@/components/academy/lesson-study-tabs";
import { LessonCinemaEyeLayer } from "@/components/academy/lesson-visual-stage";
import { PrepStripPanel } from "@/components/academy/prep-strip-panel";
import { OFFICE_AI_EXIT_KIT_SLUG } from "@/lib/academy/exit-kit";
import {
  academyPrepStripAudioDurationSec,
  academyPrepStripForSlug,
  academyPrepStripPlayerLayer,
  isAcademyPrepStripAudioSealed,
  isAcademyPrepStripKaraokeLayer,
  readAcademyPrepStripDone,
  writeAcademyPrepStripDone,
} from "@/lib/academy/prep-strip";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { normalizeAcronyms } from "@/lib/academy/acronym-normalizer";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { academyExamStartGateHref } from "@/lib/academy/continue-board";
import { isAcademyPlayerPaywallLessonLocked } from "@/lib/academy/preview-lock";
import { academyCheckoutHref } from "@/lib/academy/storefront-cta";
import { academyCompareDockPrompt, academyVisualCompareStage } from "@/lib/academy/excel-workspace";
import { ACADEMY_EXAM_PASS_SCORE } from "@/lib/academy/exam";
import { academyBedSpeechClockSec } from "@/lib/academy/lesson-bed-duck";
import {
  academyLessonBedIsHardMixed,
  academyLessonBedPlaybackSrc,
  isAcademyLessonBedSealed,
} from "@/lib/academy/lesson-audio";
import { isAcademyTtsCassetteRevoked } from "@/lib/academy/pilot-sku";
import {
  academyPlaybackCueAtTime,
  loadAcademyLessonPlaybackCues,
} from "@/lib/academy/lesson-cues";
import {
  ACADEMY_LESSON_AUTO_ADVANCE_DEFAULT,
  canAdvanceAcademyPlayerLesson,
  isAcademyPlayerExamReady,
  academyPlayerAutoAdvanceTargetKey,
  mergeAcademyPlayerLessonGates,
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
import {
  academyLessonJsonGeneration,
  primeAcademyLessonMedia,
  type AcademyLessonMediaPrime,
} from "@/lib/academy/lesson-json-store";

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
  media,
  curriculumComplete,
  workTasksComplete,
  paywallLocked = false,
  paywallPriceLabel = null,
  freePreviewAudio = null,
  checkoutHref: checkoutHrefProp = null,
}: {
  courseId: string;
  courseSlug: string;
  lessons: CurriculumPlayerLesson[];
  /** Bu kursun cue ve timings verisi. Diğer SKU JSON'u istemci paketine girmez. */
  media?: AcademyLessonMediaPrime | null;
  curriculumComplete: boolean;
  workTasksComplete?: boolean;
  /** Satın alma yok — ders 1 ve hazırlık şeridi açık, ders 2+ ödeme duvarında. */
  paywallLocked?: boolean;
  /** Duvar düğmesindeki tutar. Yoksa fiyatsız başlık basılır. */
  paywallPriceLabel?: string | null;
  /** Sayfanın gömdüğü imzalı ses. Vitrinde ilk ders. Tam oynatıcıda açık dersler. Doluysa grant kapısı çağrılmaz. */
  freePreviewAudio?: Readonly<Record<string, { src: string; bedSrc?: string | null }>> | null;
  /** Satın Al. Oturum varsa kasa çapası, yoksa giriş. Boşsa `#satin-al`. */
  checkoutHref?: string | null;
}) {
  primeAcademyLessonMedia(media);
  const lessonMediaGeneration = academyLessonJsonGeneration();
  const router = useRouter();
  const idempotency = useIdempotencyKey();
  const copy = ACADEMY_SEN.player;
  const outline = ACADEMY_SEN.outline;
  const prepStrip = useMemo(() => academyPrepStripForSlug(courseSlug), [courseSlug]);
  const [lessonRows, setLessonRows] = useState(lessons);
  const firstOpen = lessonRows.find((lesson) => lesson.open && !lesson.completed) ?? lessonRows[0];
  const [activeKey, setActiveKey] = useState(() => {
    if (paywallLocked) {
      const preview = lessons.find((lesson) => lesson.open);
      if (preview) {
        return preview.key;
      }
    }
    const opening = lessons.find((lesson) => lesson.open && !lesson.completed) ?? lessons[0];
    return opening?.key ?? lessons[0]?.key ?? "";
  });
  const [funnelOpen, setFunnelOpen] = useState(false);
  const [prepDone, setPrepDone] = useState(false);
  const didInitPrepRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [mediaElapsed, setMediaElapsed] = useState(0);
  const [mediaPlaying, setMediaPlaying] = useState(false);
  const [completedKeys, setCompletedKeys] = useState(
    () => new Set(lessons.filter((lesson) => lesson.completed).map((lesson) => lesson.key)),
  );
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(ACADEMY_LESSON_AUTO_ADVANCE_DEFAULT);
  const [autoStartPlayback, setAutoStartPlayback] = useState(true);
  const autoAdvanceEnabledRef = useRef(autoAdvanceEnabled);
  const endedLessonKeyRef = useRef<string | null>(null);
  const pendingEndRef = useRef<string | null>(null);
  const onMediaEndedRef = useRef<(endedLessonKey?: string) => void>(() => undefined);
  const playbackStartedKeyRef = useRef<string | null>(null);
  const lessonsRef = useRef(lessonRows);

  useEffect(() => {
    setAutoAdvanceEnabled(readAcademyLessonAutoAdvanceFromStorage());
  }, []);

  autoAdvanceEnabledRef.current = autoAdvanceEnabled;
  lessonsRef.current = lessonRows;

  useEffect(() => {
    setLessonRows(lessons);
    setCompletedKeys(new Set(lessons.filter((lesson) => lesson.completed).map((lesson) => lesson.key)));
  }, [lessons]);

  useEffect(() => {
    if (pending) {
      return;
    }
    const queued = pendingEndRef.current;
    if (!queued) {
      return;
    }
    pendingEndRef.current = null;
    onMediaEndedRef.current(queued);
  }, [pending]);

  useEffect(() => {
    if (!prepStrip || didInitPrepRef.current) {
      return;
    }
    didInitPrepRef.current = true;
    const done = readAcademyPrepStripDone(courseSlug);
    setPrepDone(done);
    if (paywallLocked) {
      return;
    }
    if (!done && !lessons.some((row) => row.completed) && !curriculumComplete) {
      setActiveKey(prepStrip.key);
    }
  }, [courseSlug, prepStrip, lessons, curriculumComplete, paywallLocked]);

  const prepActive = Boolean(prepStrip && activeKey === prepStrip.key);
  const active = prepActive
    ? null
    : (lessonRows.find((lesson) => lesson.key === activeKey) ?? firstOpen ?? null);
  const examOpen = isAcademyPlayerExamReady({
    curriculumComplete,
    workTasksComplete,
    lessons: lessonRows,
    completedKeys,
  });
  const nextLesson = active ? nextAcademyPlayerLesson(lessonRows, active.key) : null;
  const prevLesson = active ? prevAcademyPlayerLesson(lessonRows, active.key) : null;
  const activeCompleted = active ? completedKeys.has(active.key) || active.completed : false;
  const activeForAdvance = active ? { ...active, completed: activeCompleted } : null;
  const canAdvance = canAdvanceAcademyPlayerLesson(activeForAdvance, nextLesson);
  const canGoNext = Boolean(nextLesson && (nextLesson.open || canAdvance));
  const activeTitle =
    prepActive && prepStrip
      ? prepStrip.title
      : active
        ? normalizeAcronyms(active.title)
        : "";
  const lessonPaywalled = Boolean(
    active && isAcademyPlayerPaywallLessonLocked(courseSlug, active.key, paywallLocked),
  );
  const checkoutHref = checkoutHrefProp?.trim() || academyCheckoutHref(courseSlug);
  const previewUpsell = Boolean(
    paywallLocked &&
      !lessonPaywalled &&
      nextLesson &&
      isAcademyPlayerPaywallLessonLocked(courseSlug, nextLesson.key, true),
  );
  const lessonMediaBlocked = Boolean(active && (lessonPaywalled || !active.open));
  const playerLayer = useMemo(
    () =>
      active && !lessonMediaBlocked
        ? academyCitizenPlayerLayer(courseSlug, active.key)
        : { kind: "article" as const },
    [active, courseSlug, lessonMediaBlocked, lessonMediaGeneration],
  );
  const karaoke = playerLayer.kind === "article+karaoke" ? playerLayer : null;
  const prepKaraoke = useMemo(() => {
    if (!prepActive) {
      return null;
    }
    const layer = academyPrepStripPlayerLayer(courseSlug);
    return isAcademyPrepStripKaraokeLayer(layer) ? layer : null;
  }, [prepActive, courseSlug]);
  const eyeStage = karaoke ? loadAcademyLessonVisualStage(karaoke.lessonKey) : null;
  const speechElapsed = academyBedSpeechClockSec(active?.key ?? "", mediaElapsed);
  const dockPrompt = useMemo(() => {
    if (!karaoke) {
      return null;
    }
    const clockCue = academyPlaybackCueAtTime(
      loadAcademyLessonPlaybackCues(karaoke.lessonKey),
      academyBedSpeechClockSec(karaoke.lessonKey, mediaElapsed),
    );
    if (!clockCue) {
      return null;
    }
    return academyCompareDockPrompt(academyVisualCompareStage(karaoke.lessonKey, clockCue.id));
  }, [karaoke, mediaElapsed]);

  useEffect(() => {
    endedLessonKeyRef.current = null;
    playbackStartedKeyRef.current = null;
    setMediaElapsed(0);
    setMediaPlaying(false);
  }, [activeKey]);

  function lessonPlaybackBlocked(lessonKey: string): boolean {
    const lesson = lessonsRef.current.find((row) => row.key === lessonKey);
    if (!lesson || !lesson.open) {
      return true;
    }
    return isAcademyPlayerPaywallLessonLocked(courseSlug, lessonKey, paywallLocked);
  }

  function selectLesson(lessonKey: string, options?: { autoStart?: boolean }) {
    if (!lessonKey || lessonKey === activeKey) {
      return;
    }
    const blocked = lessonPlaybackBlocked(lessonKey);
    if (!blocked) {
      setFunnelOpen(false);
    }
    setError(null);
    setMediaElapsed(0);
    setMediaPlaying(false);
    setAutoStartPlayback(Boolean(options?.autoStart) && !blocked);
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
    if (!sequential || lessonPlaybackBlocked(sequential)) {
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

  function completePrep() {
    if (!prepStrip) {
      return;
    }
    writeAcademyPrepStripDone(courseSlug, true);
    setPrepDone(true);
    const first = lessonRows[0];
    if (!first) {
      return;
    }
    selectLesson(first.key, {
      autoStart: first.open && !isAcademyPlayerPaywallLessonLocked(courseSlug, first.key, paywallLocked),
    });
  }

  function selectPrep() {
    if (!prepStrip || prepActive) {
      return;
    }
    setError(null);
    setMediaElapsed(0);
    setMediaPlaying(false);
    setAutoStartPlayback(false);
    setActiveKey(prepStrip.key);
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
        player?: {
          curriculumComplete?: boolean;
          nextLessonKey?: string | null;
          lessons?: { key: string; open?: boolean; completed?: boolean }[];
        };
      }>(await response.json());
      if (!parsed.ok) {
        setError(parsed.error || copy.completeFail);
        return { ok: false, nextLessonKey: null };
      }
      const serverLessons = parsed.data.player?.lessons ?? [];
      const merged = mergeAcademyPlayerLessonGates(lessonsRef.current, serverLessons);
      lessonsRef.current = merged;
      setLessonRows(merged);
      setCompletedKeys((current) => {
        const next = new Set(current);
        next.add(lessonKey);
        for (const row of serverLessons) {
          if (row.completed) {
            next.add(row.key);
          }
        }
        return next;
      });
      // API `player.nextLessonKey` ilk tamamlanmamış derstir (devam paneli).
      // Oynatıcı geçişi müfredat sırasındaki +1 adımdır; tamamlanmış ders atlanmaz.
      // Cevaptaki open listesi, sayfadaki eski bayrağın önüne geçer.
      const sequential = nextAcademyPlayerLesson(lessonsRef.current, lessonKey);
      const sequentialKey = sequential?.open ? sequential.key : null;
      if ((options?.advance ?? true) && sequentialKey && !lessonPlaybackBlocked(sequentialKey)) {
        if (autoAdvanceEnabledRef.current) {
          autoAdvanceNextLesson(lessonKey);
        } else {
          selectLesson(sequentialKey, { autoStart: true });
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
    if (lessonPaywalled || !active.open) {
      return;
    }
    if (
      paywallLocked &&
      nextLesson &&
      isAcademyPlayerPaywallLessonLocked(courseSlug, nextLesson.key, true)
    ) {
      endedLessonKeyRef.current = key;
      setFunnelOpen(true);
      return;
    }
    if (pending && active.open && !activeCompleted) {
      pendingEndRef.current = key;
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
      });
      return;
    }
    if (shouldAdvance) {
      autoAdvanceNextLesson(key);
    }
  }

  onMediaEndedRef.current = onMediaEnded;

  function onPrevLesson() {
    if (prepActive) {
      return;
    }
    if (prepStrip && active?.key === lessonRows[0]?.key) {
      selectPrep();
      return;
    }
    if (!prevLesson?.open) {
      return;
    }
    selectLesson(prevLesson.key, { autoStart: true });
  }

  function onNextOrComplete() {
    if (prepActive) {
      completePrep();
      return;
    }
    if (!active) {
      return;
    }
    if (isAcademyPlayerPaywallLessonLocked(courseSlug, active.key, paywallLocked)) {
      setFunnelOpen(true);
      return;
    }
    if (
      paywallLocked &&
      nextLesson &&
      isAcademyPlayerPaywallLessonLocked(courseSlug, nextLesson.key, true)
    ) {
      setFunnelOpen(true);
      return;
    }
    if (active.open && !activeCompleted) {
      void completeLesson(active.key);
      return;
    }
    if (nextLesson && canGoNext) {
      selectLesson(nextLesson.key, { autoStart: true });
    }
  }

  const examLaunchLabel = copy.examLaunchCta(
    lessonRows.filter((lesson) => completedKeys.has(lesson.key) || lesson.completed).length,
    lessonRows.length,
    ACADEMY_EXAM_PASS_SCORE,
  );
  const primaryLabel = pending
    ? copy.completing
    : prepActive
      ? copy.prepCompleteCta
      : examOpen
        ? examLaunchLabel
        : active && active.open && !activeCompleted
          ? copy.completeCta
          : copy.nextLessonCta;
  const primaryDisabled =
    pending ||
    (!prepActive && !examOpen && !(active?.open && !activeCompleted) && !canGoNext);
  const canGoPrev =
    !prepActive &&
    (Boolean(prevLesson?.open) || Boolean(prepStrip && active?.key === lessonRows[0]?.key));
  const exitKitHref =
    !paywallLocked && courseSlug === OFFICE_AI_EXIT_KIT_SLUG
      ? (`/academy/${courseSlug}/cikis-paketi` as Route)
      : null;
  const prepAudioSealed = isAcademyPrepStripAudioSealed(courseSlug);
  const prepDurationMin = prepAudioSealed
    ? Math.max(1, Math.round(academyPrepStripAudioDurationSec(courseSlug) / 60))
    : (prepStrip?.estimatedMinutes ?? 0);

  const playlist = (
    <aside
      className="academy-player-rail academy-playlist flex min-h-0 w-full flex-col overflow-hidden max-lg:max-h-28 lg:sticky lg:top-0 lg:w-[360px] lg:min-h-[var(--academy-stage-max-h)] lg:max-h-[var(--academy-playlist-max-h)] lg:self-start"
      data-academy-player-playlist=""
      data-academy-autoplay={autoAdvanceEnabled ? "on" : "off"}
    >
      <div className="academy-player-playlist-head mt-0 shrink-0 flex items-center justify-between gap-2 px-1 pb-2 pt-0">
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
        className="academy-player-playlist-list flex min-h-0 gap-2 overflow-x-auto overscroll-contain pr-1 lg:flex-1 lg:flex-col lg:gap-[var(--academy-playlist-item-gap)] lg:overflow-y-auto"
        aria-label={copy.playlistLabel}
      >
        {prepStrip ? (
          <li className="max-lg:min-w-[16rem] max-lg:shrink-0">
            <button
              type="button"
              aria-current={prepActive ? "true" : undefined}
              data-academy-prep-strip=""
              onClick={() => {
                if (!prepActive) {
                  selectPrep();
                }
              }}
              className={`academy-player-rail-item flex w-full items-center gap-2.5 rounded-[0.9rem] text-left text-[13px] leading-snug tracking-[-0.014em] ${
                prepActive ? "academy-player-rail-item--active" : "text-[var(--muted)]"
              }`}
              data-academy-lesson-delivery={prepAudioSealed ? "karaoke" : "article"}
              data-academy-free-preview=""
            >
              {prepDone ? (
                <span className="academy-player-rail-check" data-academy-lesson-mark="done" aria-hidden>
                  <IconCheck className="h-3 w-3" />
                </span>
              ) : (
                <span
                  aria-hidden
                  data-academy-lesson-mark={prepActive ? "current" : "open"}
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    prepActive ? "bg-[var(--safir)] shadow-[0_0_10px_var(--safir)]" : "bg-transparent"
                  }`}
                />
              )}
              <span className="min-w-0 flex-1">
                <span className={`block line-clamp-2 font-medium ${prepActive ? "text-white" : "text-[var(--foreground)]"}`}>
                  {prepStrip.badge} · {prepStrip.title}
                </span>
                <span className={`block text-[11px] ${prepActive ? "text-white/70" : "text-[var(--muted)]"}`}>
                  {outline.prepKind} · {outline.durationMin(prepDurationMin)}
                </span>
                {prepDone ? (
                  <span className="academy-player-rail-done" data-academy-lesson-done="">
                    {ACADEMY_SEN.catalog.statusCompleted}
                  </span>
                ) : null}
              </span>
            </button>
          </li>
        ) : null}
        {lessonRows.map((lesson) => {
          const selected = lesson.key === active?.key;
          const completed = completedKeys.has(lesson.key) || lesson.completed;
          const rowLocked = isAcademyPlayerPaywallLessonLocked(
            courseSlug,
            lesson.key,
            paywallLocked,
          );
          const media = academyLessonMediaMeta({ ...lesson, courseSlug });
          const kindLabel = academyLessonKindLabel(media.kind, outline);
          const audioPending = isAcademyTtsCassetteRevoked(lesson.key);
          const deliveryLabel = audioPending
            ? ACADEMY_SEN.listen.audioRecordingPreparing
            : media.kind === "audio"
              ? ACADEMY_SEN.catalog.cardMetaAudio(media.durationMin)
              : `${kindLabel} · ${outline.durationMin(media.durationMin)}`;
          return (
            <li key={lesson.key} className="max-lg:min-w-[16rem] max-lg:shrink-0">
              <button
                type="button"
                disabled={rowLocked ? false : !lesson.open}
                aria-current={selected ? "true" : undefined}
                data-academy-paywall={rowLocked ? "locked" : undefined}
                onClick={() => {
                  if (lesson.key === active?.key) {
                    return;
                  }
                  if (rowLocked) {
                    setFunnelOpen(true);
                    return;
                  }
                  selectLesson(lesson.key, { autoStart: true });
                }}
                className={`academy-player-rail-item flex w-full items-center gap-2.5 rounded-[0.9rem] text-left text-[13px] leading-snug tracking-[-0.014em] ${
                  selected ? "academy-player-rail-item--active" : "text-[var(--muted)]"
                } ${completed ? "academy-player-rail-item--done" : ""} disabled:cursor-not-allowed disabled:opacity-45`}
                data-academy-lesson-delivery={media.kind === "audio" ? "karaoke" : "article"}
                data-academy-lesson-done={completed ? "true" : "false"}
              >
                {completed ? (
                  <span className="academy-player-rail-check" data-academy-lesson-mark="done" aria-hidden>
                    <IconCheck className="h-3 w-3" />
                  </span>
                ) : (
                  <span
                    aria-hidden
                    data-academy-lesson-mark={selected ? "current" : "open"}
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      selected ? "bg-[var(--safir)] shadow-[0_0_10px_var(--safir)]" : "bg-transparent"
                    }`}
                  />
                )}
                <span className="min-w-0 flex-1">
                  <span className={`block line-clamp-2 font-medium ${selected ? "text-white" : "text-[var(--foreground)]"}`}>
                    {lesson.order}. {normalizeAcronyms(lesson.title)}
                  </span>
                  <span className={`block text-[11px] ${selected ? "text-white/70" : "text-[var(--muted)]"}`}>
                    {deliveryLabel}
                    {rowLocked ? ` · ${outline.locked}` : ""}
                  </span>
                  {completed ? (
                    <>
                      <span className="academy-player-rail-done" data-academy-lesson-done="">
                        {ACADEMY_SEN.catalog.statusCompleted}
                      </span>
                      <span className="academy-player-rail-meter" aria-hidden>
                        <span />
                      </span>
                    </>
                  ) : null}
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
      className="academy-player-shell mx-auto grid min-h-0 w-full max-w-[1580px] flex-1 grid-cols-1 grid-rows-[auto_auto] gap-3 overflow-visible lg:grid-cols-[minmax(0,1fr)_360px] lg:grid-rows-[auto] lg:items-start lg:gap-4"
      data-academy-player={karaoke || prepKaraoke ? "karaoke" : "article"}
      data-academy-player-layout="document"
    >
      {active || prepActive ? (
        <>
          <div
            className="academy-player-main relative mt-0 flex min-h-0 min-w-0 flex-col gap-[var(--academy-player-study-gap,0.5rem)] pt-0 lg:col-start-1"
            data-academy-hybrid="media-then-study"
          >
            <h2 className="sr-only">{activeTitle}</h2>
            <span
              data-academy-mode-badge=""
              data-academy-mode={karaoke || prepKaraoke ? "karaoke" : "article"}
              data-academy-lesson-delivery={karaoke || prepKaraoke ? "karaoke" : "article"}
              className="sr-only"
            >
              {karaoke || prepKaraoke ? copy.modeKaraoke : copy.modeArticle}
            </span>

            {prepActive && prepStrip ? (
              <PrepStripPanel
                strip={prepStrip}
                done={prepDone}
                courseSlug={courseSlug}
                grantedSrc={freePreviewAudio?.[prepStrip.key]?.src}
                grantedBedSrc={freePreviewAudio?.[prepStrip.key]?.bedSrc}
              />
            ) : null}

            {lessonPaywalled || funnelOpen ? (
              <SalesFunnelModal
                checkoutHref={checkoutHref}
                lessonKey={lessonPaywalled ? active?.key : undefined}
                priceLabel={paywallPriceLabel}
                onClose={() => {
                  setFunnelOpen(false);
                  if (
                    active &&
                    isAcademyPlayerPaywallLessonLocked(courseSlug, active.key, paywallLocked)
                  ) {
                    const free = lessonRows.find(
                      (lesson) =>
                        lesson.open &&
                        !isAcademyPlayerPaywallLessonLocked(courseSlug, lesson.key, paywallLocked),
                    );
                    if (free) {
                      selectLesson(free.key, { autoStart: false });
                    }
                  }
                }}
              />
            ) : null}

            {karaoke && active && !lessonMediaBlocked ? (
              <section
                className="academy-player-karaoke academy-cinema-stage mt-0 overflow-visible bg-transparent pt-0"
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
                    karaokeCues={karaoke.cues}
                  />
                ) : null}
                <LessonMediaPlayer
                  key={active.key}
                  courseSlug={courseSlug}
                  lessonKey={active.key}
                  lessonTitle={activeTitle}
                  autoStart={autoStartPlayback}
                  audioSrcOverride={karaoke.audioSrc}
                  grantedSrc={freePreviewAudio?.[active.key]?.src}
                  grantedBedSrc={freePreviewAudio?.[active.key]?.bedSrc}
                  bedSrcOverride={
                    isAcademyLessonBedSealed(courseSlug, active.key) &&
                    !academyLessonBedIsHardMixed(active.key)
                      ? academyLessonBedPlaybackSrc(courseSlug, active.key)
                      : undefined
                  }
                  sealedDurationSecOverride={karaoke.durationSec}
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
                {karaoke && dockPrompt ? (
                  <div
                    className="academy-player-compare-prompt"
                    data-academy-compare-prompt-dock=""
                    data-academy-prompt-host="below-transport"
                  >
                    <LessonPromptConsole
                      prompt={dockPrompt.prompt}
                      currentTime={speechElapsed}
                      lessonKey={karaoke.lessonKey}
                      cueIndex={dockPrompt.cueIndex}
                    />
                  </div>
                ) : null}
              </section>
            ) : null}

            {previewUpsell ? (
              <div
                className="mx-1 flex flex-col gap-2 rounded-2xl border border-[color-mix(in_srgb,var(--safir)_35%,transparent)] bg-[var(--safir-soft)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                data-academy-preview-upsell=""
              >
                <p className="text-sm leading-6 text-[var(--foreground)]">{copy.funnelLead}</p>
                <LinkButton
                  href={checkoutHref as Route}
                  size="sm"
                  className="shrink-0"
                  data-academy-paywall-cta=""
                  data-academy-sales-funnel-cta=""
                >
                  {paywallPriceLabel ? copy.funnelCta(paywallPriceLabel) : copy.funnelTitle}
                </LinkButton>
              </div>
            ) : null}

            {active && !lessonMediaBlocked && !karaoke && isAcademyTtsCassetteRevoked(active.key) ? (
              <p
                className="academy-player-audio-pending mx-1 mt-3 text-sm leading-6 text-[var(--foreground)]"
                role="status"
                data-academy-audio-pending-notice=""
              >
                {ACADEMY_SEN.listen.audioRecordingPreparing}
              </p>
            ) : null}

            {active && !lessonMediaBlocked ? (
              <LessonAssistantPanel
                courseSlug={courseSlug}
                lessonKey={active.key}
                currentTimeSec={speechElapsed}
              />
            ) : null}

            {active && !lessonMediaBlocked ? (
              <LessonStudyTabs
                lessonKey={active.key}
                articleBody={active.body}
                courseSlug={courseSlug}
                examOpen={examOpen}
                lessonOrder={active.order}
                lessonTotal={lessonRows.length}
                nextLessonTitle={nextLesson ? normalizeAcronyms(nextLesson.title) : undefined}
              />
            ) : null}

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
                <div className="flex flex-wrap items-center gap-2">
                  {exitKitHref ? (
                    <LinkButton
                      href={exitKitHref}
                      size="sm"
                      variant="ghost"
                      className="min-h-10 rounded-full px-4 text-[13px] font-medium"
                      data-academy-exit-kit-cta=""
                    >
                      {copy.exitKitCta}
                    </LinkButton>
                  ) : null}
                  {lessonPaywalled || funnelOpen || previewUpsell ? (
                    <LinkButton
                      href={checkoutHref as Route}
                      size="sm"
                      className="min-h-10 rounded-full px-5 text-[13px]"
                      data-academy-paywall-cta=""
                      data-academy-sales-funnel-cta=""
                    >
                      {paywallPriceLabel ? copy.funnelCta(paywallPriceLabel) : copy.funnelTitle}
                    </LinkButton>
                  ) : examOpen && !prepActive ? (
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

function SalesFunnelModal({
  checkoutHref,
  lessonKey,
  priceLabel,
  onClose,
}: {
  checkoutHref: string;
  lessonKey?: string;
  priceLabel?: string | null;
  onClose: () => void;
}) {
  const copy = ACADEMY_SEN.player;
  const titleId = useId();
  const actionLabel = priceLabel ? copy.funnelCta(priceLabel) : copy.funnelTitle;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-[color-mix(in_srgb,var(--surface-ink)_45%,transparent)] p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-lg rounded-2xl border border-[var(--safir)]/35 bg-white px-5 py-8 shadow-[var(--shadow-card)] sm:px-8"
        data-academy-sales-funnel=""
        data-academy-paywall={lessonKey ? "locked" : undefined}
        data-academy-paywall-lesson={lessonKey}
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--safir-deep)]">
          {copy.locked}
        </p>
        <h3 id={titleId} className="mt-2 max-w-xl text-xl font-semibold tracking-tight text-slate-900">
          {copy.funnelTitle}
        </h3>
        <p className="mt-3 max-w-xl text-[15px] leading-7 text-slate-700">{copy.funnelLead}</p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <LinkButton
            href={checkoutHref as Route}
            size="sm"
            data-academy-paywall-cta=""
            data-academy-sales-funnel-cta=""
          >
            {actionLabel}
          </LinkButton>
          <button
            type="button"
            className="min-h-10 rounded-full px-4 text-[13px] font-medium text-slate-600"
            onClick={onClose}
          >
            {copy.funnelDismiss}
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}
