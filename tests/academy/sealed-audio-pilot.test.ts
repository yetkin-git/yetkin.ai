import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { ACADEMY_SEALED_AUDIO_DURATION_SEC } from "@/lib/academy/lesson-audio";
import { loadAcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import { hasAcademyLessonCues, loadAcademyLessonCues } from "@/lib/academy/lesson-cues";
import { resolveAcademyLessonPlayerAudioSrc } from "@/lib/academy/lesson-playback";
import {
  ACADEMY_MEDIA_SEALED_AUDIO,
  academyMediaSealedWavCount,
  isAcademyCompactLessonKey,
  isAcademyLessonAudioSealed,
} from "@/lib/academy/pilot-sku";
import { ACADEMY_SPOKEN_SCRIPT_LESSON_KEYS, loadAcademySpokenScriptProse } from "@/lib/academy/spoken-scripts";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";

const ROOT = process.cwd();
const LESSON_KEY = "01_office_ai-1";
const COURSE_SLUG = "01_office_ai";

describe("akademi mühürlü ses — 01_office_ai-1 Callirrhoe kaseti", () => {
  it("WAV mührü, cue, timings ve karaoke katmanı açılır", () => {
    expect(ACADEMY_MEDIA_SEALED_AUDIO).toEqual({
      "01_office_ai": ["01_office_ai-1", "01_office_ai-2"],
    });
    expect(academyMediaSealedWavCount()).toBe(2);
    expect(ACADEMY_SEALED_AUDIO_DURATION_SEC).toEqual({ "01_office_ai-1": 547, "01_office_ai-2": 500 });
    expect(isAcademyLessonAudioSealed(COURSE_SLUG, LESSON_KEY)).toBe(true);
    expect(isAcademyCompactLessonKey(LESSON_KEY)).toBe(true);
    const timings = loadAcademySealedAudioTimings(LESSON_KEY);
    expect(timings?.durationSec).toBe(547.12);
    expect(timings?.cacheV).toBe(547120);
    expect(timings?.pieces).toHaveLength(15);
    expect(timings?.pieces.at(-1)?.text).toMatch(/Hazırsan 2\. bölümde buluşalım/u);
    expect(timings?.pieces.at(-1)?.text).not.toMatch(/görüşmek üzere/u);
    expect(hasAcademyLessonCues(LESSON_KEY)).toBe(true);
    expect(loadAcademyLessonCues(LESSON_KEY)).toHaveLength(8);
    expect(ACADEMY_SPOKEN_SCRIPT_LESSON_KEYS).toEqual(["01_office_ai-1", "01_office_ai-2"]);
    expect(loadAcademySpokenScriptProse(LESSON_KEY)).toMatch(/Selamlar, ben Gözde/u);
    const layer = academyCitizenPlayerLayer(COURSE_SLUG, LESSON_KEY);
    expect(layer.kind).toBe("article+karaoke");
    expect(resolveAcademyLessonPlayerAudioSrc(COURSE_SLUG, LESSON_KEY, undefined)).toContain(
      "/media/academy/audio/01_office_ai/01_office_ai-1.mp3",
    );
    expect(existsSync(join(ROOT, "public/media/academy/audio/01_office_ai/01_office_ai-1.mp3"))).toBe(true);
    expect(existsSync(join(ROOT, "public/media/academy/audio/01_office_ai/01_office_ai-1.bed.mp3"))).toBe(true);
    expect(existsSync(join(ROOT, "public/media/academy/audio/01_office_ai/01_office_ai-2.mp3"))).toBe(true);
    const lessonTwo = "01_office_ai-2";
    expect(isAcademyLessonAudioSealed(COURSE_SLUG, lessonTwo)).toBe(true);
    expect(loadAcademySealedAudioTimings(lessonTwo)?.durationSec).toBe(500.12);
    expect(loadAcademySealedAudioTimings(lessonTwo)?.pieces).toHaveLength(14);
    expect(loadAcademyLessonCues(lessonTwo)).toHaveLength(8);
    expect(loadAcademySpokenScriptProse(lessonTwo)).toMatch(/Selamlar, ben Gözde/u);
    expect(academyCitizenPlayerLayer(COURSE_SLUG, lessonTwo).kind).toBe("article+karaoke");
    expect(curriculumForCourseSlug(COURSE_SLUG)).toHaveLength(6);
  });

  it("vatandaş TTS kapısı 410 durur; bake yalnız operatör script’idir", () => {
    const speech = readFileSync(join(ROOT, "app/api/academy/generateSpeech/route.ts"), "utf8");
    const listen = readFileSync(join(ROOT, "app/api/academy/courses/[id]/listen/route.ts"), "utf8");
    expect(speech).toContain("410");
    expect(listen).toContain("410");
    const bake = readFileSync(join(ROOT, "scripts/generate-academy-lesson-audio.ts"), "utf8");
    expect(bake).toContain("--seal");
    expect(bake).toContain("--confirm-gemini-spend");
    expect(bake).toContain("--dry-run");
    expect(bake).toContain("overlaySealedCueTimes");
    expect(bake).toContain("01_office_ai_01_cue.json");
    expect(existsSync(join(ROOT, "lib/academy/citizen-player-layer.ts"))).toBe(true);
  });

  it("oynatıcı currentTime saatidir; kelime-saati yayın senkronu değildir", () => {
    const player = readFileSync(join(ROOT, "components/academy/lesson-media-player.tsx"), "utf8");
    const layer = readFileSync(join(ROOT, "lib/academy/citizen-player-layer.ts"), "utf8");
    expect(player).toContain("academyLessonAudioPlaybackSrc");
    expect(player).toContain('data-academy-clock="currentTime"');
    expect(player).not.toContain("buildAcademyDialogueTimeline");
    expect(layer).toContain("isAcademyLessonAudioSealed");
    expect(layer).toContain("loadAcademyTeleprompterFlow");
  });
});
