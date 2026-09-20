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
  ACADEMY_AI_LESSON_DURATION_MAX_SEC,
  ACADEMY_AI_LESSON_DURATION_MIN_SEC,
  ACADEMY_LESSON_SATURATION_BEATS,
  ACADEMY_OPTIONAL_LEVEL_PACKAGES,
  ACADEMY_SEALED_MEDIA_LAYERS,
  ACADEMY_TTS_VOICE_GENDERS,
  academyLessonSaturationTotalMinutes,
  academyTtsVoiceGenderFromLabel,
  isAcademyAiCourseDurationMinutes,
  isAcademyAiLessonCount,
  isAcademyAiLessonDurationMinutes,
  isAcademyAiLessonDurationSec,
  isAcademyTtsVoiceGender,
} from "@/lib/academy/production-standard";
import { ACADEMY_FIVE_ACT_HEADINGS } from "@/lib/academy/lesson-body";
import { ACADEMY_COURSE_LEVELS } from "@/lib/academy/course-level";
import { LIMITS, SEALED_AUDIO_LIMITS, COMPACT_ARTICLE_GUIDE } from "@/lib/academy/config";
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
import { ACADEMY_EXAM_PASS_SCORE } from "@/lib/academy/exam";
import { ACADEMY_SEALED_AUDIO_DURATION_SEC } from "@/lib/academy/lesson-audio";
import { loadAcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import { curriculumLessonKeysForSlug } from "@/lib/academy/curricula/lesson-index";

const ROOT = process.cwd();

describe("akademi üretim ve doygunluk standardı — PEDAGOJI.md reji", () => {
  it("süre matematiğini, 4 adımlı akışı, zengin medyayı, 3 seviyeyi ve ses seçimini kilitler", () => {
    expect(ACADEMY_AI_COURSE_DURATION_MIN_MINUTES).toBe(45);
    expect(ACADEMY_AI_COURSE_DURATION_MAX_MINUTES).toBe(90);
    expect(ACADEMY_AI_LESSON_COUNT_MIN).toBe(6);
    expect(ACADEMY_AI_LESSON_COUNT_MAX).toBe(12);
    expect(ACADEMY_AI_LESSON_DURATION_MIN_MINUTES).toBe(7);
    expect(ACADEMY_AI_LESSON_DURATION_MAX_MINUTES).toBe(12);
    expect(ACADEMY_AI_LESSON_DURATION_MIN_SEC).toBe(ACADEMY_AI_LESSON_DURATION_MIN_MINUTES * 60);
    expect(ACADEMY_AI_LESSON_DURATION_MAX_SEC).toBe(ACADEMY_AI_LESSON_DURATION_MAX_MINUTES * 60);
    expect(LIMITS).toBe(SEALED_AUDIO_LIMITS);
    expect(LIMITS.minMinutes).toBe(ACADEMY_AI_LESSON_DURATION_MIN_MINUTES);
    expect(LIMITS.maxMinutes).toBe(ACADEMY_AI_LESSON_DURATION_MAX_MINUTES);
    expect(LIMITS.courseMinMinutes).toBe(ACADEMY_AI_COURSE_DURATION_MIN_MINUTES);
    expect(LIMITS.courseMaxMinutes).toBe(ACADEMY_AI_COURSE_DURATION_MAX_MINUTES);
    expect(LIMITS.minWords).toBe(1050);
    expect(LIMITS.maxWords).toBe(1800);
    expect(COMPACT_ARTICLE_GUIDE.minWords).toBe(1050);
    expect(COMPACT_ARTICLE_GUIDE.maxWords).toBe(1800);
    expect(isAcademyAiLessonDurationSec(ACADEMY_AI_LESSON_DURATION_MIN_SEC)).toBe(true);
    expect(isAcademyAiLessonDurationSec(ACADEMY_AI_LESSON_DURATION_MAX_SEC - 1)).toBe(true);
    expect(isAcademyAiLessonDurationSec(ACADEMY_AI_LESSON_DURATION_MIN_SEC - 1)).toBe(false);
    expect(isAcademyAiLessonDurationSec(ACADEMY_AI_LESSON_DURATION_MAX_SEC + 1)).toBe(false);
    expect(isAcademyAiCourseDurationMinutes(ACADEMY_AI_COURSE_DURATION_MIN_MINUTES)).toBe(true);
    expect(isAcademyAiCourseDurationMinutes(ACADEMY_AI_COURSE_DURATION_MAX_MINUTES)).toBe(true);
    expect(isAcademyAiCourseDurationMinutes(ACADEMY_AI_COURSE_DURATION_MIN_MINUTES - 1)).toBe(false);
    expect(isAcademyAiCourseDurationMinutes(ACADEMY_AI_COURSE_DURATION_MAX_MINUTES + 1)).toBe(false);
    expect(isAcademyAiLessonCount(ACADEMY_AI_LESSON_COUNT_MIN)).toBe(true);
    expect(isAcademyAiLessonCount(8)).toBe(true);
    expect(isAcademyAiLessonCount(10)).toBe(true);
    expect(isAcademyAiLessonCount(ACADEMY_AI_LESSON_COUNT_MAX)).toBe(true);
    expect(isAcademyAiLessonCount(ACADEMY_AI_LESSON_COUNT_MIN - 1)).toBe(false);
    expect(isAcademyAiLessonCount(ACADEMY_AI_LESSON_COUNT_MAX + 1)).toBe(false);
    expect(isAcademyAiLessonDurationMinutes(ACADEMY_AI_LESSON_DURATION_MIN_MINUTES)).toBe(true);
    expect(isAcademyAiLessonDurationMinutes(ACADEMY_AI_LESSON_DURATION_MAX_MINUTES)).toBe(true);
    expect(isAcademyAiLessonDurationMinutes(ACADEMY_AI_LESSON_DURATION_MIN_MINUTES - 0.1)).toBe(false);
    expect(isAcademyAiLessonDurationMinutes(ACADEMY_AI_LESSON_DURATION_MAX_MINUTES + 0.1)).toBe(false);

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

    expect(ACADEMY_FIVE_ACT_HEADINGS.warmup).toBe(ACADEMY_LESSON_SATURATION_BEATS[0]!.label);
    expect(ACADEMY_FIVE_ACT_HEADINGS.problem).toBe(ACADEMY_LESSON_SATURATION_BEATS[1]!.label);
    expect(ACADEMY_FIVE_ACT_HEADINGS.development).toBe(ACADEMY_LESSON_SATURATION_BEATS[2]!.label);
    expect(ACADEMY_FIVE_ACT_HEADINGS.conclusion).toBe(ACADEMY_LESSON_SATURATION_BEATS[3]!.label);

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
    expect(ACADEMY_EXAM_PASS_SCORE).toBe(70);
  });

  it("PEDAGOJI.md ilkeleri kilitler; CSS/piksel ve süre sayısı kod SSOT'tadır", () => {
    const pedagogyPath = join(ROOT, ".system_docs", "PEDAGOJI.md");
    expect(existsSync(pedagogyPath)).toBe(true);
    const pedagogy = readFileSync(pedagogyPath, "utf8");
    expect(pedagogy).toContain("Eğitim felsefesi");
    expect(pedagogy).toContain("Garsonu Göster");
    expect(pedagogy).toContain("Nedensellik Reformu");
    expect(pedagogy).toContain("Sebep → Eylem → Sonuç");
    expect(pedagogy).toContain("saniyeler içinde etkileyici");
    expect(pedagogy).toContain("Öğretmen SEN, Belge SIZ");
    expect(pedagogy).toContain("Quiet Luxury");
    expect(pedagogy).toContain("Altyazı Titreme Yasağı");
    expect(pedagogy).toContain("Descender Harf Koruması");
    expect(pedagogy).toContain("16:9 Tuval ve Contain Sözleşmesi");
    expect(pedagogy).toContain("lib/academy/production-standard.ts");
    expect(pedagogy).toContain("ACADEMY_EXAM_PASS_SCORE");
    expect(pedagogy).not.toMatch(/font-weight:\s*inherit/u);
    expect(pedagogy).not.toMatch(/padding-block:/u);
    expect(pedagogy).not.toMatch(/calc\(100dvh/u);
    expect(pedagogy).not.toContain("getBoundingClientRect");
    expect(pedagogy).not.toContain("font-size: clamp");
    expect(pedagogy).not.toContain("min-width: content");
    expect(pedagogy).not.toContain("420 – 720 saniye");
    expect(pedagogy).not.toContain("Baraj 70");
    expect(pedagogy).toContain("EĞİTİM YAPISI VE KAPILAR");
    expect(pedagogy).toContain("Punchcard Rozetleri");
    expect(pedagogy).toContain("Callirrhoe");
    expect(pedagogy).toContain("Ken Burns");
    expect(pedagogy).toContain("### E.4 Bütçe Korumalı B-roll Mimarisi");
    expect(pedagogy).toContain("### E.5 Fırınlama (Bake) Disiplini");
    expect(pedagogy).toContain("### E.6 Dinamik Vektörel Şema ve Mantık Katmanı");
    expect(pedagogy).toContain("### E.7 Nasıl Yapılır?");
    expect(pedagogy).toContain("### E.8 Nereye Yazılacak");
    expect(pedagogy).toContain("### E.9 Altyapı Şeffaflığı");
    expect(pedagogy).toContain("### E.10 Üç Kapı Hiyerarşisi");
    expect(pedagogy).toContain("## F. DOYGUNLUK AKIŞI");
    expect(pedagogy).toContain("Prompt Terminali");
    expect(pedagogy).toContain("Adım 1: İletileri Seç");
    expect(pedagogy).toContain("Sıfır Ekstra API Maliyeti");
    expect(pedagogy).toContain("Warm-up");
    expect(pedagogy).toContain("Command");
    expect(pedagogy).toContain("Comparison");
    expect(pedagogy).toContain("Task");
    expect(pedagogy).toContain("Isınma / İş Problemi");
    expect(pedagogy).toContain("Birinci Senaryo / Temel Yöntem");
    expect(pedagogy).toContain("İkinci Senaryo / İstisna");
    expect(pedagogy).toContain("Özet & Saha Görevi");
    expect(pedagogy).toContain("İzleme anında harici üretici API çağrılmaz.");
    expect(pedagogy).toContain("Temel");
    expect(pedagogy).toContain("Orta");
    expect(pedagogy).toContain("İleri");
    expect(pedagogy).toContain("kadın veya erkek");
    expect(pedagogy).toContain("lib/academy/lesson-beat-visual.ts");
    expect(pedagogy).toContain("lib/kernel/ai/model-roles.ts");
    expect(pedagogy).toContain("Spoiler Yasağı");
    expect(pedagogy).toMatch(/kopyala-yapıştır/iu);
    expect(pedagogy).toContain("Ataş / dosya yükleme");
    expect(pedagogy).toContain("Yerleşik araçlar");
    expect(pedagogy).toContain("Nereye Yükleyeceksin?");
    expect(pedagogy).toContain("taşıma su");
    expect(pedagogy).toContain("01_office_ai-w1");
    expect(pedagogy).toContain("01_office_ai-g1");
    expect(pedagogy).toContain("Gmail + Gemini");
    expect(pedagogy).toContain("doc-upload-gemini");
    expect(pedagogy).toContain("Yerleşik araç eşleşmesi");
    expect(pedagogy).toContain("Outlook → Copilot");
    expect(pedagogy).toContain("Gmail → Gemini");
    expect(pedagogy).toContain("Word/Excel → Doğrudan Dosya Yükleme");
    expect(pedagogy).toContain("Üç Kapı yalnız aktarım yöntemidir");
    expect(pedagogy).toContain("Güvenlik sınıfı ayrı eksendir");
    expect(pedagogy).toContain("Son çare");
    expect(pedagogy).toContain("Harf harf yazma dayatması yoktur");
    expect(pedagogy).toContain("Ders adedi Pedagoji kotası değildir");
    expect(pedagogy).not.toContain("TAŞIMA SU YASAĞI");
    expect(pedagogy).toContain("MASAÜSTÜ DÜRÜSTLÜĞÜ");
    expect(pedagogy).not.toContain("Sıfır Kopyala-Yapıştır");
    expect(pedagogy).toContain("Copilot (1. Kapı)");
    expect(pedagogy).toContain("ChatGPT / Claude");
    expect(pedagogy).toContain("Soyut «AI Masası» paneli **KESİNLİKLE YASAKTIR**");
    expect(pedagogy).toContain("ChatGPT, Claude, Gemini");
    expect(pedagogy).toContain("ÖNCE (DÜZENLEMESİZ)");
    expect(pedagogy).toContain("SONRA (AI İLE)");
    expect(pedagogy).toContain("Düzensiz Tablo");
    expect(pedagogy).toContain("docs/ops/akademi-bake-elkitabi.md");
    expect(pedagogy).toContain("01_office_ai");
    expect(pedagogy).toContain("Çok Yakında / Hazırlanıyor");
    expect(pedagogy).not.toContain("Video katmanı terk edilmiştir");
    expect(pedagogy).not.toContain("Vitrin cümlesi video vaadi taşımaz.");
    expect(pedagogy).not.toContain("gelecek müfredatın anayasa maddesidir");
    expect(readFileSync(join(ROOT, ".system_docs", "README.md"), "utf8")).toContain(
      "Akademi mühürlü yayın **9**",
    );
    expect(readFileSync(join(ROOT, ".system_docs", "README.md"), "utf8")).not.toContain(
      "Akademi mühürlü WAV **18**",
    );

    const constitution = readFileSync(join(ROOT, ".system_docs", "ANAYASA.md"), "utf8");
    expect(constitution).toContain("Yayın = makale + mühürlü karaoke");
    expect(constitution).toContain("sayılar ve müfredat koddadır");
    expect(constitution).not.toContain("Mühürlü ders sayısı depo gerçeğidir: **5**");
    expect(constitution).not.toContain("PEDAGOJI.md` §F");

    const durumPath = join(ROOT, "docs", "ops", "DURUM.md");
    expect(existsSync(durumPath)).toBe(true);
    const durum = readFileSync(join(ROOT, "docs", "DURUM.md"), "utf8");
    expect(durum).toContain("Sınav yolu");
    expect(durum).toContain("Mühürlü kaset");
    expect(durum).toContain("9/9");
    expect(durum).not.toContain("Makale / Okuma Metni");
    expect(durum).toContain("PayTR canlı tanık");
    expect(durum).toContain("P0-1 Canlı Nakit Tanığı Başarıyla Alındı — PayTR CLEARED Teyit Edildi (18 Eylül 2026)");
    expect(durum).not.toContain("Bu kesitte yok");
    const opsDurumSeal = readFileSync(durumPath, "utf8");
    expect(opsDurumSeal).toContain("P0-1 Canlı Nakit Tanığı Başarıyla Alındı — PayTR CLEARED Teyit Edildi (18 Eylül 2026)");
    expect(opsDurumSeal).toContain("Tam mühürlü");
    expect(durum).toContain("MARKETPLACE_SPLIT_LIVE = false");
    expect(durum).toContain("publishFrozenUntilFaz1Close: false");

    const runbook = readFileSync(join(ROOT, ".system_docs", "OPS_RUNBOOK.md"), "utf8");
    expect(runbook).toContain("Akademi mühürlü yayın **9**");
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
    expect(bakeElkitabi).toContain("0.70");
    expect(bakeElkitabi).toContain("skip preventer");
    expect(bakeElkitabi).toContain("veo-3.1-lite-generate-preview");
    expect(bakeElkitabi).toContain("veo-3.1-generate-preview");
    expect(bakeElkitabi).toContain("transform: scale(1.2)");
    expect(bakeElkitabi).toContain("punchcard-from-sealed-json");
    expect(bakeElkitabi).toContain("public/media/academy/micro");
  });

  it("yaşayan kesit süreleri timings SSOT ile birebir eşleşir", () => {
    const opsDurum = readFileSync(join(ROOT, "docs", "ops", "DURUM.md"), "utf8");
    const durum = readFileSync(join(ROOT, "docs", "DURUM.md"), "utf8");
    const keys = curriculumLessonKeysForSlug("01_office_ai");
    expect(keys).toHaveLength(9);
    for (const lessonKey of keys) {
      const timings = loadAcademySealedAudioTimings(lessonKey);
      expect(timings?.durationSec, lessonKey).toBeGreaterThan(0);
      const needle = `**${timings!.durationSec} sn**`;
      expect(opsDurum, lessonKey).toContain(needle);
      expect(durum, lessonKey).toContain(needle);
      const rounded = Math.round(timings!.durationSec);
      expect(ACADEMY_SEALED_AUDIO_DURATION_SEC[lessonKey]).toBe(rounded);
      expect(isAcademyAiLessonDurationSec(timings!.durationSec)).toBe(true);
    }
    expect(opsDurum).toContain("01_office_ai-2");
    expect(durum).toContain("01_office_ai-2");
    expect(opsDurum).toContain("1 → k1 → 2 → 3 → 5 → 4 → g1 → w1 → 6");
    expect(durum).toContain("1 → k1 → 2 → 3 → 5 → 4 → g1 → w1 → 6");
  });
});
