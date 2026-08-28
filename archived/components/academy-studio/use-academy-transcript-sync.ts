"use client";

import { useMemo, useRef } from "react";
import { isAcademyLessonListenFocusActive } from "@/archived/lib/academy-studio/lesson-listen-focus";
import { academyListenFrozenElapsedSec } from "@/archived/lib/academy-studio/lesson-listen-script";
import {
  academyTranscriptElapsedSec,
  activeAcademyTranscriptCueIndex,
  buildAcademyTranscriptTrack,
  type AcademyTranscriptCue,
  type AcademyTranscriptTrack,
} from "@/archived/lib/academy-studio/lesson-transcript-sync";
import type { AcademyLessonBlock } from "@/lib/academy/lesson-media";
import type { LessonListenPlayback } from "@/archived/components/academy-studio/lesson-listen-button";

export type AcademyTranscriptSyncState = {
  track: AcademyTranscriptTrack;
  activeCue: AcademyTranscriptCue | null;
  activeCueId: string | null;
  listening: boolean;
  following: boolean;
};

type FreezeClock = {
  elapsed: number;
  phase: NonNullable<LessonListenPlayback>["phase"] | undefined;
  seekGeneration: number;
};

/**
 * Ders izleme — hoparlör saati ile ekran cümlesi aynı cue dizisinden okunur.
 * Pause donar; seek `seekGeneration` ile yeni saniyeyi alır. Stüdyo overlay
 * (source=studio) ders metnini kaydırmaz. TTS dilim pre-roll’u `audioLeadInSec`
 * ile kelime saatine eklenir.
 */
export function useAcademyTranscriptSync(input: {
  lessonKey: string;
  title: string;
  body: string;
  courseSlug: string;
  blocks: readonly AcademyLessonBlock[];
  playback: LessonListenPlayback | null;
}): AcademyTranscriptSyncState {
  const track = useMemo(
    () =>
      buildAcademyTranscriptTrack({
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
    playback.source !== "studio" &&
    (playback.phase === "playing" || playback.phase === "paused" || playback.phase === "ended");
  const rawElapsed = clockLive
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
        elapsed: rawElapsed,
        phase: playback.phase,
        seekGeneration: playback.seekGeneration ?? 0,
      }
    : { elapsed: 0, phase: playback?.phase, seekGeneration: 0 };
  const listening =
    playback != null &&
    playback.source !== "studio" &&
    isAcademyLessonListenFocusActive(playback.phase);
  const following = listening && playback?.phase === "playing";
  const elapsed = listening
    ? academyTranscriptElapsedSec({
        currentTime: rawElapsed,
        audioDuration: playback?.duration ?? 0,
        spokenDuration: track.spokenDuration,
        audioLeadInSec: track.audioLeadInSec,
      })
    : 0;
  const activeIndex = listening ? activeAcademyTranscriptCueIndex(track.cues, elapsed) : null;
  const activeCue = activeIndex == null ? null : (track.cues[activeIndex] ?? null);
  return {
    track,
    activeCue,
    activeCueId: activeCue?.id ?? null,
    listening,
    following,
  };
}
