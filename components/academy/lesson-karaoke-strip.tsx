"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  academyKaraokeStripLines,
  academyKaraokeWords,
  academyKaraokeWordState,
  academyTeleprompterActiveLineIndex,
  type AcademyTeleprompterLine,
} from "@/lib/academy/lesson-teleprompter-flow";

export function LessonKaraokeStrip({
  cues,
  currentTime,
  playing = false,
}: {
  cues: readonly AcademyTeleprompterLine[];
  currentTime: number;
  playing?: boolean;
}) {
  const lines = useMemo(() => academyKaraokeStripLines(cues), [cues]);
  const activeIndex = academyTeleprompterActiveLineIndex(lines, currentTime);
  const activeLine = activeIndex == null ? null : lines[activeIndex] ?? null;
  const words = useMemo(() => (activeLine ? academyKaraokeWords(activeLine) : []), [activeLine]);
  const activeWordRef = useRef<HTMLSpanElement | null>(null);
  const activeWord = words.find((word) => academyKaraokeWordState(word, currentTime) === "active") ?? words[0] ?? null;

  useEffect(() => {
    const node = activeWordRef.current;
    if (!node) {
      return;
    }
    const reduce =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const line = node.closest("[data-academy-karaoke-line]");
    if (
      line instanceof HTMLElement &&
      line.scrollHeight <= line.clientHeight + 1 &&
      line.scrollWidth <= line.clientWidth + 1
    ) {
      return;
    }
    node.scrollIntoView({
      inline: "nearest",
      block: "nearest",
      behavior: reduce ? "auto" : "smooth",
    });
  }, [activeWord?.id, playing]);

  return (
    <div
      className="academy-player-karaoke-strip flex flex-col items-center justify-center overflow-visible text-center"
      data-academy-karaoke-strip=""
      data-academy-karaoke-band="overlay"
      data-academy-karaoke-playing={playing ? "true" : undefined}
      data-academy-karaoke-cue={activeLine?.cueId}
      role="region"
      aria-label="Kayan konuşma metni"
      aria-live="polite"
    >
      <p
        className="academy-player-karaoke-line flex w-full flex-wrap items-center justify-center gap-x-[0.32em] gap-y-[0.2em] text-center"
        data-academy-karaoke-line={activeLine?.id}
      >
        {activeLine
          ? words.map((word) => {
              const state = academyKaraokeWordState(word, currentTime);
              const active = word.id === activeWord?.id;
              return (
                <span
                  key={word.id}
                  ref={active ? activeWordRef : undefined}
                  className="academy-player-karaoke-word"
                  data-academy-karaoke-word={word.id}
                  data-state={state}
                  data-active={active ? "true" : undefined}
                  data-glue={word.glue ? "true" : undefined}
                >
                  {word.text}
                </span>
              );
            })
          : null}
      </p>
    </div>
  );
}
