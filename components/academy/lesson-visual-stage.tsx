"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AcademyCinemaCueSlide } from "@/lib/academy/cinema-cue-catalog";
import { resolveAcademyCinemaSource } from "@/lib/academy/lesson-cinema";
import {
  academyActivePunchcard,
  academyPlaybackCueAtTime,
  loadAcademyLessonPlaybackCues,
} from "@/lib/academy/lesson-cues";
import {
  academyTeleprompterActiveLineIndex,
  academyTeleprompterLineState,
  ACADEMY_KARAOKE_CAPTIONS_DEFAULT,
  loadAcademyTeleprompterFlow,
  readAcademyKaraokeCaptionsFromStorage,
  writeAcademyKaraokeCaptionsToStorage,
  type AcademyTeleprompterLine,
} from "@/lib/academy/lesson-teleprompter-flow";
import { LessonKaraokeStrip } from "@/components/academy/lesson-karaoke-strip";
import { LessonExcelWorkspace } from "@/components/academy/lesson-excel-workspace";
import { LessonGmailWorkspace } from "@/components/academy/lesson-gmail-workspace";
import { LessonHowtoSteps } from "@/components/academy/lesson-howto-steps";
import { LessonOutlookWorkspace } from "@/components/academy/lesson-outlook-workspace";
import { LessonPptxWorkspace } from "@/components/academy/lesson-pptx-workspace";
import { LessonWordWorkspace } from "@/components/academy/lesson-word-workspace";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import {
  academyCompareDockPrompt,
  academyVisualCinematicFrameSrc,
  academyVisualCompareStage,
  academyVisualStageBackdropTheme,
  academyVisualWaiterSlide,
  academyVisualWaiterStageFromLayout,
  type AcademyVisualExcelPane,
} from "@/lib/academy/excel-workspace";
import { academyExcelFocusZoomActive } from "@/lib/academy/excel-focus-zoom";
import { ACADEMY_GOLDEN_WAITER_RATIO, academyHowtoActiveIndexAtTime, academyHowtoSteps } from "@/lib/academy/lesson-beat-visual";
import { academyLessonIntroIsActive, academyLessonOutroIsActive, ACADEMY_INTRO_GENERIC_TITLE, academyOutroSummaryLabels } from "@/lib/academy/lesson-intro";
import {
  academyAiDeskActiveTab,
  academyAiDeskCueStart,
  academyAiDeskGuideHint,
  academyAiDeskGuideTitle,
  academyAiDeskGuideVisible,
  academyAiDeskHostFromLayout,
  academyAiDeskPinnedForLesson,
} from "@/lib/academy/ai-desk";
import {
  ACADEMY_VEO_SCENE_DURATION_SEC,
  academyVisualStageActiveCard,
  academyVisualStageCinemaKind,
  academyVisualStageMotion,
  academyVisualStageNextCard,
  academyVisualVeoPunchHasEnded,
  type AcademyLessonVisualCard,
  type AcademyLessonVisualStage,
} from "@/lib/academy/lesson-visual-stage";

function LessonWaiterWorkspace({
  slide,
  pane,
  focusZoom,
  currentTime,
}: {
  slide: AcademyCinemaCueSlide;
  pane: AcademyVisualExcelPane;
  focusZoom?: boolean;
  currentTime?: number;
}) {
  if (slide.layout === "pptx") {
    return (
      <LessonPptxWorkspace slide={slide} pane={pane} focusZoom={focusZoom} currentTime={currentTime} />
    );
  }
  if (slide.layout === "outlook") {
    return (
      <LessonOutlookWorkspace slide={slide} pane={pane} focusZoom={focusZoom} currentTime={currentTime} />
    );
  }
  if (slide.layout === "gmail") {
    return (
      <LessonGmailWorkspace slide={slide} pane={pane} focusZoom={focusZoom} currentTime={currentTime} />
    );
  }
  if (slide.layout === "word") {
    return (
      <LessonWordWorkspace slide={slide} pane={pane} focusZoom={focusZoom} currentTime={currentTime} />
    );
  }
  return (
    <LessonExcelWorkspace slide={slide} pane={pane} focusZoom={focusZoom} currentTime={currentTime} />
  );
}

function LessonCinemaMediaCard({
  card,
  playing,
  motion,
  fallbackSrc,
}: {
  card: AcademyLessonVisualCard;
  playing: boolean;
  motion: ReturnType<typeof academyVisualStageMotion>;
  fallbackSrc: string;
}) {
  const cinema = card.kind === "veo" ? resolveAcademyCinemaSource(card.src) : null;
  const bakedFile = cinema?.kind === "html5" || cinema?.kind === "hls";
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [plateSrc, setPlateSrc] = useState(card.src);

  useEffect(() => {
    setPlateSrc(card.src);
  }, [card.cueId, card.src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    if (motion === "hold" || motion === "rest") {
      video.pause();
      const punch = Math.min(ACADEMY_VEO_SCENE_DURATION_SEC, Number.isFinite(video.duration) ? video.duration : ACADEMY_VEO_SCENE_DURATION_SEC);
      if (Number.isFinite(punch) && punch > 0) {
        video.currentTime = punch;
      }
      return;
    }
    if (video.currentTime > ACADEMY_VEO_SCENE_DURATION_SEC) {
      video.currentTime = 0;
    }
    if (playing) {
      void video.play().catch(() => undefined);
      return;
    }
    video.pause();
  }, [playing, motion, card.cueId, card.src]);

  return (
    <div
      className="academy-player-media-card"
      data-academy-media-card=""
      data-academy-media-kind={card.kind}
      data-academy-media-cue={card.cueId}
    >
      {bakedFile && cinema ? (
        <video
          ref={videoRef}
          className="academy-player-eye-plate"
          data-motion={motion}
          muted
          playsInline
          preload="metadata"
          poster={card.posterSrc}
          src={cinema.mp4}
        />
      ) : (
        <img
          className="academy-player-eye-plate"
          data-motion={motion}
          src={plateSrc}
          alt=""
          width={1280}
          height={720}
          decoding="async"
          fetchPriority="high"
          onError={() => {
            setPlateSrc(fallbackSrc);
          }}
        />
      )}
    </div>
  );
}

export function LessonCinemaEyeLayer({
  stage,
  currentTime,
  playing,
  activeCueId,
  captions = false,
  karaokeCues,
}: {
  stage: AcademyLessonVisualStage;
  currentTime: number;
  playing: boolean;
  activeCueId?: string;
  /** Vatandaş sahnesinde kapalı: paragraf teleprompter yok; kelime şeridi 16:9 sahnede overlay akar. */
  captions?: boolean;
  karaokeCues?: readonly AcademyTeleprompterLine[];
}) {
  const copy = ACADEMY_SEN.player;
  const [captionsVisible, setCaptionsVisible] = useState(ACADEMY_KARAOKE_CAPTIONS_DEFAULT);
  const lines = useMemo(
    () => (captions ? loadAcademyTeleprompterFlow(stage.lessonKey) : []),
    [captions, stage.lessonKey],
  );
  const punchcards = useMemo(
    () => loadAcademyLessonPlaybackCues(stage.lessonKey),
    [stage.lessonKey],
  );
  const card = academyVisualStageActiveCard(stage, currentTime);
  const nextCard = academyVisualStageNextCard(stage, currentTime);
  const motion = academyVisualStageMotion(stage, currentTime, playing);
  const kind = academyVisualStageCinemaKind(stage);
  const punchcard = academyActivePunchcard(punchcards, currentTime);
  const clockCue = academyPlaybackCueAtTime(punchcards, currentTime);
  const clockCueId = clockCue?.id ?? card?.cueId;
  const waiterSlide = clockCueId
    ? academyVisualWaiterSlide(stage.lessonKey, clockCueId, {
        includeVeoTable: card ? academyVisualVeoPunchHasEnded(card, currentTime) : true,
      })
    : null;
  const excelFocusZoom = academyExcelFocusZoomActive(stage.lessonKey, currentTime);
  const compare = clockCueId ? academyVisualCompareStage(stage.lessonKey, clockCueId) : null;
  const beat = compare?.beat ?? waiterSlide?.beat;
  const veoPunchLive = Boolean(card && academyVisualVeoPunchHasEnded(card, currentTime));
  const visualMode = compare ? "split" : waiterSlide ? "live" : card?.kind === "veo" ? "veo" : "cinema";
  const stageTheme = academyVisualStageBackdropTheme(stage.lessonKey);
  const sealedFrameSrc = academyVisualCinematicFrameSrc(stage.lessonKey);
  const cinematicFrameSrc = sealedFrameSrc ?? stage.posterSrc;
  const excelBackdrop = stageTheme === "excel" && Boolean(sealedFrameSrc);
  const activeIndex = academyTeleprompterActiveLineIndex(lines, currentTime);
  const activeRef = useRef<HTMLParagraphElement | null>(null);
  const mediaActive = card != null;
  const introActive = academyLessonIntroIsActive(stage.lessonKey, currentTime);
  const speechEndSec = punchcards.at(-1)?.end ?? 0;
  const outroActive = academyLessonOutroIsActive(stage.lessonKey, currentTime, speechEndSec);
  const howtoSteps = academyHowtoSteps(stage.lessonKey);
  const howtoActiveIndex = academyHowtoActiveIndexAtTime(stage.lessonKey, currentTime, punchcards);
  const dockPrompt = academyCompareDockPrompt(compare);
  const showHowto =
    howtoSteps != null &&
    howtoActiveIndex >= 0 &&
    !introActive &&
    !outroActive &&
    (waiterSlide != null || compare != null);
  const pasteHost = academyAiDeskHostFromLayout(waiterSlide?.layout);
  const showPasteGuide =
    Boolean(waiterSlide?.copilot) &&
    !introActive &&
    !outroActive &&
    compare == null &&
    academyAiDeskGuideVisible(pasteHost);
  const pasteTab = academyAiDeskActiveTab({
    currentTime,
    cueStart: waiterSlide ? academyAiDeskCueStart(stage.lessonKey, waiterSlide.cueIndex) : undefined,
    pinned: academyAiDeskPinnedForLesson(stage.lessonKey),
  });
  const pasteGuideTitle = academyAiDeskGuideTitle(pasteHost);
  const nextSrc = nextCard && nextCard.src !== card?.src ? nextCard.src : null;

  useEffect(() => {
    setCaptionsVisible(readAcademyKaraokeCaptionsFromStorage());
  }, [stage.lessonKey]);

  useEffect(() => {
    if (!captions) {
      return;
    }
    const node = activeRef.current;
    if (!node) {
      return;
    }
    const reduce =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.scrollIntoView({
      block: "center",
      inline: "nearest",
      behavior: reduce ? "auto" : "smooth",
    });
  }, [activeIndex, captions, mediaActive]);

  return (
    <div
      className="academy-player-eye-stack"
      data-academy-eye-layer=""
      data-academy-teleprompter-stage=""
      data-academy-eye-motion={motion}
      data-academy-eye-kind={kind === "html5" || kind === "hls" ? kind : "still"}
      data-academy-eye-cue={activeCueId ?? clockCueId ?? card?.cueId}
      data-academy-clock-cue={clockCueId}
      data-academy-howto-index={howtoActiveIndex >= 0 ? String(howtoActiveIndex) : undefined}
      data-academy-media-live={mediaActive ? "true" : "false"}
      data-academy-waiter={
        waiterSlide ? academyVisualWaiterStageFromLayout(waiterSlide.layout) : "cinema"
      }
      data-academy-stage-theme={stageTheme}
      data-academy-waiter-ratio={String(ACADEMY_GOLDEN_WAITER_RATIO)}
      data-academy-visual-mode={visualMode}
      data-academy-beat={beat}
      data-academy-canvas="full"
      data-academy-intro={introActive ? "generic" : undefined}
      data-academy-outro={outroActive ? "generic" : undefined}
      data-academy-veo={card?.kind === "veo" && !veoPunchLive ? "warmup" : undefined}
      data-academy-prompt-dock={dockPrompt ? "true" : undefined}
      data-academy-captions={karaokeCues ? (captionsVisible ? "on" : "off") : undefined}
      data-academy-clean-stage={karaokeCues && !captionsVisible ? "true" : undefined}
    >
      {nextSrc ? (
        <img
          src={nextSrc}
          alt=""
          aria-hidden
          width={1}
          height={1}
          decoding="async"
          fetchPriority="low"
          data-academy-cinema-preload=""
          className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
        />
      ) : null}
      <div className="academy-player-widescreen-frame">
        <div className="academy-player-stage-column">
        <div className="academy-player-widescreen academy-player-karaoke-stage aspect-video">
          <div className="academy-player-eye-canvas" data-academy-eye-canvas="" data-academy-stage-theme={stageTheme}>
      {excelBackdrop ? (
        <img
          className="academy-player-eye-backdrop"
          src={sealedFrameSrc ?? cinematicFrameSrc}
          alt=""
          width={1280}
          height={720}
          decoding="async"
          fetchPriority="high"
          data-academy-eye-backdrop=""
          data-academy-office-frame=""
        />
      ) : (
        <div
          className="academy-player-eye-backdrop academy-player-eye-backdrop--desk"
          data-academy-eye-backdrop=""
          data-academy-stage-theme={stageTheme}
          aria-hidden
        />
      )}
      {introActive ? (
        <div className="academy-player-intro" data-academy-intro-generic="">
          <img className="academy-player-intro-logo" src="/icon.svg" alt="" width={96} height={96} />
          <p className="academy-player-intro-kicker">yetkin.ai akademi</p>
          <h2 className="academy-player-intro-title">{ACADEMY_INTRO_GENERIC_TITLE}</h2>
        </div>
      ) : null}
      {outroActive ? (
        <div className="academy-player-intro academy-player-intro--outro" data-academy-outro-generic="">
          <img className="academy-player-intro-logo" src="/icon.svg" alt="" width={96} height={96} />
          <p className="academy-player-intro-kicker">yetkin.ai akademi</p>
          <h2 className="academy-player-intro-title">{ACADEMY_INTRO_GENERIC_TITLE}</h2>
          <ul className="academy-player-outro-summary">
            {academyOutroSummaryLabels(stage.lessonKey).map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {compare ? (
        <div
          className="academy-player-waiter academy-player-compare"
          data-academy-waiter-stage={academyVisualWaiterStageFromLayout(compare.after.layout)}
          data-academy-compare="split"
          data-academy-compare-prompt={dockPrompt ? "dock" : undefined}
          data-academy-clock-cue={clockCueId}
        >
          <div
            className="academy-player-compare-pane academy-player-compare-pane--before"
            data-academy-compare-pane="before"
          >
            <p className="academy-player-compare-label">{compare.beforeLabel}</p>
            <LessonWaiterWorkspace slide={compare.before} pane="before" />
          </div>
          <div
            className="academy-player-compare-pane academy-player-compare-pane--after"
            data-academy-compare-pane="after"
          >
            <p className="academy-player-compare-label">{compare.afterLabel}</p>
            <LessonWaiterWorkspace slide={compare.after} pane="after" currentTime={currentTime} />
          </div>
        </div>
      ) : waiterSlide ? (
        <div
          className="academy-player-waiter"
          data-academy-waiter-stage={academyVisualWaiterStageFromLayout(waiterSlide.layout)}
          data-academy-clock-cue={clockCueId}
        >
          <LessonWaiterWorkspace
            slide={waiterSlide}
            pane="live"
            focusZoom={excelFocusZoom}
            currentTime={currentTime}
          />
        </div>
      ) : card ? (
        <LessonCinemaMediaCard
          card={card}
          playing={playing}
          motion={motion}
          fallbackSrc={cinematicFrameSrc}
        />
      ) : null}
      {showPasteGuide ? (
        <div
          className="academy-paste-guide"
          data-academy-paste-guide=""
          data-academy-paste-tab={pasteTab}
          aria-label={pasteGuideTitle}
        >
          <strong>{pasteGuideTitle}</strong>
          <span>{academyAiDeskGuideHint(pasteTab, pasteHost)}</span>
          <i aria-hidden />
        </div>
      ) : null}
      {showHowto && howtoSteps ? (
        <LessonHowtoSteps steps={howtoSteps} activeIndex={howtoActiveIndex} />
      ) : null}
      {punchcard ? (
        <div className="academy-player-punchcard-dock" data-academy-punchcard-dock="">
          <p
            className="academy-player-punchcard"
            data-academy-punchcard=""
            data-academy-punchcard-cue={punchcard.cueId}
            lang="tr"
            aria-live="polite"
          >
            {punchcard.label}
          </p>
        </div>
      ) : null}
      {captions ? (
        <div
          className="academy-player-teleprompter"
          data-academy-cinema-overlay=""
          data-academy-cinema-caption=""
          data-academy-teleprompter-flow=""
          data-media={mediaActive ? "true" : "false"}
          role="region"
          aria-label="Eğitim metni"
        >
          <div className="academy-player-teleprompter-track">
            {lines.map((line, index) => {
              const state = academyTeleprompterLineState(line, currentTime, activeIndex, index);
              const active = state === "active";
              return (
                <p
                  key={line.id}
                  ref={active ? activeRef : undefined}
                  className="academy-player-teleprompter-line"
                  data-academy-teleprompter-line={line.id}
                  data-academy-cinema-cue-row={line.cueId}
                  data-academy-cinema-section={line.section}
                  data-state={state}
                  data-active={active ? "true" : undefined}
                >
                  {line.text}
                </p>
              );
            })}
          </div>
        </div>
      ) : null}
      {karaokeCues && captionsVisible ? (
        <div className="academy-player-karaoke-overlay" data-academy-karaoke-overlay="">
          <LessonKaraokeStrip
            cues={karaokeCues}
            currentTime={currentTime}
            playing={playing}
          />
        </div>
      ) : null}
      {karaokeCues ? (
        <button
          type="button"
          className="academy-player-captions-toggle"
          data-academy-captions-toggle=""
          data-on={captionsVisible ? "true" : "false"}
          aria-pressed={captionsVisible}
          aria-label={captionsVisible ? copy.cinemaCaptionsOn : copy.cinemaCaptionsOff}
          onClick={() => {
            const next = !captionsVisible;
            setCaptionsVisible(next);
            writeAcademyKaraokeCaptionsToStorage(next);
          }}
        >
          {copy.cinemaCaptions}
        </button>
      ) : null}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
