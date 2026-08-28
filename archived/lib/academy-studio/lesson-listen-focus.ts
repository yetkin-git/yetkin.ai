/**
 * Dersi Dinle odak zaman çizelgesi — ses ilerlemesini oynatıcı bloğuna bağlar.
 *
 * TTS kod çitini ve görsel yuvaları okumaz. Mikro-video / şema, önceki
 * konuşulan paragrafın kuyruğunda (tail) kokpit odağı alır.
 */

import { spokenAcademyLessonSegment } from "@/lib/academy/lesson-body";
import type { AcademyLessonBodyBlock } from "@/lib/academy/lesson-media";

/** Konuşulan paragrafın son dilimi görsel karta bırakılır. */
export const ACADEMY_LISTEN_VISUAL_TAIL_RATIO = 0.2;

/** Manuel kaydırmadan sonra otomatik takibin yeniden açılma süresi. */
export const ACADEMY_LISTEN_SCROLL_OVERRIDE_MS = 8_000;

export type AcademyLessonListenCue = {
  blockIndex: number;
  start: number;
  end: number;
};

function isVisualListenBlock(block: AcademyLessonBodyBlock): boolean {
  return block.kind === "micro-video" || block.kind === "diagram";
}

function spokenCharsForBlock(block: AcademyLessonBodyBlock): string {
  if (block.kind === "diagram" || block.kind === "micro-video") {
    return "";
  }
  return spokenAcademyLessonSegment(block).replace(/\s+/gu, " ").trim();
}

export function academyLessonListenFocusCues(
  blocks: readonly AcademyLessonBodyBlock[],
): AcademyLessonListenCue[] {
  const spoken: AcademyLessonListenCue[] = [];
  let offset = 0;
  for (let index = 0; index < blocks.length; index += 1) {
    const text = spokenCharsForBlock(blocks[index]!);
    if (!text) {
      continue;
    }
    if (offset > 0) {
      const previous = spoken[spoken.length - 1];
      if (previous) {
        previous.end += 1;
      }
      offset += 1;
    }
    spoken.push({ blockIndex: index, start: offset, end: offset + text.length });
    offset += text.length;
  }

  if (spoken.length === 0) {
    return [];
  }

  const cues: AcademyLessonListenCue[] = [];
  for (let index = 0; index < spoken.length; index += 1) {
    const run = spoken[index]!;
    const from = run.blockIndex + 1;
    const until = index + 1 < spoken.length ? spoken[index + 1]!.blockIndex : blocks.length;
    const visuals: number[] = [];
    for (let cursor = from; cursor < until; cursor += 1) {
      if (isVisualListenBlock(blocks[cursor]!)) {
        visuals.push(cursor);
      }
    }
    const span = run.end - run.start;
    const tail = Math.floor(span * ACADEMY_LISTEN_VISUAL_TAIL_RATIO);
    if (visuals.length === 0 || tail < 1 || span - tail < 1) {
      cues.push({ blockIndex: run.blockIndex, start: run.start, end: run.end });
      continue;
    }
    const spokenEnd = run.end - tail;
    cues.push({ blockIndex: run.blockIndex, start: run.start, end: spokenEnd });
    let cursor = spokenEnd;
    for (let visual = 0; visual < visuals.length; visual += 1) {
      const end =
        visual === visuals.length - 1
          ? run.end
          : spokenEnd + Math.round(((visual + 1) * tail) / visuals.length);
      cues.push({
        blockIndex: visuals[visual]!,
        start: cursor,
        end: Math.max(end, cursor),
      });
      cursor = Math.max(end, cursor);
    }
  }
  return cues.filter((cue) => cue.end > cue.start);
}

export function academyLessonListenProgressRatio(currentTime: number, duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(currentTime)) {
    return 0;
  }
  return Math.min(1, Math.max(0, currentTime / duration));
}

export function activeAcademyLessonListenFocusIndex(
  cues: readonly AcademyLessonListenCue[],
  progress: number,
): number | null {
  if (cues.length === 0) {
    return null;
  }
  const total = cues[cues.length - 1]!.end;
  if (total <= 0) {
    return cues[0]!.blockIndex;
  }
  const ratio = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;
  const offset = ratio >= 1 ? total - Number.EPSILON : ratio * total;
  for (const cue of cues) {
    if (offset >= cue.start && offset < cue.end) {
      return cue.blockIndex;
    }
  }
  return cues[cues.length - 1]!.blockIndex;
}

export function isAcademyLessonListenFocusActive(
  phase: "idle" | "preparing" | "playing" | "paused" | "ended",
): boolean {
  return phase === "playing" || phase === "paused" || phase === "ended";
}
