"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { resolveAcademyCinemaSource } from "@/lib/academy/lesson-cinema";
import {
  academyActivePunchcard,
  loadAcademyLessonPlaybackCues,
} from "@/lib/academy/lesson-cues";
import {
  academyTeleprompterActiveLineIndex,
  academyTeleprompterLineState,
  loadAcademyTeleprompterFlow,
} from "@/lib/academy/lesson-teleprompter-flow";
import { LessonExcelWorkspace } from "@/components/academy/lesson-excel-workspace";
import {
  academyVisualCinematicFrameSrc,
  academyVisualCompareStage,
  academyVisualWaiterSlide,
} from "@/lib/academy/excel-workspace";
import { academyExcelFocusZoomActive } from "@/lib/academy/excel-focus-zoom";
import { ACADEMY_GOLDEN_WAITER_RATIO } from "@/lib/academy/lesson-beat-visual";
import { academyLessonIntroIsActive, academyLessonOutroIsActive, ACADEMY_INTRO_GENERIC_TITLE, academyOutroSummaryLabels } from "@/lib/academy/lesson-intro";
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
}: {
  stage: AcademyLessonVisualStage;
  currentTime: number;
  playing: boolean;
  activeCueId?: string;
  /** Vatandaş sahnesinde kapalı: paragraf altyazı yok, yalnız tam-boy plaka + punchcard. */
  captions?: boolean;
}) {
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
  const waiterSlide = card
    ? academyVisualWaiterSlide(stage.lessonKey, card.cueId, {
        includeVeoTable: academyVisualVeoPunchHasEnded(card, currentTime),
      })
    : null;
  const excelFocusZoom = academyExcelFocusZoomActive(stage.lessonKey, currentTime);
  const compare = card ? academyVisualCompareStage(stage.lessonKey, card.cueId) : null;
  const beat = compare?.beat ?? waiterSlide?.beat;
  const veoPunchLive = Boolean(card && academyVisualVeoPunchHasEnded(card, currentTime));
  const visualMode = compare ? "split" : waiterSlide ? "live" : card?.kind === "veo" ? "veo" : "cinema";
  const sealedFrameSrc = academyVisualCinematicFrameSrc(stage.lessonKey);
  const cinematicFrameSrc = sealedFrameSrc ?? stage.posterSrc;
  const activeIndex = academyTeleprompterActiveLineIndex(lines, currentTime);
  const activeRef = useRef<HTMLParagraphElement | null>(null);
  const mediaActive = card != null;
  const introActive = academyLessonIntroIsActive(stage.lessonKey, currentTime);
  const speechEndSec = punchcards.at(-1)?.end ?? 0;
  const outroActive = academyLessonOutroIsActive(stage.lessonKey, currentTime, speechEndSec);
  const nextSrc = nextCard && nextCard.src !== card?.src ? nextCard.src : null;

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
      className="academy-player-eye-layer"
      data-academy-eye-layer=""
      data-academy-teleprompter-stage=""
      data-academy-eye-motion={motion}
      data-academy-eye-kind={kind === "html5" || kind === "hls" ? kind : "still"}
      data-academy-eye-cue={activeCueId ?? card?.cueId}
      data-academy-media-live={mediaActive ? "true" : "false"}
      data-academy-waiter={waiterSlide ? "excel" : "cinema"}
      data-academy-waiter-ratio={String(ACADEMY_GOLDEN_WAITER_RATIO)}
      data-academy-visual-mode={visualMode}
      data-academy-beat={beat}
      data-academy-canvas="full"
      data-academy-intro={introActive ? "generic" : undefined}
      data-academy-outro={outroActive ? "generic" : undefined}
      data-academy-veo={card?.kind === "veo" && !veoPunchLive ? "warmup" : undefined}
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
      <img
        className="academy-player-eye-backdrop"
        src={cinematicFrameSrc}
        alt=""
        width={1280}
        height={720}
        decoding="async"
        fetchPriority="high"
        data-academy-eye-backdrop=""
        data-academy-office-frame={sealedFrameSrc ? "" : undefined}
      />
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
          data-academy-waiter-stage="excel"
          data-academy-compare="split"
        >
          <div
            className="academy-player-compare-pane academy-player-compare-pane--before"
            data-academy-compare-pane="before"
          >
            <p className="academy-player-compare-label">{compare.beforeLabel}</p>
            <LessonExcelWorkspace slide={compare.before} pane="before" />
          </div>
          <div
            className="academy-player-compare-pane academy-player-compare-pane--after"
            data-academy-compare-pane="after"
          >
            <p className="academy-player-compare-label">{compare.afterLabel}</p>
            <LessonExcelWorkspace slide={compare.after} pane="after" />
          </div>
        </div>
      ) : waiterSlide ? (
        <div className="academy-player-waiter" data-academy-waiter-stage="excel">
          <LessonExcelWorkspace
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
    </div>
  );
}
