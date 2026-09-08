import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { officeAiMasteryModule } from "@/lib/academy/curricula/office_ai";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import {
  ACADEMY_DEMO_AUDIO_COURSE_SLUG,
  ACADEMY_DEMO_AUDIO_PUBLIC_PATH,
  ACADEMY_DEMO_VIDEO_PUBLIC_PATH,
  academyLessonVideoShouldRender,
  classifyAcademyLessonVideoSrc,
  resolveAcademyLessonAudioUrl,
} from "@/lib/academy/lesson-playback";
import { ACADEMY_GEMINI_TTS_SLOT, requestAcademyGeminiTts } from "@/lib/academy/lesson-tts-slot";

const ROOT = process.cwd();

describe("akademi ders medya hizası — videoUrl / audioUrl", () => {
  it("CurriculumModule placeholder video taşımaz; demo podcast durur", () => {
    expect(officeAiMasteryModule.videoUrl).toBeUndefined();
    expect(officeAiMasteryModule.audioUrl).toBe(ACADEMY_DEMO_AUDIO_PUBLIC_PATH);
    expect(officeAiMasteryModule.sections).toHaveLength(6);
    for (const section of officeAiMasteryModule.sections) {
      expect(section.videoUrl, `section ${section.sectionNumber} videoUrl`).toBeUndefined();
      expect(section.audioUrl, `section ${section.sectionNumber} audioUrl`).toBe(
        ACADEMY_DEMO_AUDIO_PUBLIC_PATH,
      );
    }
  });

  it("01_office_ai tohum dersleri test videosu basmaz; podcast audioUrl durur", () => {
    const lessons = curriculumForCourseSlug("01_office_ai");
    expect(lessons).toHaveLength(6);
    for (const lesson of lessons) {
      expect(lesson.videoUrl).toBeUndefined();
      expect(lesson.audioUrl).toBe(ACADEMY_DEMO_AUDIO_PUBLIC_PATH);
      expect(academyLessonVideoShouldRender(lesson.videoUrl)).toBe(false);
    }
  });

  it("ücretsiz mock ses dosyası public yolda durur", () => {
    expect(existsSync(join(ROOT, "public/academy/demo/office-ai-podcast.wav"))).toBe(true);
    expect(readFileSync(join(ROOT, "public/academy/demo/office-ai-podcast.wav")).subarray(0, 4).toString()).toBe(
      "RIFF",
    );
  });

  it("telifsiz demo MP4 public yolda durur", () => {
    const path = join(ROOT, "public/academy/demo/office-ai-intro.mp4");
    expect(existsSync(path)).toBe(true);
    const buf = readFileSync(path);
    expect(buf.byteLength).toBeGreaterThan(10_000);
    expect(buf.subarray(4, 8).toString()).toBe("ftyp");
  });

  it("mühürlü medya oynatıcısı HTMLAudio currentTime saatidir; kelime tahmini ve demo video yok", () => {
    const src = readFileSync(join(ROOT, "components/academy/lesson-media-player.tsx"), "utf8");
    const player = readFileSync(join(ROOT, "components/academy/curriculum-player.tsx"), "utf8");
    expect(src).toContain("audio.currentTime");
    expect(src).toContain('data-academy-clock="currentTime"');
    expect(src).toContain("academyLessonAudioPlaybackSrc");
    expect(src).toContain("academyPlayerClockDurationSec");
    expect(src).not.toContain("buildAcademyDialogueTimeline");
    expect(src).not.toContain("<video");
    expect(src).not.toContain("LessonCinemaEyeLayer");
    expect(player).toContain("academyCitizenPlayerLayer");
    expect(player).toContain("<LessonTeleprompter");
    expect(player).toContain("onSpokenElapsedChange={setMediaElapsed}");
    expect(readFileSync(join(ROOT, "next.config.ts"), "utf8")).toContain("video/mp4");
    expect(readFileSync(join(ROOT, "next.config.ts"), "utf8")).toContain("/academy/demo/office-ai-intro.mp4");
  });

  it("demo podcast fallback yalnız 01_office_ai'ye kilitlidir; başka SKU'da yanlış ses çalınmaz", () => {
    expect(ACADEMY_DEMO_AUDIO_COURSE_SLUG).toBe("01_office_ai");
    expect(resolveAcademyLessonAudioUrl(undefined, "01_office_ai")).toBe(
      ACADEMY_DEMO_AUDIO_PUBLIC_PATH,
    );
    expect(resolveAcademyLessonAudioUrl(null, "01_office_ai")).toBe(ACADEMY_DEMO_AUDIO_PUBLIC_PATH);
    expect(resolveAcademyLessonAudioUrl("   ", "01_office_ai")).toBe(ACADEMY_DEMO_AUDIO_PUBLIC_PATH);
    expect(resolveAcademyLessonAudioUrl(undefined, "02_ecommerce_ai")).toBeUndefined();
    expect(resolveAcademyLessonAudioUrl(null, "02_ecommerce_ai")).toBeUndefined();
    expect(resolveAcademyLessonAudioUrl(undefined)).toBeUndefined();
    expect(resolveAcademyLessonAudioUrl("/academy/demo/ozel.wav", "02_ecommerce_ai")).toBe(
      "/academy/demo/ozel.wav",
    );
  });

  it("Gemini 3.1 TTS yuvası kapalıdır ve çağrı basmaz", () => {
    expect(ACADEMY_GEMINI_TTS_SLOT.enabled).toBe(false);
    expect(ACADEMY_GEMINI_TTS_SLOT.model).toBe("gemini-3.1-tts");
    expect(
      requestAcademyGeminiTts({ text: "Merhaba", languageCode: "tr-TR" }),
    ).toBeNull();
    expect(classifyAcademyLessonVideoSrc(undefined).kind).toBe("none");
    expect(classifyAcademyLessonVideoSrc(ACADEMY_DEMO_VIDEO_PUBLIC_PATH).kind).toBe("file");
    expect(academyLessonVideoShouldRender(undefined)).toBe(false);
    expect(academyLessonVideoShouldRender(ACADEMY_DEMO_VIDEO_PUBLIC_PATH)).toBe(false);
    expect(academyLessonVideoShouldRender("/academy/demo/test-pattern.mp4")).toBe(false);
    expect(academyLessonVideoShouldRender("/academy/demo/real-lesson.mp4")).toBe(true);
  });
});
