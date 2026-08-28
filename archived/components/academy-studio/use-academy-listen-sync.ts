"use client";

import { useMemo, useRef } from "react";
import { isAcademyLessonListenFocusActive } from "@/archived/lib/academy-studio/lesson-listen-focus";
import {
  academyListenFrozenElapsedSec,
  academyListenScriptIdleCardIndex,
  activeAcademyListenScriptCardIndexAtElapsed,
  buildAcademyLessonListenScript,
  type AcademyListenScript,
  type AcademyListenScriptCard,
} from "@/archived/lib/academy-studio/lesson-listen-script";
import type { AcademyLessonBlock } from "@/lib/academy/lesson-media";

export type AcademyListenSyncPlayback = {
  phase: "idle" | "preparing" | "playing" | "paused" | "ended";
  currentTime: number;
  duration: number;
  source: "lesson" | "studio";
  fallback?: boolean;
  generation?: number;
  seekGeneration?: number;
  cardIndex?: number;
  cardCount?: number;
} | null;

export type AcademyListenSyncState = {
  script: AcademyListenScript;
  stageIndex: number;
  listening: boolean;
  activeCard: AcademyListenScriptCard | null;
  focusBlockIndex: number | null;
};

type FreezeClock = {
  elapsed: number;
  phase: NonNullable<AcademyListenSyncPlayback>["phase"] | undefined;
  seekGeneration: number;
};

/**
 * Ders gövdesi + TTS sırası tek script; sahne saati script cue saniyesidir
 * (kısa WAV `duration`'ına oranlanmaz — 11 sn'de tüm perdeler yanmaz).
 * Pause / ended: `academyListenFrozenElapsedSec` currentTime sızıntısını yemez;
 * slider seek `seekGeneration` ile donmuş saati dürüstçe taşır.
 * Stüdyo overlay (repeat / canlı soru) ders kartlarını kaydırmaz.
 * Kota düşüşünde hoparlör yok; perdeler 420 ms/kelime okuma saatiyle akar.
 */
export function useAcademyListenSync(input: {
  lessonKey: string;
  title: string;
  body: string;
  courseSlug: string;
  blocks: readonly AcademyLessonBlock[];
  playback: AcademyListenSyncPlayback;
}): AcademyListenSyncState {
  const script = useMemo(
    () =>
      buildAcademyLessonListenScript({
        lessonKey: input.lessonKey,
        title: input.title,
        body: input.body,
        courseSlug: input.courseSlug,
        blocks: input.blocks,
      }),
    [input.body, input.blocks, input.courseSlug, input.lessonKey, input.title],
  );
  const playback = input.playback;
  const freezeRef = useRef<FreezeClock>({ elapsed: 0, phase: undefined, seekGeneration: 0 });
  const clockLive =
    playback != null &&
    (playback.phase === "playing" || playback.phase === "paused" || playback.phase === "ended");
  const elapsed = clockLive
    ? academyListenFrozenElapsedSec({
        phase: playback.phase,
        currentTime: playback.currentTime,
        previousFrozen: freezeRef.current.elapsed,
        previousPhase: freezeRef.current.phase,
        seekGeneration: playback.seekGeneration ?? 0,
        previousSeekGeneration: freezeRef.current.seekGeneration,
      })
    : 0;
  freezeRef.current = clockLive
    ? {
        elapsed,
        phase: playback.phase,
        seekGeneration: playback.seekGeneration ?? 0,
      }
    : { elapsed: 0, phase: playback?.phase, seekGeneration: 0 };
  const lessonAudio =
    playback != null &&
    playback.source !== "studio" &&
    (playback.phase === "preparing" || isAcademyLessonListenFocusActive(playback.phase));
  const listening = lessonAudio;
  const focusedCardIndex =
    listening && playback != null && playback.cardCount != null && playback.cardCount > 0
      ? Math.min(Math.max(0, playback.cardIndex ?? 0), playback.cardCount - 1)
      : listening
        ? activeAcademyListenScriptCardIndexAtElapsed(script.cues, elapsed)
        : null;
  const idleIndex = academyListenScriptIdleCardIndex(script);
  const stageIndex = focusedCardIndex ?? idleIndex;
  const activeCard = script.cards[stageIndex] ?? null;
  const focusBlockIndex = listening ? (activeCard?.blockIndex ?? null) : null;
  return {
    script,
    stageIndex,
    listening,
    activeCard,
    focusBlockIndex,
  };
}
