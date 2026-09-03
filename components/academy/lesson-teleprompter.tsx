"use client";

import { useLayoutEffect, useRef } from "react";
import {
  ACADEMY_TELEPROMPTER_FOCUS_RATIO,
  academyTeleprompterProgress,
  academyTeleprompterTranslateY,
  type AcademyTeleprompterCue,
} from "@/lib/academy/dialogue-timeline";

function applyTeleprompterTransform(input: {
  viewport: HTMLDivElement;
  cues: Array<HTMLParagraphElement | null>;
  cueIndex: number;
}): number {
  const cue = input.cues[input.cueIndex];
  if (!cue) {
    return 0;
  }
  return academyTeleprompterTranslateY({
    cueTop: cue.offsetTop,
    cueHeight: cue.offsetHeight,
    localRatio: 0,
    viewportHeight: input.viewport.clientHeight,
    focusRatio: ACADEMY_TELEPROMPTER_FOCUS_RATIO,
  });
}

export function LessonTeleprompter({
  cues,
  elapsedSec,
  overlay = false,
  playing = false,
}: {
  cues: readonly AcademyTeleprompterCue[];
  elapsedSec: number;
  overlay?: boolean;
  playing?: boolean;
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cueRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const elapsedRef = useRef(elapsedSec);
  const cuesRef = useRef(cues);
  const progress = academyTeleprompterProgress(cues, elapsedSec);
  elapsedRef.current = elapsedSec;
  cuesRef.current = cues;

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) {
      return;
    }
    const nextY = applyTeleprompterTransform({
      viewport,
      cues: cueRefs.current,
      cueIndex: progress.cueIndex,
    });
    track.style.transform = `translate3d(0, ${nextY}px, 0)`;
  }, [progress.cueIndex, overlay]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver(() => {
      const track = trackRef.current;
      if (!viewport || !track) {
        return;
      }
      const current = academyTeleprompterProgress(cuesRef.current, elapsedRef.current);
      const nextY = applyTeleprompterTransform({
        viewport,
        cues: cueRefs.current,
        cueIndex: current.cueIndex,
      });
      track.style.transform = `translate3d(0, ${nextY}px, 0)`;
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  if (cues.length === 0) {
    return null;
  }

  return (
    <div
      ref={viewportRef}
      className={
        overlay
          ? "academy-teleprompter academy-teleprompter--overlay"
          : "academy-teleprompter"
      }
      data-academy-stage-caption=""
      data-academy-teleprompter=""
      data-academy-teleprompter-align="center"
      data-academy-teleprompter-overlay={overlay ? "true" : undefined}
      data-academy-teleprompter-playing={playing ? "true" : undefined}
    >
      <div ref={trackRef} className="academy-teleprompter-track">
        {cues.map((cue, index) => {
          const distance = Math.abs(index - progress.cueIndex);
          return (
            <p
              key={cue.id}
              ref={(node) => {
                cueRefs.current[index] = node;
              }}
              className="academy-teleprompter-cue"
              data-academy-teleprompter-active={index === progress.cueIndex ? "true" : undefined}
              data-academy-teleprompter-near={distance === 1 ? "true" : undefined}
              data-academy-stage-sentence={index === progress.cueIndex ? "" : undefined}
              data-academy-stage-paragraph={index === progress.cueIndex ? "" : undefined}
            >
              {cue.text}
            </p>
          );
        })}
      </div>
    </div>
  );
}
