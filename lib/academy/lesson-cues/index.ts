/**
 * Ders cue SSOT — compact taslağı şişirmez.
 * Saat HTMLMediaElement.currentTime; kelime-saati yayın senkronu değildir.
 * Mühürlü WAV’da playback cue saniyeleri bake parça saatidir.
 */

import type { AcademyCinemaCaptionCue } from "@/lib/academy/lesson-cinema";
import {
  academyLessonJsonGeneration,
  readAcademyLessonJson,
} from "@/lib/academy/lesson-json-store";
import {
  applyAcademySealedAudioTimingsToCues,
  loadAcademySealedAudioTimings,
} from "@/lib/academy/lesson-audio-timings";
import {
  ACADEMY_PUNCHCARD_MAX_WORDS,
  ACADEMY_WELCOME_PUNCHCARD_CEILING_SEC,
  ACADEMY_WELCOME_PUNCHCARD_MAX_SEC,
  ACADEMY_WELCOME_PUNCHCARD_MIN_SEC,
  academyCitizenPunchcardLabel,
  punchcardLabelFromText,
  punchcardVisualEnd,
} from "@/lib/academy/punchcard-from-sealed-json";

export {
  ACADEMY_PUNCHCARD_MAX_WORDS,
  ACADEMY_WELCOME_PUNCHCARD_CEILING_SEC,
  ACADEMY_WELCOME_PUNCHCARD_MAX_SEC,
  ACADEMY_WELCOME_PUNCHCARD_MIN_SEC,
  academyCitizenPunchcardLabel,
};

export type AcademyLessonCue = AcademyCinemaCaptionCue & {
  id: string;
  section: string;
  /** Tam eğitim metni — bake/TTS. Vatandaş sahnesine basılmaz; sahnede yalnız punchcard `text` durur. */
  paragraphs?: readonly string[];
};

export function academyPunchcardLabel(text: string): string {
  return punchcardLabelFromText(text, ACADEMY_PUNCHCARD_MAX_WORDS);
}

/** Şişkin HOŞ GELDİN penceresini 18 sn auto-hide’a indirir; diğer rozetler cue `end` kullanır. */
export function academyPunchcardVisualEnd(
  cue: Pick<AcademyLessonCue, "id" | "text" | "start" | "end">,
): number {
  return punchcardVisualEnd({
    id: cue.id,
    label: academyPunchcardLabel(cue.text),
    start: cue.start,
    end: cue.end,
  });
}

/**
 * HTMLAudio.currentTime → aktif playback cue.
 * Nefes boşluğunda (cue.end … next.start) son başlayan cue tutulur; unmount/Adım 1 takılması olmaz.
 * Intro (ilk start’tan önce) ve outro (son end’den sonra) null döner.
 */
export function academyPlaybackCueAtTime<T extends Pick<AcademyLessonCue, "id" | "start" | "end">>(
  cues: readonly T[],
  currentTime: number,
): T | null {
  if (cues.length === 0) {
    return null;
  }
  const t = Number.isFinite(currentTime) ? currentTime : 0;
  const first = cues[0]!;
  const last = cues[cues.length - 1]!;
  if (t < first.start || t >= last.end) {
    return null;
  }
  let held = first;
  for (const cue of cues) {
    if (t >= cue.start) {
      held = cue;
      continue;
    }
    break;
  }
  return held;
}

export function academyActivePunchcard(
  cues: readonly Pick<AcademyLessonCue, "id" | "text" | "start" | "end">[],
  currentTime: number,
): { cueId: string; label: string } | null {
  const t = Number.isFinite(currentTime) ? currentTime : 0;
  for (const cue of cues) {
    const label = academyPunchcardLabel(cue.text);
    if (!label) {
      continue;
    }
    const visualEnd = academyPunchcardVisualEnd(cue);
    if (t >= cue.start && t < visualEnd) {
      return { cueId: cue.id, label };
    }
  }
  return null;
}

function parseAcademyLessonCues(raw: unknown): readonly AcademyLessonCue[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const cues: AcademyLessonCue[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") {
      continue;
    }
    const rec = row as Record<string, unknown>;
    if (typeof rec.id !== "string" || rec.id.length === 0) {
      continue;
    }
    if (typeof rec.text !== "string" || rec.text.length === 0) {
      continue;
    }
    if (typeof rec.section !== "string" || rec.section.length === 0) {
      continue;
    }
    if (typeof rec.start !== "number" || !Number.isFinite(rec.start) || rec.start < 0) {
      continue;
    }
    if (typeof rec.end !== "number" || !Number.isFinite(rec.end) || rec.end < rec.start) {
      continue;
    }
    const paragraphs = Array.isArray(rec.paragraphs)
      ? rec.paragraphs
          .filter((row): row is string => typeof row === "string")
          .map((row) => row.replace(/\s+/gu, " ").trim())
          .filter((row) => row.length > 0)
      : undefined;
    cues.push({
      id: rec.id,
      start: rec.start,
      end: rec.end,
      text: rec.text,
      section: rec.section,
      ...(paragraphs && paragraphs.length > 0 ? { paragraphs } : {}),
    });
  }
  return cues;
}

let seenCueGeneration = -1;
const parsedCueCache = new Map<string, readonly AcademyLessonCue[]>();

function syncCueCacheGeneration(): void {
  const generation = academyLessonJsonGeneration();
  if (seenCueGeneration !== generation) {
    parsedCueCache.clear();
    seenCueGeneration = generation;
  }
}

export function loadAcademyLessonCues(lessonKey: string): readonly AcademyLessonCue[] {
  const key = lessonKey.trim();
  syncCueCacheGeneration();
  const hit = parsedCueCache.get(key);
  if (hit) return hit;
  const raw = readAcademyLessonJson("lesson-cues", key);
  if (raw == null) return [];
  const parsed = parseAcademyLessonCues(raw);
  parsedCueCache.set(key, parsed);
  return parsed;
}

// Cue paragrafları — bake turu. İstek bandı ders başına 10–12 doğal paragraf bloğu.
export function academyLessonCueParagraphPlan(
  lessonKey: string,
): readonly { cueId: string; cueParagraphIndex: number; text: string }[] {
  const plan: { cueId: string; cueParagraphIndex: number; text: string }[] = [];
  for (const cue of loadAcademyLessonCues(lessonKey)) {
    const paragraphs = cue.paragraphs ?? [];
    for (let cueParagraphIndex = 0; cueParagraphIndex < paragraphs.length; cueParagraphIndex += 1) {
      plan.push({
        cueId: cue.id,
        cueParagraphIndex,
        text: paragraphs[cueParagraphIndex]!,
      });
    }
  }
  return plan;
}

/** Mühürlü WAV parça saniyesi; bake yoksa duvar saati. */
export function loadAcademyLessonPlaybackCues(lessonKey: string): readonly AcademyLessonCue[] {
  return applyAcademySealedAudioTimingsToCues(
    loadAcademyLessonCues(lessonKey),
    loadAcademySealedAudioTimings(lessonKey),
  );
}

export function hasAcademyLessonCues(lessonKey: string): boolean {
  return loadAcademyLessonCues(lessonKey).length > 0;
}

/** Cue duvar saati — son cue `end`. Mühürlü WAV’da oynatıcı `clock: media` ile birebir saniye okur. */
export function academyLessonCueSpokenDuration(cues: readonly Pick<AcademyLessonCue, "end">[]): number {
  const last = cues.at(-1)?.end;
  return typeof last === "number" && Number.isFinite(last) && last > 0 ? last : 0;
}
