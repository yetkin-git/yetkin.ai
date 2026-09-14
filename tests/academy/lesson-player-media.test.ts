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
  it("CurriculumModule placeholder video ve demo podcast taşımaz", () => {
    expect(officeAiMasteryModule.videoUrl).toBeUndefined();
    expect(officeAiMasteryModule.audioUrl).toBeUndefined();
    expect(officeAiMasteryModule.sections).toHaveLength(6);
    for (const section of officeAiMasteryModule.sections) {
      expect(section.videoUrl, `section ${section.sectionNumber} videoUrl`).toBeUndefined();
      expect(section.audioUrl, `section ${section.sectionNumber} audioUrl`).toBeUndefined();
    }
  });

  it("01_office_ai tohum dersleri test videosu ve podcast audioUrl basmaz", () => {
    const lessons = curriculumForCourseSlug("01_office_ai");
    expect(lessons).toHaveLength(6);
    for (const lesson of lessons) {
      expect(lesson.videoUrl).toBeUndefined();
      expect(lesson.audioUrl).toBeUndefined();
      expect(academyLessonVideoShouldRender(lesson.videoUrl)).toBe(false);
    }
  });

  it("mühürlü medya oynatıcısı HTMLAudio currentTime saatidir; kelime tahmini ve demo video yok", () => {
    const src = readFileSync(join(ROOT, "components/academy/lesson-media-player.tsx"), "utf8");
    const player = readFileSync(join(ROOT, "components/academy/curriculum-player.tsx"), "utf8");
    expect(src).toContain("audio.currentTime");
    expect(src).toContain('data-academy-clock="currentTime"');
    expect(src).toContain("academyLessonAudioPlaybackSrc");
    expect(src).toContain("academyLessonBedPlaybackSrc");
    expect(src).toContain("academyBedDuckGain");
    expect(src).toContain("academyPlayerClockDurationSec");
    expect(src).not.toContain("buildAcademyDialogueTimeline");
    expect(src).not.toContain("<video");
    expect(src).not.toContain("LessonCinemaEyeLayer");
    expect(player).toContain("academyCitizenPlayerLayer");
    expect(player).not.toContain("<LessonTeleprompter");
    expect(player).toContain('data-academy-directing="punchcard"');
    expect(player).toContain("onSpokenElapsedChange={setMediaElapsed}");
    const nextConfig = readFileSync(join(ROOT, "next.config.ts"), "utf8");
    expect(nextConfig).toContain("audio/mpeg");
    expect(nextConfig).toContain("/media/academy/audio/:path*");
    expect(nextConfig).not.toContain("/academy/demo/office-ai-intro.mp4");
    expect(nextConfig).not.toContain("office-ai-podcast.wav");
    expect(nextConfig).not.toContain('value: "audio/wav"');
    expect(nextConfig).not.toContain('source: "/audio/:path*"');
  });

  it("demo podcast fallback kapalıdır; açık URL yoksa ses bağlanmaz", () => {
    expect(ACADEMY_DEMO_AUDIO_COURSE_SLUG).toBeNull();
    expect(resolveAcademyLessonAudioUrl(undefined, "01_office_ai")).toBeUndefined();
    expect(resolveAcademyLessonAudioUrl(null, "01_office_ai")).toBeUndefined();
    expect(resolveAcademyLessonAudioUrl("   ", "01_office_ai")).toBeUndefined();
    expect(resolveAcademyLessonAudioUrl(undefined, "02_ecommerce_ai")).toBeUndefined();
    expect(resolveAcademyLessonAudioUrl(undefined)).toBeUndefined();
    expect(resolveAcademyLessonAudioUrl("/academy/demo/ozel.wav", "02_ecommerce_ai")).toBe(
      "/academy/demo/ozel.wav",
    );
    expect(existsSync(join(ROOT, "public/academy/demo/office-ai-podcast.wav"))).toBe(true);
    expect(ACADEMY_DEMO_AUDIO_PUBLIC_PATH).toBe("/academy/demo/office-ai-podcast.wav");
  });

  it("Gemini 3.1 TTS yuvası kapalıdır ve çağrı basmaz", () => {
    expect(ACADEMY_GEMINI_TTS_SLOT.enabled).toBe(false);
    expect(ACADEMY_GEMINI_TTS_SLOT.model).toBe("gemini-3.1-tts");
    expect(requestAcademyGeminiTts({ text: "Merhaba", languageCode: "tr-TR" })).toBeNull();
    expect(classifyAcademyLessonVideoSrc(undefined).kind).toBe("none");
    expect(classifyAcademyLessonVideoSrc(ACADEMY_DEMO_VIDEO_PUBLIC_PATH).kind).toBe("file");
    expect(academyLessonVideoShouldRender(undefined)).toBe(false);
    expect(academyLessonVideoShouldRender(ACADEMY_DEMO_VIDEO_PUBLIC_PATH)).toBe(false);
    expect(academyLessonVideoShouldRender("/academy/demo/test-pattern.mp4")).toBe(false);
    expect(academyLessonVideoShouldRender("/academy/demo/real-lesson.mp4")).toBe(true);
  });
});
