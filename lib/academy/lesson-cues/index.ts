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
import ecommerceAiLesson1CuesJson from "./02_ecommerce_ai-1.json" with { type: "json" };
import ecommerceAiLesson2CuesJson from "./02_ecommerce_ai-2.json" with { type: "json" };
import ecommerceAiLesson3CuesJson from "./02_ecommerce_ai-3.json" with { type: "json" };
import ecommerceAiLesson4CuesJson from "./02_ecommerce_ai-4.json" with { type: "json" };
import ecommerceAiLesson5CuesJson from "./02_ecommerce_ai-5.json" with { type: "json" };
import ecommerceAiLesson6CuesJson from "./02_ecommerce_ai-6.json" with { type: "json" };
import socialMediaAiLesson1CuesJson from "./03_social_media_ai-1.json" with { type: "json" };
import socialMediaAiLesson2CuesJson from "./03_social_media_ai-2.json" with { type: "json" };
import socialMediaAiLesson3CuesJson from "./03_social_media_ai-3.json" with { type: "json" };
import socialMediaAiLesson4CuesJson from "./03_social_media_ai-4.json" with { type: "json" };
import socialMediaAiLesson5CuesJson from "./03_social_media_ai-5.json" with { type: "json" };
import socialMediaAiLesson6CuesJson from "./03_social_media_ai-6.json" with { type: "json" };
import chatbotNocodeLesson1CuesJson from "./04_chatbot_nocode-1.json" with { type: "json" };
import chatbotNocodeLesson2CuesJson from "./04_chatbot_nocode-2.json" with { type: "json" };
import chatbotNocodeLesson3CuesJson from "./04_chatbot_nocode-3.json" with { type: "json" };
import chatbotNocodeLesson4CuesJson from "./04_chatbot_nocode-4.json" with { type: "json" };
import chatbotNocodeLesson5CuesJson from "./04_chatbot_nocode-5.json" with { type: "json" };
import chatbotNocodeLesson6CuesJson from "./04_chatbot_nocode-6.json" with { type: "json" };
import promptPracticeLesson1CuesJson from "./05_prompt_practice-1.json" with { type: "json" };
import promptPracticeLesson2CuesJson from "./05_prompt_practice-2.json" with { type: "json" };
import promptPracticeLesson3CuesJson from "./05_prompt_practice-3.json" with { type: "json" };
import promptPracticeLesson4CuesJson from "./05_prompt_practice-4.json" with { type: "json" };
import promptPracticeLesson5CuesJson from "./05_prompt_practice-5.json" with { type: "json" };
import promptPracticeLesson6CuesJson from "./05_prompt_practice-6.json" with { type: "json" };
import type { AcademyCinemaCaptionCue } from "@/lib/academy/lesson-cinema";
import {
  applyAcademySealedAudioTimingsToCues,
  loadAcademySealedAudioTimings,
} from "@/lib/academy/lesson-audio-timings";

export type AcademyLessonCue = AcademyCinemaCaptionCue & {
  id: string;
  section: string;
  /** Tam eğitim metni — teleprompter ekranı. TTS fonetiği spoken-scripts katmanındadır. */
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
  "02_ecommerce_ai-1": parseAcademyLessonCues(ecommerceAiLesson1CuesJson),
  "02_ecommerce_ai-2": parseAcademyLessonCues(ecommerceAiLesson2CuesJson),
  "02_ecommerce_ai-3": parseAcademyLessonCues(ecommerceAiLesson3CuesJson),
  "02_ecommerce_ai-4": parseAcademyLessonCues(ecommerceAiLesson4CuesJson),
  "02_ecommerce_ai-5": parseAcademyLessonCues(ecommerceAiLesson5CuesJson),
  "02_ecommerce_ai-6": parseAcademyLessonCues(ecommerceAiLesson6CuesJson),
  "03_social_media_ai-1": parseAcademyLessonCues(socialMediaAiLesson1CuesJson),
  "03_social_media_ai-2": parseAcademyLessonCues(socialMediaAiLesson2CuesJson),
  "03_social_media_ai-3": parseAcademyLessonCues(socialMediaAiLesson3CuesJson),
  "03_social_media_ai-4": parseAcademyLessonCues(socialMediaAiLesson4CuesJson),
  "03_social_media_ai-5": parseAcademyLessonCues(socialMediaAiLesson5CuesJson),
  "03_social_media_ai-6": parseAcademyLessonCues(socialMediaAiLesson6CuesJson),
  "04_chatbot_nocode-1": parseAcademyLessonCues(chatbotNocodeLesson1CuesJson),
  "04_chatbot_nocode-2": parseAcademyLessonCues(chatbotNocodeLesson2CuesJson),
  "04_chatbot_nocode-3": parseAcademyLessonCues(chatbotNocodeLesson3CuesJson),
  "04_chatbot_nocode-4": parseAcademyLessonCues(chatbotNocodeLesson4CuesJson),
  "04_chatbot_nocode-5": parseAcademyLessonCues(chatbotNocodeLesson5CuesJson),
  "04_chatbot_nocode-6": parseAcademyLessonCues(chatbotNocodeLesson6CuesJson),
  "05_prompt_practice-1": parseAcademyLessonCues(promptPracticeLesson1CuesJson),
  "05_prompt_practice-2": parseAcademyLessonCues(promptPracticeLesson2CuesJson),
  "05_prompt_practice-3": parseAcademyLessonCues(promptPracticeLesson3CuesJson),
  "05_prompt_practice-4": parseAcademyLessonCues(promptPracticeLesson4CuesJson),
  "05_prompt_practice-5": parseAcademyLessonCues(promptPracticeLesson5CuesJson),
  "05_prompt_practice-6": parseAcademyLessonCues(promptPracticeLesson6CuesJson),
};

export function loadAcademyLessonCues(lessonKey: string): readonly AcademyLessonCue[] {
  return CUES_BY_LESSON_KEY[lessonKey.trim()] ?? [];
}

/** Cue paragrafları — bake turu; her tur anlamlı paragraf bloğu (12–15 istek/ders). */
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
