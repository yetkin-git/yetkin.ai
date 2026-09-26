/**
 * OFF-201 sinema — konuşulan örnek satırı, cümle başında slayta biner.
 * Jenerik şablon, o satır söylenirken ekranda kalmaz.
 */

import type { AcademyCinemaCueSlide } from "@/lib/academy/cinema-cue-catalog";
import {
  academyOff201SpokenVisualCueAtTime,
  academyOff201SpokenVisualCues,
  type AcademyOff201SpokenTableKey,
  type AcademyOff201SpokenVisualCue,
} from "@/lib/academy/lesson-beat-visual";
import { loadAcademyKaraokeStrip } from "@/lib/academy/lesson-teleprompter-flow";
import { off201ExampleTable } from "@/lib/academy/off201-cinema-slides";

function tablesFor(lessonKey: string) {
  const raw = off201ExampleTable(lessonKey, "raw");
  const mask = off201ExampleTable(lessonKey, "mask");
  const clean = off201ExampleTable(lessonKey, "clean");
  if (!raw || !mask || !clean) {
    return null;
  }
  return { raw, mask, clean };
}

const CUE_CACHE = new Map<string, readonly AcademyOff201SpokenVisualCue[]>();

export function loadOff201SpokenVisualCues(lessonKey: string): readonly AcademyOff201SpokenVisualCue[] {
  const key = lessonKey.trim();
  const cached = CUE_CACHE.get(key);
  if (cached) {
    return cached;
  }
  const tables = tablesFor(key);
  if (!tables) {
    return [];
  }
  const sentences = loadAcademyKaraokeStrip(key).map((line) => ({
    cueId: line.cueId,
    text: line.text,
    start: line.start,
    end: line.end,
  }));
  const cues = academyOff201SpokenVisualCues({ sentences, tables });
  CUE_CACHE.set(key, cues);
  return cues;
}

function slideShowsNeedle(slide: AcademyCinemaCueSlide, needle: string): boolean {
  const folded = needle.toLocaleLowerCase("tr-TR");
  return (slide.table?.rows ?? []).some((row) =>
    row.some((cell) => cell.toLocaleLowerCase("tr-TR").includes(folded)),
  );
}

export function academyOff201FrameSlide(
  slide: AcademyCinemaCueSlide,
  currentTime: number,
  options?: { allowSwap?: boolean },
): AcademyCinemaCueSlide {
  const cues = loadOff201SpokenVisualCues(slide.lessonKey);
  const cue = academyOff201SpokenVisualCueAtTime(cues, currentTime);
  if (!cue) {
    return slide;
  }
  const allowSwap = options?.allowSwap !== false && slide.visualMode !== "split";
  const already = slideShowsNeedle(slide, cue.needle);
  if (!already && !allowSwap) {
    return slide;
  }
  const table = already ? slide.table : off201ExampleTable(slide.lessonKey, cue.tableKey as AcademyOff201SpokenTableKey);
  if (!table) {
    return slide;
  }
  return {
    ...slide,
    table,
    highlightCell: cue.highlightCell,
    sheetName: already ? slide.sheetName : cue.tableKey === "raw" ? "Ham not" : cue.tableKey === "mask" ? "Maskeli" : "Doğru",
  };
}
