import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { ACADEMY_SEALED_AUDIO_DURATION_SEC, academyCourseSealedDurationSec } from "@/lib/academy/lesson-audio";
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
import {
  ACADEMY_AI_COURSE_DURATION_MIN_MINUTES,
} from "@/lib/academy/production-standard";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";

const ROOT = process.cwd();
const LESSON_KEY = "01_office_ai-1";
const COURSE_SLUG = "01_office_ai";

describe("akademi mühürlü ses — 01_office_ai-1 Callirrhoe kaseti", () => {
  it("WAV mührü, cue, timings ve karaoke katmanı açılır", () => {
    expect(ACADEMY_MEDIA_SEALED_AUDIO["01_office_ai"]).toEqual([
      "01_office_ai-1",
      "01_office_ai-2",
      "01_office_ai-3",
      "01_office_ai-5",
      "01_office_ai-6",
      "01_office_ai-g1",
      "01_office_ai-w1",
      "01_office_ai-k1",
    ]);
    expect(academyMediaSealedWavCount()).toBe(14);
    expect(ACADEMY_SEALED_AUDIO_DURATION_SEC).toEqual({
      "01_office_ai-1": 692,
      "01_office_ai-2": 520,
      "01_office_ai-3": 538,
      "01_office_ai-5": 553,
      "01_office_ai-6": 506,
      "01_office_ai-g1": 604,
      "01_office_ai-w1": 583,
      "01_office_ai-k1": 702,
      "01_office_ai_ileri-1": 524,
      "01_office_ai_ileri-2": 617,
      "01_office_ai_ileri-3": 866,
      "01_office_ai_ileri-4": 1080,
      "01_office_ai_ileri-5": 1104,
      "01_office_ai_ileri-6": 755,
    });
    expect(isAcademyLessonAudioSealed(COURSE_SLUG, LESSON_KEY)).toBe(true);
    expect(isAcademyCompactLessonKey(LESSON_KEY)).toBe(true);
    const timings = loadAcademySealedAudioTimings(LESSON_KEY);
    expect(timings?.durationSec).toBe(691.84);
    expect(timings?.cacheV).toBe(691840);
    expect(timings?.pieces).toHaveLength(16);
    expect(timings?.pieces.at(-1)?.text).toMatch(/Hazırsan 2\. derste buluşalım/u);
    expect(timings?.pieces.at(-1)?.text).not.toMatch(/görüşmek üzere/u);
    expect(hasAcademyLessonCues(LESSON_KEY)).toBe(true);
    expect(loadAcademyLessonCues(LESSON_KEY)).toHaveLength(8);
    expect(ACADEMY_SPOKEN_SCRIPT_LESSON_KEYS).toEqual(["01_office_ai-1", "01_office_ai-2", "01_office_ai-3", "01_office_ai-5", "01_office_ai-6", "01_office_ai-g1", "01_office_ai-w1", "01_office_ai-k1"]);
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
    expect(loadAcademySealedAudioTimings(lessonTwo)?.durationSec).toBe(520.08);
    expect(loadAcademySealedAudioTimings(lessonTwo)?.pieces).toHaveLength(14);
    expect(loadAcademyLessonCues(lessonTwo)).toHaveLength(8);
    expect(loadAcademySpokenScriptProse(lessonTwo)).toMatch(/Selamlar, ben Gözde/u);
    expect(academyCitizenPlayerLayer(COURSE_SLUG, lessonTwo).kind).toBe("article+karaoke");
    const lessonThree = "01_office_ai-3";
    expect(isAcademyLessonAudioSealed(COURSE_SLUG, lessonThree)).toBe(true);
    expect(loadAcademySealedAudioTimings(lessonThree)?.durationSec).toBe(537.96);
    expect(loadAcademySealedAudioTimings(lessonThree)?.cacheV).toBe(537960);
    expect(loadAcademySealedAudioTimings(lessonThree)?.pieces).toHaveLength(14);
    expect(loadAcademySealedAudioTimings(lessonThree)?.pieces[0]?.start).toBe(2);
    expect(loadAcademySealedAudioTimings(lessonThree)?.pieces.at(-1)?.end).toBe(537.96);
    expect(loadAcademySealedAudioTimings(lessonThree)?.pieces.at(-1)?.text).toMatch(/E-Posta Akışı/u);
    expect(loadAcademySealedAudioTimings(lessonThree)?.pieces.at(-1)?.text).toMatch(
      /kaynak Excel hücresiyle %100 aynı değilse o slaytı yayınlama/u,
    );
    expect(loadAcademyLessonCues(lessonThree)).toHaveLength(8);
    expect(loadAcademySpokenScriptProse(lessonThree)).toMatch(/Selamlar, ben Gözde/u);
    expect(academyCitizenPlayerLayer(COURSE_SLUG, lessonThree).kind).toBe("article+karaoke");
    const lessonFour = "01_office_ai-4";
    expect(isAcademyLessonAudioSealed(COURSE_SLUG, lessonFour)).toBe(false);
    expect(ACADEMY_SEALED_AUDIO_DURATION_SEC[lessonFour]).toBeUndefined();
    expect(loadAcademySealedAudioTimings(lessonFour)).toBeNull();
    expect(hasAcademyLessonCues(lessonFour)).toBe(false);
    expect(loadAcademySpokenScriptProse(lessonFour)).toBe("");
    expect(existsSync(join(ROOT, "archived/academy/01_office_ai-4/spoken-script.md"))).toBe(true);
    expect(existsSync(join(ROOT, "archived/academy/01_office_ai-4/lesson-audio-timings.json"))).toBe(true);
    expect(existsSync(join(ROOT, "lib/academy/spoken-scripts/01_office_ai-4.md"))).toBe(false);
    expect(academyCitizenPlayerLayer(COURSE_SLUG, lessonFour).kind).toBe("article");
    const lessonFive = "01_office_ai-5";
    expect(isAcademyLessonAudioSealed(COURSE_SLUG, lessonFive)).toBe(true);
    expect(loadAcademySealedAudioTimings(lessonFive)?.durationSec).toBe(553);
    expect(loadAcademySealedAudioTimings(lessonFive)?.cacheV).toBe(553000);
    expect(loadAcademySealedAudioTimings(lessonFive)?.pieces).toHaveLength(14);
    expect(loadAcademySealedAudioTimings(lessonFive)?.pieces[0]?.start).toBe(2);
    expect(loadAcademySealedAudioTimings(lessonFive)?.pieces[1]?.end).toBe(75.24);
    expect(loadAcademySealedAudioTimings(lessonFive)?.pieces.at(-1)?.end).toBe(553);
    expect(loadAcademySealedAudioTimings(lessonFive)?.pieces.at(-1)?.text).toMatch(/e-posta akışıdır/u);
    expect(loadAcademySealedAudioTimings(lessonFive)?.pieces.at(-1)?.text).toMatch(
      /Sayı kilitlenmeden Cuma penceresini açma/u,
    );
    expect(loadAcademyLessonCues(lessonFive)).toHaveLength(8);
    expect(loadAcademySpokenScriptProse(lessonFive)).toMatch(/Selamlar, ben Gözde/u);
    expect(academyCitizenPlayerLayer(COURSE_SLUG, lessonFive).kind).toBe("article+karaoke");
    const lessonSix = "01_office_ai-6";
    expect(isAcademyLessonAudioSealed(COURSE_SLUG, lessonSix)).toBe(true);
    expect(loadAcademySealedAudioTimings(lessonSix)?.durationSec).toBe(506.04);
    expect(loadAcademySealedAudioTimings(lessonSix)?.cacheV).toBe(506040);
    expect(loadAcademySealedAudioTimings(lessonSix)?.pieces).toHaveLength(18);
    expect(loadAcademySealedAudioTimings(lessonSix)?.pieces[0]?.start).toBe(2);
    expect(loadAcademySealedAudioTimings(lessonSix)?.pieces.at(-1)?.end).toBe(506.04);
    expect(loadAcademySealedAudioTimings(lessonSix)?.pieces.at(-1)?.text).toMatch(/sınav kapısı yalnız bu dersten sonra açılır/u);
    expect(loadAcademySealedAudioTimings(lessonSix)?.pieces.at(-1)?.text).toMatch(/Sınav şimdi açıldı/u);
    expect(loadAcademySealedAudioTimings(lessonSix)?.pieces.at(-1)?.text).not.toMatch(/7\. derste/u);
    expect(loadAcademySealedAudioTimings(lessonSix)?.pieces.at(-1)?.text).not.toMatch(/Sınav [Kk]öprüsü/u);
    expect(loadAcademyLessonCues(lessonSix)).toHaveLength(8);
    expect(loadAcademySpokenScriptProse(lessonSix)).toMatch(/Selamlar, ben Gözde/u);
    expect(academyCitizenPlayerLayer(COURSE_SLUG, lessonSix).kind).toBe("article+karaoke");
    expect(existsSync(join(ROOT, "public/media/academy/audio/01_office_ai/01_office_ai-6.mp3"))).toBe(true);
    const lessonG1 = "01_office_ai-g1";
    expect(isAcademyLessonAudioSealed(COURSE_SLUG, lessonG1)).toBe(true);
    expect(loadAcademySealedAudioTimings(lessonG1)?.durationSec).toBe(603.84);
    expect(loadAcademySealedAudioTimings(lessonG1)?.cacheV).toBe(603840);
    expect(loadAcademySealedAudioTimings(lessonG1)?.pieces).toHaveLength(18);
    expect(loadAcademySealedAudioTimings(lessonG1)?.pieces[0]?.start).toBe(2);
    expect(loadAcademySealedAudioTimings(lessonG1)?.pieces.at(-1)?.end).toBe(603.84);
    expect(loadAcademySealedAudioTimings(lessonG1)?.pieces.at(-1)?.text).toMatch(/ataş ile yüklemeyi/u);
    expect(loadAcademyLessonCues(lessonG1)).toHaveLength(8);
    expect(loadAcademySpokenScriptProse(lessonG1)).toMatch(/Selamlar, ben Gözde/u);
    expect(academyCitizenPlayerLayer(COURSE_SLUG, lessonG1).kind).toBe("article+karaoke");
    expect(existsSync(join(ROOT, "public/media/academy/audio/01_office_ai/01_office_ai-g1.mp3"))).toBe(true);
    const lessonW1 = "01_office_ai-w1";
    expect(isAcademyLessonAudioSealed(COURSE_SLUG, lessonW1)).toBe(true);
    expect(loadAcademySealedAudioTimings(lessonW1)?.durationSec).toBe(583.36);
    expect(loadAcademySealedAudioTimings(lessonW1)?.cacheV).toBe(583360);
    expect(loadAcademySealedAudioTimings(lessonW1)?.pieces).toHaveLength(19);
    expect(loadAcademySealedAudioTimings(lessonW1)?.pieces[0]?.start).toBe(2);
    expect(loadAcademySealedAudioTimings(lessonW1)?.pieces.at(-1)?.end).toBe(583.36);
    expect(loadAcademySealedAudioTimings(lessonW1)?.pieces[0]?.text).toMatch(
      /Vörd belgesini şirketin onayladığı sohbete yüklersin/u,
    );
    expect(loadAcademySealedAudioTimings(lessonW1)?.pieces[0]?.text).not.toMatch(/ataşla(?:rsın)?/iu);
    expect(loadAcademySealedAudioTimings(lessonW1)?.pieces[1]?.text).toMatch(/dosyayı doğrudan yüklersin/u);
    expect(loadAcademySealedAudioTimings(lessonW1)?.pieces[1]?.text).toMatch(/belirli bir paragraf/u);
    expect(loadAcademySealedAudioTimings(lessonW1)?.pieces[1]?.text).not.toMatch(/ataşla(?:rsın)?/iu);
    expect(loadAcademySealedAudioTimings(lessonW1)?.pieces[1]?.text).not.toMatch(/öğretilmez/u);
    expect(loadAcademySealedAudioTimings(lessonW1)?.pieces.at(-1)?.text).toMatch(
      /Sınav, 8\. ders bitince açılır/u,
    );
    expect(loadAcademySealedAudioTimings(lessonW1)?.pieces.at(-1)?.text).not.toMatch(/Sekiz ders bitti/u);
    expect(loadAcademySealedAudioTimings(lessonW1)?.pieces.at(-1)?.text).not.toMatch(/Sınav kapısı şimdi açılır/u);
    expect(loadAcademyLessonCues(lessonW1)).toHaveLength(8);
    expect(loadAcademySpokenScriptProse(lessonW1)).toMatch(/Selamlar, ben Gözde/u);
    expect(academyCitizenPlayerLayer(COURSE_SLUG, lessonW1).kind).toBe("article+karaoke");
    expect(existsSync(join(ROOT, "public/media/academy/audio/01_office_ai/01_office_ai-w1.mp3"))).toBe(true);
    const lessonK1 = "01_office_ai-k1";
    expect(isAcademyLessonAudioSealed(COURSE_SLUG, lessonK1)).toBe(true);
    expect(loadAcademySealedAudioTimings(lessonK1)?.durationSec).toBe(702);
    expect(loadAcademySealedAudioTimings(lessonK1)?.cacheV).toBe(702000);
    expect(loadAcademySealedAudioTimings(lessonK1)?.pieces).toHaveLength(15);
    expect(loadAcademySealedAudioTimings(lessonK1)?.pieces[0]?.start).toBe(2);
    expect(loadAcademySealedAudioTimings(lessonK1)?.pieces.at(-1)?.end).toBe(702);
    expect(loadAcademySealedAudioTimings(lessonK1)?.pieces.at(-1)?.text).toMatch(/Sıradaki kapı rapordur/u);
    expect(loadAcademySealedAudioTimings(lessonK1)?.pieces.at(-1)?.text).toMatch(
      /Sınav, 8\. ders bitince açılır/u,
    );
    expect(loadAcademySealedAudioTimings(lessonK1)?.pieces.at(-1)?.text).not.toMatch(/Sekiz ders/u);
    expect(loadAcademyLessonCues(lessonK1)).toHaveLength(8);
    expect(loadAcademySpokenScriptProse(lessonK1)).toMatch(/Selamlar, ben Gözde/u);
    expect(academyCitizenPlayerLayer(COURSE_SLUG, lessonK1).kind).toBe("article+karaoke");
    expect(existsSync(join(ROOT, "public/media/academy/audio/01_office_ai/01_office_ai-k1.mp3"))).toBe(true);
    expect(curriculumForCourseSlug(COURSE_SLUG)).toHaveLength(8);
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

  it("sınav köprüsü amiral 9 derste yasaktır; sözlük sınav kapısıdır", () => {
    for (const lessonKey of ACADEMY_SPOKEN_SCRIPT_LESSON_KEYS) {
      const timingsBlob = (loadAcademySealedAudioTimings(lessonKey)?.pieces ?? [])
        .map((piece) => piece.text)
        .join(" ");
      const cueBlob = loadAcademyLessonCues(lessonKey)
        .flatMap((cue) => cue.paragraphs ?? [])
        .join(" ");
      const blob = `${loadAcademySpokenScriptProse(lessonKey)}\n${timingsBlob}\n${cueBlob}`;
      expect(blob, lessonKey).not.toMatch(/sınav\s+köprüsü/iu);
    }
    for (const lesson of curriculumForCourseSlug(COURSE_SLUG)) {
      expect(lesson.body, lesson.key).not.toMatch(/sınav\s+köprüsü/iu);
    }
  });

  it("mühürlü timings vatandaş dilinde ham xlsx/docx/pptx uzantısı taşımaz", () => {
    for (const lessonKey of ACADEMY_SPOKEN_SCRIPT_LESSON_KEYS) {
      const timingsBlob = (loadAcademySealedAudioTimings(lessonKey)?.pieces ?? [])
        .map((piece) => piece.text)
        .join(" ");
      const cueBlob = loadAcademyLessonCues(lessonKey)
        .flatMap((cue) => cue.paragraphs ?? [])
        .join(" ");
      const spoken = loadAcademySpokenScriptProse(lessonKey);
      expect(timingsBlob, lessonKey).not.toMatch(/\b(?:xlsx|docx|pptx)\b/iu);
      expect(cueBlob, lessonKey).not.toMatch(/\b(?:xlsx|docx|pptx)\b/iu);
      expect(spoken, lessonKey).not.toMatch(/\b(?:xlsx|docx|pptx)\b/iu);
    }
    for (const lesson of curriculumForCourseSlug(COURSE_SLUG)) {
      expect(lesson.body, lesson.key).not.toMatch(/\b(?:xlsx|docx|pptx)\b/iu);
    }
  });

  it("oynatıcı currentTime saatidir; kelime-saati yayın senkronu değildir", () => {
    const player = readFileSync(join(ROOT, "components/academy/lesson-media-player.tsx"), "utf8");
    const layer = readFileSync(join(ROOT, "lib/academy/citizen-player-layer.ts"), "utf8");
    expect(player).toContain("academyLessonAudioPlaybackSrc");
    expect(player).toContain('data-academy-clock="currentTime"');
    expect(player).not.toContain("buildAcademyDialogueTimeline");
    expect(layer).toContain("isAcademyLessonNarrationReady");
    expect(layer).toContain("loadAcademyTeleprompterFlow");
  });

  it("kurs toplamı timings SSOT kilidindedir: 4698.12 sn ±0.01 ve en az 45 dk (Y1)", () => {
    const total = academyCourseSealedDurationSec(COURSE_SLUG);
    expect(Math.abs(total - 4698.12)).toBeLessThanOrEqual(0.01);
    const minutes = total / 60;
    expect(minutes).toBeGreaterThanOrEqual(ACADEMY_AI_COURSE_DURATION_MIN_MINUTES);
    const opsDurum = readFileSync(join(ROOT, "docs", "ops", "DURUM.md"), "utf8");
    const durumPointer = readFileSync(join(ROOT, "docs", "DURUM.md"), "utf8");
    expect(opsDurum).toContain("4698.12 sn");
    expect(durumPointer).not.toContain("4698.12 sn");
  });
});
