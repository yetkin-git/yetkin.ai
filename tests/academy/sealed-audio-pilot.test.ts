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
      "01_office_ai": [
        "01_office_ai-1",
        "01_office_ai-2",
        "01_office_ai-3",
        "01_office_ai-4",
        "01_office_ai-5",
        "01_office_ai-6",
        "01_office_ai-g1",
        "01_office_ai-w1",
        "01_office_ai-k1",
      ],
    });
    expect(academyMediaSealedWavCount()).toBe(9);
    expect(ACADEMY_SEALED_AUDIO_DURATION_SEC).toEqual({
      "01_office_ai-1": 572,
      "01_office_ai-2": 500,
      "01_office_ai-3": 534,
      "01_office_ai-4": 545,
      "01_office_ai-5": 482,
      "01_office_ai-6": 412,
      "01_office_ai-g1": 524,
      "01_office_ai-w1": 521,
      "01_office_ai-k1": 310,
    });
    expect(isAcademyLessonAudioSealed(COURSE_SLUG, LESSON_KEY)).toBe(true);
    expect(isAcademyCompactLessonKey(LESSON_KEY)).toBe(true);
    const timings = loadAcademySealedAudioTimings(LESSON_KEY);
    expect(timings?.durationSec).toBe(571.84);
    expect(timings?.cacheV).toBe(571840);
    expect(timings?.pieces).toHaveLength(15);
    expect(timings?.pieces.at(-1)?.text).toMatch(/Hazırsan 2\. bölümde buluşalım/u);
    expect(timings?.pieces.at(-1)?.text).not.toMatch(/görüşmek üzere/u);
    expect(hasAcademyLessonCues(LESSON_KEY)).toBe(true);
    expect(loadAcademyLessonCues(LESSON_KEY)).toHaveLength(8);
    expect(ACADEMY_SPOKEN_SCRIPT_LESSON_KEYS).toEqual(["01_office_ai-1", "01_office_ai-2", "01_office_ai-3", "01_office_ai-4", "01_office_ai-5", "01_office_ai-6", "01_office_ai-g1", "01_office_ai-w1", "01_office_ai-k1"]);
    expect(loadAcademySpokenScriptProse(LESSON_KEY)).toMatch(/Selamlar, ben Gözde/u);
    const layer = academyCitizenPlayerLayer(COURSE_SLUG, LESSON_KEY);
    expect(layer.kind).toBe("article+karaoke");
    expect(resolveAcademyLessonPlayerAudioSrc(COURSE_SLUG, LESSON_KEY, undefined)).toContain(
      "/media/academy/audio/01_office_ai/01_office_ai-1.mp3",
    );
    expect(existsSync(join(ROOT, "public/media/academy/audio/01_office_ai/01_office_ai-1.mp3"))).toBe(true);
    expect(existsSync(join(ROOT, "public/media/academy/audio/01_office_ai/01_office_ai-1.bed.mp3"))).toBe(true);
    expect(existsSync(join(ROOT, "public/media/academy/audio/01_office_ai/01_office_ai-2.mp3"))).toBe(true);
    expect(existsSync(join(ROOT, "public/media/academy/audio/01_office_ai/01_office_ai-3.mp3"))).toBe(true);
    expect(existsSync(join(ROOT, "public/media/academy/audio/01_office_ai/01_office_ai-4.mp3"))).toBe(true);
    expect(existsSync(join(ROOT, "public/media/academy/audio/01_office_ai/01_office_ai-5.mp3"))).toBe(true);
    const lessonTwo = "01_office_ai-2";
    expect(isAcademyLessonAudioSealed(COURSE_SLUG, lessonTwo)).toBe(true);
    expect(loadAcademySealedAudioTimings(lessonTwo)?.durationSec).toBe(500.12);
    expect(loadAcademySealedAudioTimings(lessonTwo)?.pieces).toHaveLength(14);
    expect(loadAcademyLessonCues(lessonTwo)).toHaveLength(8);
    expect(loadAcademySpokenScriptProse(lessonTwo)).toMatch(/Selamlar, ben Gözde/u);
    expect(academyCitizenPlayerLayer(COURSE_SLUG, lessonTwo).kind).toBe("article+karaoke");
    const lessonThree = "01_office_ai-3";
    expect(isAcademyLessonAudioSealed(COURSE_SLUG, lessonThree)).toBe(true);
    expect(loadAcademySealedAudioTimings(lessonThree)?.durationSec).toBe(533.76);
    expect(loadAcademySealedAudioTimings(lessonThree)?.cacheV).toBe(533760);
    expect(loadAcademySealedAudioTimings(lessonThree)?.pieces).toHaveLength(14);
    expect(loadAcademySealedAudioTimings(lessonThree)?.pieces[0]?.start).toBe(2);
    expect(loadAcademySealedAudioTimings(lessonThree)?.pieces.at(-1)?.end).toBe(533.76);
    expect(loadAcademySealedAudioTimings(lessonThree)?.pieces.at(-1)?.text).toMatch(/E-Posta Akışı/u);
    expect(loadAcademySealedAudioTimings(lessonThree)?.pieces.at(-1)?.text).toMatch(/Gelen Kutusu Sıfırlama/u);
    expect(loadAcademyLessonCues(lessonThree)).toHaveLength(8);
    expect(loadAcademySpokenScriptProse(lessonThree)).toMatch(/Selamlar, ben Gözde/u);
    expect(academyCitizenPlayerLayer(COURSE_SLUG, lessonThree).kind).toBe("article+karaoke");
    const lessonFour = "01_office_ai-4";
    expect(isAcademyLessonAudioSealed(COURSE_SLUG, lessonFour)).toBe(true);
    expect(loadAcademySealedAudioTimings(lessonFour)?.durationSec).toBe(544.52);
    expect(loadAcademySealedAudioTimings(lessonFour)?.cacheV).toBe(544520);
    expect(loadAcademySealedAudioTimings(lessonFour)?.pieces).toHaveLength(14);
    expect(loadAcademySealedAudioTimings(lessonFour)?.pieces[0]?.start).toBe(2);
    expect(loadAcademySealedAudioTimings(lessonFour)?.pieces.at(-1)?.end).toBe(544.52);
    expect(loadAcademySealedAudioTimings(lessonFour)?.pieces.at(-1)?.text).toMatch(/İstisnalar/u);
    expect(loadAcademySealedAudioTimings(lessonFour)?.pieces.at(-1)?.text).toMatch(/Hata Avı/u);
    expect(loadAcademyLessonCues(lessonFour)).toHaveLength(8);
    expect(loadAcademySpokenScriptProse(lessonFour)).toMatch(/Selamlar, ben Gözde/u);
    expect(academyCitizenPlayerLayer(COURSE_SLUG, lessonFour).kind).toBe("article+karaoke");
    const lessonFive = "01_office_ai-5";
    expect(isAcademyLessonAudioSealed(COURSE_SLUG, lessonFive)).toBe(true);
    expect(loadAcademySealedAudioTimings(lessonFive)?.durationSec).toBe(481.96);
    expect(loadAcademySealedAudioTimings(lessonFive)?.cacheV).toBe(481960);
    expect(loadAcademySealedAudioTimings(lessonFive)?.pieces).toHaveLength(14);
    expect(loadAcademySealedAudioTimings(lessonFive)?.pieces[0]?.start).toBe(2);
    expect(loadAcademySealedAudioTimings(lessonFive)?.pieces[1]?.end).toBe(77.8);
    expect(loadAcademySealedAudioTimings(lessonFive)?.pieces.at(-1)?.end).toBe(481.96);
    expect(loadAcademySealedAudioTimings(lessonFive)?.pieces.at(-1)?.text).toMatch(/Haftalık Sistem/u);
    expect(loadAcademySealedAudioTimings(lessonFive)?.pieces.at(-1)?.text).toMatch(/30 Dakika/u);
    expect(loadAcademyLessonCues(lessonFive)).toHaveLength(8);
    expect(loadAcademySpokenScriptProse(lessonFive)).toMatch(/Selamlar, ben Gözde/u);
    expect(academyCitizenPlayerLayer(COURSE_SLUG, lessonFive).kind).toBe("article+karaoke");
    const lessonSix = "01_office_ai-6";
    expect(isAcademyLessonAudioSealed(COURSE_SLUG, lessonSix)).toBe(true);
    expect(loadAcademySealedAudioTimings(lessonSix)?.durationSec).toBe(412.04);
    expect(loadAcademySealedAudioTimings(lessonSix)?.cacheV).toBe(412040);
    expect(loadAcademySealedAudioTimings(lessonSix)?.pieces).toHaveLength(14);
    expect(loadAcademySealedAudioTimings(lessonSix)?.pieces[0]?.start).toBe(2);
    expect(loadAcademySealedAudioTimings(lessonSix)?.pieces.at(-1)?.end).toBe(412.04);
    expect(loadAcademySealedAudioTimings(lessonSix)?.pieces.at(-1)?.text).toMatch(/sınavda görüşmek üzere/u);
    expect(loadAcademySealedAudioTimings(lessonSix)?.pieces.at(-1)?.text).toMatch(/müfredat kapanır/u);
    expect(loadAcademySealedAudioTimings(lessonSix)?.pieces.at(-1)?.text).not.toMatch(/7\. derste/u);
    expect(loadAcademySealedAudioTimings(lessonSix)?.pieces.at(-1)?.text).not.toMatch(/Sınav [Kk]öprüsü/u);
    expect(loadAcademyLessonCues(lessonSix)).toHaveLength(8);
    expect(loadAcademySpokenScriptProse(lessonSix)).toMatch(/Selamlar, ben Gözde/u);
    expect(academyCitizenPlayerLayer(COURSE_SLUG, lessonSix).kind).toBe("article+karaoke");
    expect(existsSync(join(ROOT, "public/media/academy/audio/01_office_ai/01_office_ai-6.mp3"))).toBe(true);
    const lessonG1 = "01_office_ai-g1";
    expect(isAcademyLessonAudioSealed(COURSE_SLUG, lessonG1)).toBe(true);
    expect(loadAcademySealedAudioTimings(lessonG1)?.durationSec).toBe(523.6);
    expect(loadAcademySealedAudioTimings(lessonG1)?.cacheV).toBe(523600);
    expect(loadAcademySealedAudioTimings(lessonG1)?.pieces).toHaveLength(14);
    expect(loadAcademySealedAudioTimings(lessonG1)?.pieces[0]?.start).toBe(2);
    expect(loadAcademySealedAudioTimings(lessonG1)?.pieces.at(-1)?.end).toBe(523.6);
    expect(loadAcademySealedAudioTimings(lessonG1)?.pieces.at(-1)?.text).toMatch(/ataş ile yüklemeyi/u);
    expect(loadAcademyLessonCues(lessonG1)).toHaveLength(8);
    expect(loadAcademySpokenScriptProse(lessonG1)).toMatch(/Selamlar, ben Gözde/u);
    expect(academyCitizenPlayerLayer(COURSE_SLUG, lessonG1).kind).toBe("article+karaoke");
    expect(existsSync(join(ROOT, "public/media/academy/audio/01_office_ai/01_office_ai-g1.mp3"))).toBe(true);
    const lessonW1 = "01_office_ai-w1";
    expect(isAcademyLessonAudioSealed(COURSE_SLUG, lessonW1)).toBe(true);
    expect(loadAcademySealedAudioTimings(lessonW1)?.durationSec).toBe(521.44);
    expect(loadAcademySealedAudioTimings(lessonW1)?.cacheV).toBe(521440);
    expect(loadAcademySealedAudioTimings(lessonW1)?.pieces).toHaveLength(14);
    expect(loadAcademySealedAudioTimings(lessonW1)?.pieces[0]?.start).toBe(2);
    expect(loadAcademySealedAudioTimings(lessonW1)?.pieces.at(-1)?.end).toBe(521.44);
    expect(loadAcademySealedAudioTimings(lessonW1)?.pieces[1]?.text).toMatch(/ataşla yüklersin/u);
    expect(loadAcademySealedAudioTimings(lessonW1)?.pieces[1]?.text).toMatch(/spesifik bir paragraf/u);
    expect(loadAcademySealedAudioTimings(lessonW1)?.pieces[1]?.text).not.toMatch(/öğretilmez/u);
    expect(loadAcademySealedAudioTimings(lessonW1)?.pieces.at(-1)?.text).toMatch(/9\. ders bitince sınav kapısı açılır/u);
    expect(loadAcademySealedAudioTimings(lessonW1)?.pieces.at(-1)?.text).not.toMatch(/Sekiz ders bitti/u);
    expect(loadAcademySealedAudioTimings(lessonW1)?.pieces.at(-1)?.text).not.toMatch(/Sınav kapısı şimdi açılır/u);
    expect(loadAcademyLessonCues(lessonW1)).toHaveLength(8);
    expect(loadAcademySpokenScriptProse(lessonW1)).toMatch(/Selamlar, ben Gözde/u);
    expect(academyCitizenPlayerLayer(COURSE_SLUG, lessonW1).kind).toBe("article+karaoke");
    expect(existsSync(join(ROOT, "public/media/academy/audio/01_office_ai/01_office_ai-w1.mp3"))).toBe(true);
    const lessonK1 = "01_office_ai-k1";
    expect(isAcademyLessonAudioSealed(COURSE_SLUG, lessonK1)).toBe(true);
    expect(loadAcademySealedAudioTimings(lessonK1)?.durationSec).toBe(309.713);
    expect(loadAcademySealedAudioTimings(lessonK1)?.cacheV).toBe(309713);
    expect(loadAcademySealedAudioTimings(lessonK1)?.pieces).toHaveLength(14);
    expect(loadAcademySealedAudioTimings(lessonK1)?.pieces[0]?.start).toBe(2);
    expect(loadAcademySealedAudioTimings(lessonK1)?.pieces.at(-1)?.end).toBe(309.713);
    expect(loadAcademySealedAudioTimings(lessonK1)?.pieces.at(-1)?.text).toMatch(/Bu 2\. dersin/u);
    expect(loadAcademySealedAudioTimings(lessonK1)?.pieces.at(-1)?.text).toMatch(/Sınav henüz kapalıdır/u);
    expect(loadAcademySealedAudioTimings(lessonK1)?.pieces.at(-1)?.text).not.toMatch(/Sekiz ders/u);
    expect(loadAcademyLessonCues(lessonK1)).toHaveLength(8);
    expect(loadAcademySpokenScriptProse(lessonK1)).toMatch(/Selamlar, ben Gözde/u);
    expect(academyCitizenPlayerLayer(COURSE_SLUG, lessonK1).kind).toBe("article+karaoke");
    expect(existsSync(join(ROOT, "public/media/academy/audio/01_office_ai/01_office_ai-k1.mp3"))).toBe(true);
    expect(curriculumForCourseSlug(COURSE_SLUG)).toHaveLength(9);
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
