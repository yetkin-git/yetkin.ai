import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACADEMY_AI_COURSE_DURATION_MAX_MINUTES,
  ACADEMY_AI_COURSE_DURATION_MIN_MINUTES,
  ACADEMY_AI_LESSON_COUNT_MAX,
  ACADEMY_AI_LESSON_COUNT_MIN,
  ACADEMY_AI_LESSON_DURATION_MAX_MINUTES,
  ACADEMY_AI_LESSON_DURATION_MIN_MINUTES,
  ACADEMY_LESSON_SATURATION_BEATS,
  ACADEMY_OPTIONAL_LEVEL_PACKAGES,
  ACADEMY_SEALED_MEDIA_LAYERS,
  ACADEMY_TTS_VOICE_GENDERS,
  academyLessonSaturationTotalMinutes,
  academyTtsVoiceGenderFromLabel,
  isAcademyAiCourseDurationMinutes,
  isAcademyAiLessonCount,
  isAcademyAiLessonDurationMinutes,
  isAcademyTtsVoiceGender,
} from "@/lib/academy/production-standard";
import { ACADEMY_FIVE_ACT_HEADINGS } from "@/lib/academy/lesson-body";
import { ACADEMY_COURSE_LEVELS } from "@/lib/academy/course-level";
import {
  ACADEMY_DEFAULT_INSTRUCTOR_VOICE_BY_GENDER,
  academyBakeVoiceForGenderLabel,
  academyDefaultInstructorVoiceForGender,
} from "@/lib/academy/instructors";
import {
  GEMINI_TTS_DEFAULT_VOICE_BY_GENDER,
  geminiTtsVoiceForGender,
  isGeminiTtsPrebuiltVoice,
} from "@/lib/kernel/ai/tts-voices";

const ROOT = process.cwd();

describe("akademi üretim ve doygunluk standardı — PEDAGOJI.md §F", () => {
  it("süre matematiğini, 4 adımlı akışı, zengin medyayı, 3 seviyeyi ve ses seçimini kilitler", () => {
    expect(ACADEMY_AI_COURSE_DURATION_MIN_MINUTES).toBe(45);
    expect(ACADEMY_AI_COURSE_DURATION_MAX_MINUTES).toBe(90);
    expect(ACADEMY_AI_LESSON_COUNT_MIN).toBe(6);
    expect(ACADEMY_AI_LESSON_COUNT_MAX).toBe(8);
    expect(ACADEMY_AI_LESSON_DURATION_MIN_MINUTES).toBe(7);
    expect(ACADEMY_AI_LESSON_DURATION_MAX_MINUTES).toBe(12);
    expect(isAcademyAiCourseDurationMinutes(45)).toBe(true);
    expect(isAcademyAiCourseDurationMinutes(90)).toBe(true);
    expect(isAcademyAiCourseDurationMinutes(44)).toBe(false);
    expect(isAcademyAiCourseDurationMinutes(91)).toBe(false);
    expect(isAcademyAiLessonCount(6)).toBe(true);
    expect(isAcademyAiLessonCount(8)).toBe(true);
    expect(isAcademyAiLessonCount(5)).toBe(false);
    expect(isAcademyAiLessonCount(9)).toBe(false);
    expect(isAcademyAiLessonDurationMinutes(7)).toBe(true);
    expect(isAcademyAiLessonDurationMinutes(12)).toBe(true);
    expect(isAcademyAiLessonDurationMinutes(6.9)).toBe(false);
    expect(isAcademyAiLessonDurationMinutes(12.1)).toBe(false);

    expect(ACADEMY_LESSON_SATURATION_BEATS).toHaveLength(4);
    expect(ACADEMY_LESSON_SATURATION_BEATS.map((beat) => beat.label)).toEqual([
      "Isınma / İş Problemi",
      "Birinci Senaryo / Temel Yöntem",
      "İkinci Senaryo / İstisna veya Kritik Durum",
      "Özet & Saha Görevi",
    ]);
    expect(ACADEMY_LESSON_SATURATION_BEATS.map((beat) => beat.targetMinutes)).toEqual([1.5, 3.5, 3.5, 1.5]);
    expect(academyLessonSaturationTotalMinutes()).toBe(10);
    expect(isAcademyAiLessonDurationMinutes(academyLessonSaturationTotalMinutes())).toBe(true);

    expect(ACADEMY_FIVE_ACT_HEADINGS.warmup).toBe("Isınma / İş Problemi");
    expect(ACADEMY_FIVE_ACT_HEADINGS.problem).toBe("Birinci Senaryo / Temel Yöntem");
    expect(ACADEMY_FIVE_ACT_HEADINGS.development).toBe("İkinci Senaryo / İstisna veya Kritik Durum");
    expect(ACADEMY_FIVE_ACT_HEADINGS.conclusion).toBe("Özet & Saha Görevi");

    expect([...ACADEMY_SEALED_MEDIA_LAYERS]).toEqual([
      "full_text",
      "timed_cues",
      "diagrams",
      "cinematic_media",
    ]);
    expect([...ACADEMY_OPTIONAL_LEVEL_PACKAGES]).toEqual(["Temel", "Orta", "İleri"]);
    expect([...ACADEMY_COURSE_LEVELS]).toEqual([...ACADEMY_OPTIONAL_LEVEL_PACKAGES]);
    expect([...ACADEMY_TTS_VOICE_GENDERS]).toEqual(["female", "male"]);
    expect(isAcademyTtsVoiceGender("female")).toBe(true);
    expect(isAcademyTtsVoiceGender("male")).toBe(true);
    expect(academyTtsVoiceGenderFromLabel("kadın")).toBe("female");
    expect(academyTtsVoiceGenderFromLabel("erkek")).toBe("male");
    expect(geminiTtsVoiceForGender("female")).toBe("Callirrhoe");
    expect(geminiTtsVoiceForGender("male")).toBe("Fenrir");
    expect(isGeminiTtsPrebuiltVoice(GEMINI_TTS_DEFAULT_VOICE_BY_GENDER.female)).toBe(true);
    expect(isGeminiTtsPrebuiltVoice(GEMINI_TTS_DEFAULT_VOICE_BY_GENDER.male)).toBe(true);
    expect(academyDefaultInstructorVoiceForGender("kadin")).toBe("Callirrhoe");
    expect(academyDefaultInstructorVoiceForGender("erkek")).toBe("Fenrir");
    expect(ACADEMY_DEFAULT_INSTRUCTOR_VOICE_BY_GENDER.kadin).toBe(GEMINI_TTS_DEFAULT_VOICE_BY_GENDER.female);
    expect(ACADEMY_DEFAULT_INSTRUCTOR_VOICE_BY_GENDER.erkek).toBe(GEMINI_TTS_DEFAULT_VOICE_BY_GENDER.male);
    expect(academyBakeVoiceForGenderLabel("female")).toBe("Callirrhoe");
    expect(academyBakeVoiceForGenderLabel("male")).toBe("Fenrir");
  });

  it("PEDAGOJI.md §F ve Anayasa B4 kilit cümlelerini taşır", () => {
    const pedagogyPath = join(ROOT, ".system_docs", "PEDAGOJI.md");
    expect(existsSync(pedagogyPath)).toBe(true);
    const pedagogy = readFileSync(pedagogyPath, "utf8");
    expect(pedagogy).toContain("F. Yapay zekâ eğitimi — üretim ve doygunluk standardı");
    expect(pedagogy).toContain("45–90 dakika");
    expect(pedagogy).toContain("6–8");
    expect(pedagogy).toContain("7–12 dakika");
    expect(pedagogy).toContain("Isınma / İş Problemi");
    expect(pedagogy).toContain("Birinci Senaryo / Temel Yöntem");
    expect(pedagogy).toContain("İkinci Senaryo / İstisna veya Kritik Durum");
    expect(pedagogy).toContain("Özet & Saha Görevi");
    expect(pedagogy).toContain("Tam metin");
    expect(pedagogy).toContain("Zaman senkronlu kayan yazı");
    expect(pedagogy).toContain("İzleme anında harici API **yoktur.**");
    expect(pedagogy).toContain("Temel");
    expect(pedagogy).toContain("Orta");
    expect(pedagogy).toContain("İleri");
    expect(pedagogy).toContain("kadın veya erkek");
    expect(pedagogy).toContain("lib/academy/production-standard.ts");
    expect(pedagogy).toContain("Model skip preventer");
    expect(pedagogy).toContain("F2'ye bas");
    expect(pedagogy).toContain("10–12");
    expect(pedagogy).toContain("6.5 saniye");
    expect(pedagogy).toContain("--dry-run");
    expect(pedagogy).toContain("--confirm-gemini-spend");

    const constitution = readFileSync(join(ROOT, ".system_docs", "ANAYASA.md"), "utf8");
    expect(constitution).toContain("PEDAGOJI.md` §F");
    expect(constitution).toContain("izlemede harici API yoktur");

    const runbook = readFileSync(join(ROOT, ".system_docs", "OPS_RUNBOOK.md"), "utf8");
    expect(runbook).toContain("## 19. Akademi TTS fırınlama SOP");
    expect(runbook).toContain("6500 ms");
    expect(runbook).toContain("expandAcademyTtsSkipPreventer");
  });
});
