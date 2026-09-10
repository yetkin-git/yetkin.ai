"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { resolveAcademyCinemaSource } from "@/lib/academy/lesson-cinema";
import {
  academyTeleprompterActiveLineIndex,
  academyTeleprompterLineState,
  loadAcademyTeleprompterFlow,
} from "@/lib/academy/lesson-teleprompter-flow";
import {
  academyVisualStageActiveCard,
  academyVisualStageCinemaKind,
  academyVisualStageMotion,
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
  const [plateSrc, setPlateSrc] = useState(fallbackSrc);

  useEffect(() => {
    setPlateSrc(fallbackSrc);
    const probe = new Image();
    probe.onload = () => {
      setPlateSrc(card.src);
    };
    probe.onerror = () => {
      setPlateSrc(fallbackSrc);
    };
    probe.src = card.src;
    return () => {
      probe.onload = null;
      probe.onerror = null;
    };
  }, [card.cueId, card.src, fallbackSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    video.currentTime = 0;
    if (playing) {
      void video.play().catch(() => undefined);
      return;
    }
    video.pause();
  }, [playing, card.cueId, card.src]);

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
  captions = true,
}: {
  stage: AcademyLessonVisualStage;
  currentTime: number;
  playing: boolean;
  activeCueId?: string;
  /** false: yalnız poster + cue kartı; altyazıyı LessonTeleprompter overlay basar. */
  captions?: boolean;
}) {
  const lines = useMemo(
    () => (captions ? loadAcademyTeleprompterFlow(stage.lessonKey) : []),
    [captions, stage.lessonKey],
  );
  const card = academyVisualStageActiveCard(stage, currentTime);
  const motion = academyVisualStageMotion(stage, currentTime, playing);
  const kind = academyVisualStageCinemaKind(stage);
  const activeIndex = academyTeleprompterActiveLineIndex(lines, currentTime);
  const activeRef = useRef<HTMLParagraphElement | null>(null);
  const mediaActive = card != null;

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
    >
      <img
        className="academy-player-eye-backdrop"
        src={stage.posterSrc}
        alt=""
        data-academy-eye-backdrop=""
      />
      {card ? (
        <LessonCinemaMediaCard
          card={card}
          playing={playing}
          motion={motion}
          fallbackSrc={stage.posterSrc}
        />
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
