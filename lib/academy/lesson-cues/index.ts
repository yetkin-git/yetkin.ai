/**
 * Ders cue SSOT — compact taslağı şişirmez.
 * Saat HTMLMediaElement.currentTime; kelime-saati yayın senkronu değildir.
 * Mühürlü WAV’da playback cue saniyeleri bake parça saatidir.
 */

import officeAiLesson1CuesJson from "./01_office_ai-1.json" with { type: "json" };
import officeAiLesson2CuesJson from "./01_office_ai-2.json" with { type: "json" };
import officeAiLesson3CuesJson from "./01_office_ai-3.json" with { type: "json" };
import officeAiLesson4CuesJson from "./01_office_ai-4.json" with { type: "json" };
import officeAiLesson5CuesJson from "./01_office_ai-5.json" with { type: "json" };
import officeAiLesson6CuesJson from "./01_office_ai-6.json" with { type: "json" };
import type { AcademyCinemaCaptionCue } from "@/lib/academy/lesson-cinema";
import {
  applyAcademySealedAudioTimingsToCues,
  loadAcademySealedAudioTimings,
} from "@/lib/academy/lesson-audio-timings";

export type AcademyLessonCue = AcademyCinemaCaptionCue & {
  id: string;
  section: string;
  /** Tam eğitim metni — teleprompter ve TTS taze nefes paragrafları. */
  paragraphs?: readonly string[];
};

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

const CUES_BY_LESSON_KEY: Readonly<Record<string, readonly AcademyLessonCue[]>> = {
  "01_office_ai-1": parseAcademyLessonCues(officeAiLesson1CuesJson),
  "01_office_ai-2": parseAcademyLessonCues(officeAiLesson2CuesJson),
  "01_office_ai-3": parseAcademyLessonCues(officeAiLesson3CuesJson),
  "01_office_ai-4": parseAcademyLessonCues(officeAiLesson4CuesJson),
  "01_office_ai-5": parseAcademyLessonCues(officeAiLesson5CuesJson),
  "01_office_ai-6": parseAcademyLessonCues(officeAiLesson6CuesJson),
};

export function loadAcademyLessonCues(lessonKey: string): readonly AcademyLessonCue[] {
  return CUES_BY_LESSON_KEY[lessonKey.trim()] ?? [];
}

/** Cue paragrafları — bake turu; her tur 3–5 sn nefes dilimine bölünür. */
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
