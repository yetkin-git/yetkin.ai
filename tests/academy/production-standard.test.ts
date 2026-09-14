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
import { LIMITS } from "@/lib/academy/config";
import {
  ACADEMY_VEO_BAKE_MODEL,
  ACADEMY_VEO_PREMIUM_MODEL,
  assertAcademyVeoBudgetBakeModel,
  isAcademyVeoPremiumBakeModel,
} from "@/lib/academy/lesson-veo";
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

describe("akademi üretim ve doygunluk standardı — PEDAGOJI.md reji", () => {
  it("süre matematiğini, 4 adımlı akışı, zengin medyayı, 3 seviyeyi ve ses seçimini kilitler", () => {
    expect(ACADEMY_AI_COURSE_DURATION_MIN_MINUTES).toBe(45);
    expect(ACADEMY_AI_COURSE_DURATION_MAX_MINUTES).toBe(90);
    expect(ACADEMY_AI_LESSON_COUNT_MIN).toBe(6);
    expect(ACADEMY_AI_LESSON_COUNT_MAX).toBe(8);
    expect(ACADEMY_AI_LESSON_DURATION_MIN_MINUTES).toBe(7);
    expect(ACADEMY_AI_LESSON_DURATION_MAX_MINUTES).toBe(12);
    expect(LIMITS.minMinutes).toBe(ACADEMY_AI_LESSON_DURATION_MIN_MINUTES);
    expect(LIMITS.maxMinutes).toBe(ACADEMY_AI_LESSON_DURATION_MAX_MINUTES);
    expect(LIMITS.courseMinMinutes).toBe(ACADEMY_AI_COURSE_DURATION_MIN_MINUTES);
    expect(LIMITS.courseMaxMinutes).toBe(ACADEMY_AI_COURSE_DURATION_MAX_MINUTES);
    expect(LIMITS.minWords).toBe(1050);
    expect(LIMITS.maxWords).toBe(1800);
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

  it("PEDAGOJI.md bütünleşik medya reji kilitlerini ve Anayasa B4 bağını taşır", () => {
    const pedagogyPath = join(ROOT, ".system_docs", "PEDAGOJI.md");
    expect(existsSync(pedagogyPath)).toBe(true);
    const pedagogy = readFileSync(pedagogyPath, "utf8");
    expect(pedagogy).toContain("Bütünleşik Medya ve Eğitim Rejisi Standartları");
    expect(pedagogy).toContain("Garsonu Göster");
    expect(pedagogy).toContain("Punchcard Rozetleri");
    expect(pedagogy).toContain("Gemini 3.8 Flash");
    expect(pedagogy).toContain("Gemini 3.1 Flash TTS");
    expect(pedagogy).toContain("Callirrhoe");
    expect(pedagogy).toContain("Nano Banana");
    expect(pedagogy).toContain("Veo 3.1");
    expect(pedagogy).toContain("Veo 3.1 Lite");
    expect(pedagogy).toContain("Nano Banana 2");
    expect(pedagogy).toContain("Ken Burns");
    expect(pedagogy).toContain("public/media/academy/micro");
    expect(pedagogy).toContain("### E.4 Bütçe Korumalı B-roll Mimarisi");
    expect(pedagogy).toContain("### E.5 Fırınlama (Bake) Disiplini");
    expect(pedagogy).toContain("### E.6 Dinamik Vektörel Şema ve Mantık Katmanı");
    expect(pedagogy).toContain("getBoundingClientRect");
    expect(pedagogy).toContain("font-size: clamp(...)");
    expect(pedagogy).toContain("min-width: content");
    expect(pedagogy).toContain("Sıfır Ekstra API Maliyeti");
    expect(pedagogy).toContain("veo-3.1-lite-generate-preview");
    expect(pedagogy).toContain("veo-3.1-generate-preview");
    expect(pedagogy).toContain("--dry-run");
    expect(pedagogy).toContain("Lyria 3.5");
    expect(pedagogy).toContain("Warm-up");
    expect(pedagogy).toContain("Command");
    expect(pedagogy).toContain("Comparison");
    expect(pedagogy).toContain("Task");
    expect(pedagogy).toContain("Isınma / İş Problemi");
    expect(pedagogy).toContain("Birinci Senaryo / Temel Yöntem");
    expect(pedagogy).toContain("İkinci Senaryo / İstisna");
    expect(pedagogy).toContain("Özet & Saha Görevi");
    expect(pedagogy).toContain("5–9 dakika");
    expect(pedagogy).toContain("En az 6 bölüm");
    expect(pedagogy).toContain("İzleme anında harici üretici API çağrılmaz.");
    expect(pedagogy).toContain("Temel");
    expect(pedagogy).toContain("Orta");
    expect(pedagogy).toContain("İleri");
    expect(pedagogy).toContain("kadın veya erkek");
    expect(pedagogy).toContain("lib/academy/production-standard.ts");
    expect(pedagogy).toContain("lib/academy/lesson-beat-visual.ts");
    expect(pedagogy).toContain("Altın Şablon görsel reji");
    expect(pedagogy).toContain("## E. ALTIN ŞABLON STANDARTLARI");
    expect(pedagogy).toContain("Spoiler Yasağı");
    expect(pedagogy).toContain("transform: scale(1.2)");
    expect(pedagogy).toContain("click-ripple");
    expect(pedagogy).toContain("activeCell A1 → B1 → C1");
    expect(pedagogy).toContain("Kopyala-Yapıştır");
    expect(pedagogy).toContain("Ataş İle Yükle");
    expect(pedagogy).toContain("Copilot İle Okut");
    expect(pedagogy).toContain("ChatGPT, Claude, Gemini");
    expect(pedagogy).toContain("0.70");
    expect(pedagogy).toContain("ÖNCE (DÜZENLEMESİZ)");
    expect(pedagogy).toContain("SONRA (AI İLE)");
    expect(pedagogy).toContain("Düzensiz Tablo");
    expect(pedagogy).toContain("skip preventer");
    expect(pedagogy).toContain("--seal");
    expect(pedagogy).toContain("docs/ops/akademi-bake-elkitabi.md");
    expect(pedagogy).toContain("01_office_ai");
    expect(pedagogy).toContain("Çok Yakında / Hazırlanıyor");
    expect(pedagogy).not.toContain("Video katmanı terk edilmiştir");
    expect(pedagogy).not.toContain("Vitrin cümlesi video vaadi taşımaz.");
    expect(readFileSync(join(ROOT, ".system_docs", "README.md"), "utf8")).toContain(
      "Akademi mühürlü yayın **2**",
    );
    expect(readFileSync(join(ROOT, ".system_docs", "README.md"), "utf8")).not.toContain(
      "Akademi mühürlü WAV **18**",
    );

    const constitution = readFileSync(join(ROOT, ".system_docs", "ANAYASA.md"), "utf8");
    expect(constitution).toContain("PEDAGOJI.md` §F");
    expect(constitution).toContain("Yayın = makale + mühürlü karaoke");
    expect(constitution).toContain("01_office_ai-1");

    const runbook = readFileSync(join(ROOT, ".system_docs", "OPS_RUNBOOK.md"), "utf8");
    expect(runbook).toContain("Akademi mühürlü yayın **2**");
    expect(runbook).toContain("01_office_ai-1");
    expect(runbook).toContain("ops/ops-db.md");
    const opsDb = readFileSync(join(ROOT, ".system_docs", "ops", "ops-db.md"), "utf8");
    expect(opsDb).toContain("## 19. Akademi TTS bağları");

    expect(ACADEMY_VEO_BAKE_MODEL).toBe("veo-3.1-lite-generate-preview");
    expect(ACADEMY_VEO_PREMIUM_MODEL).toBe("veo-3.1-generate-preview");
    expect(isAcademyVeoPremiumBakeModel(ACADEMY_VEO_BAKE_MODEL)).toBe(false);
    expect(isAcademyVeoPremiumBakeModel(ACADEMY_VEO_PREMIUM_MODEL)).toBe(true);
    expect(() => assertAcademyVeoBudgetBakeModel(ACADEMY_VEO_BAKE_MODEL)).not.toThrow();
    expect(() => assertAcademyVeoBudgetBakeModel(ACADEMY_VEO_PREMIUM_MODEL)).toThrow(/PEDAGOJI §E\.4/u);

    const veoBake = readFileSync(join(ROOT, "scripts", "generate-academy-lesson-veo.ts"), "utf8");
    expect(veoBake).toContain("assertAcademyVeoBudgetBakeModel");
    expect(veoBake).toContain("reuse");
    expect(veoBake).toContain("--dry-run");
    expect(veoBake).not.toContain("veo-3.1-generate-preview");

    const bakeElkitabi = readFileSync(join(ROOT, "docs", "ops", "akademi-bake-elkitabi.md"), "utf8");
    expect(bakeElkitabi).toContain("Veo 3.1 Lite");
    expect(bakeElkitabi).toContain("--dry-run");
  });
});
