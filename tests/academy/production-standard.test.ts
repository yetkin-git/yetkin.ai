import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACADEMY_AI_COURSE_DURATION_MIN_MINUTES,
  ACADEMY_AI_LESSON_COUNT_MIN,
  ACADEMY_AI_LESSON_DURATION_MIN_MINUTES,
  ACADEMY_AI_LESSON_DURATION_MIN_SEC,
  ACADEMY_MATCH_WHISTLE_MAX,
  ACADEMY_MATCH_WHISTLE_REGULATION_MAX,
  ACADEMY_MATCH_WHISTLE_REGULATION_MIN,
  ACADEMY_MATCH_WHISTLE_RESERVE_MAX,
  ACADEMY_MATCH_WHISTLE_RESERVE_MIN,
  academyMatchWhistlePartitionHolds,
  academyMatchWhistlePlan,
  assertAcademyMatchWhistleBudget,
  assertAcademyProductionSeal,
  registerAcademyProductionDiskProbe,
  ACADEMY_LESSON_SATURATION_BEATS,
  ACADEMY_OPTIONAL_LEVEL_PACKAGES,
  ACADEMY_PRODUCTION_MEDIA_LAYERS,
  ACADEMY_QUALITY_GATES,
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
import { academyCourseSaleOpen, academyOff201VoiceStatus } from "@/lib/academy/pilot-sku";
import { ACADEMY_COURSE_LEVELS } from "@/lib/academy/course-level";
import { LIMITS, SEALED_AUDIO_LIMITS, COMPACT_ARTICLE_GUIDE } from "@/lib/academy/config";
import {
  ACADEMY_VEO_BAKE_MODEL,
  ACADEMY_VEO_PREMIUM_MODEL,
  assertAcademyVeoBudgetBakeModel,
  assertAcademyVeoLessonBudget,
  isAcademyVeoPremiumBakeModel,
} from "@/lib/academy/lesson-veo";
import {
  ACADEMY_DEFAULT_INSTRUCTOR_VOICE_BY_GENDER,
  ACADEMY_OFF201_COURSE_MASTER_VOICE,
  academyBakeVoiceForGenderLabel,
  academyCourseMasterVoice,
  academyCourseVoiceSeal,
  academyDefaultInstructorVoiceForGender,
  academyEcommerceBakeVoice,
  academyInstructorBySlug,
  academyInstructorTtsCast,
} from "@/lib/academy/instructors";
import { academyBakeVoiceModelId } from "@/lib/kernel/ai/model-roles";
import {
  GEMINI_TTS_DEFAULT_VOICE_BY_GENDER,
  geminiTtsVoiceForGender,
  isGeminiTtsPrebuiltVoice,
} from "@/lib/kernel/ai/tts-voices";
import { ACADEMY_EXAM_PASS_SCORE } from "@/lib/academy/exam";
import { ACADEMY_TTS_LESSON_REQUEST_MAX, ACADEMY_TTS_LESSON_REQUEST_MIN } from "@/lib/academy/tts-breath-chunks";
import { ACADEMY_SEALED_AUDIO_DURATION_SEC } from "@/lib/academy/lesson-audio";
import { loadAcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import { curriculumLessonKeysForSlug } from "@/lib/academy/curricula/lesson-index";
import { CURRICULUM_DRAFTS_BY_SLUG, CURRICULUM_MODULES_BY_SLUG } from "@/lib/academy/curricula";

const ROOT = process.cwd();

describe("akademi üretim ve doygunluk standardı — PEDAGOJI.md reji", () => {
  it("süre matematiğini, 4 adımlı akışı, zengin medyayı, 3 seviyeyi ve ses seçimini kilitler", () => {
    expect(ACADEMY_AI_COURSE_DURATION_MIN_MINUTES).toBe(45);
    expect(ACADEMY_AI_LESSON_COUNT_MIN).toBe(6);
    expect(ACADEMY_AI_LESSON_DURATION_MIN_MINUTES).toBe(5);
    expect(ACADEMY_AI_LESSON_DURATION_MIN_SEC).toBe(ACADEMY_AI_LESSON_DURATION_MIN_MINUTES * 60);
    expect(LIMITS).toBe(SEALED_AUDIO_LIMITS);
    expect(LIMITS.minMinutes).toBe(ACADEMY_AI_LESSON_DURATION_MIN_MINUTES);
    expect(LIMITS).not.toHaveProperty("maxMinutes");
    expect(LIMITS.courseMinMinutes).toBe(ACADEMY_AI_COURSE_DURATION_MIN_MINUTES);
    expect(LIMITS).not.toHaveProperty("courseMaxMinutes");
    expect(LIMITS.minWords).toBe(1050);
    expect(LIMITS.maxWords).toBe(1800);
    expect(COMPACT_ARTICLE_GUIDE.minWords).toBe(1050);
    expect(COMPACT_ARTICLE_GUIDE.maxWords).toBe(1800);
    expect(isAcademyAiLessonDurationSec(ACADEMY_AI_LESSON_DURATION_MIN_SEC)).toBe(true);
    expect(isAcademyAiLessonDurationSec(18 * 60)).toBe(true);
    expect(isAcademyAiLessonDurationSec(ACADEMY_AI_LESSON_DURATION_MIN_SEC - 1)).toBe(false);
    expect(isAcademyAiCourseDurationMinutes(ACADEMY_AI_COURSE_DURATION_MIN_MINUTES)).toBe(true);
    expect(isAcademyAiCourseDurationMinutes(120)).toBe(true);
    expect(isAcademyAiCourseDurationMinutes(ACADEMY_AI_COURSE_DURATION_MIN_MINUTES - 1)).toBe(false);
    expect(isAcademyAiLessonCount(ACADEMY_AI_LESSON_COUNT_MIN)).toBe(true);
    expect(isAcademyAiLessonCount(8)).toBe(true);
    expect(isAcademyAiLessonCount(10)).toBe(true);
    expect(isAcademyAiLessonCount(12)).toBe(true);
    expect(isAcademyAiLessonCount(ACADEMY_AI_LESSON_COUNT_MIN - 1)).toBe(false);
    expect(isAcademyAiLessonCount(13)).toBe(true);
    expect(isAcademyAiLessonDurationMinutes(ACADEMY_AI_LESSON_DURATION_MIN_MINUTES)).toBe(true);
    expect(isAcademyAiLessonDurationMinutes(18)).toBe(true);
    expect(isAcademyAiLessonDurationMinutes(ACADEMY_AI_LESSON_DURATION_MIN_MINUTES - 0.1)).toBe(false);

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
      "veo_video",
      "lyria_music",
    ]);
    expect([...ACADEMY_PRODUCTION_MEDIA_LAYERS]).toEqual([
      "text",
      "voice",
      "video",
      "visual",
      "music",
    ]);
    expect([...ACADEMY_QUALITY_GATES]).toEqual([
      "draft_script",
      "pedagogy_review",
      "final_layer_check",
    ]);
    expect(() =>
      assertAcademyProductionSeal({
        courseSlug: "01_office_ai",
        lessonKey: "01_office_ai-1",
      }),
    ).not.toThrow();
    for (const lessonNumber of [1, 2, 3, 4, 5, 6]) {
      expect(() =>
        assertAcademyProductionSeal({
          courseSlug: "01_office_ai_ileri",
          lessonKey: `01_office_ai_ileri-${lessonNumber}`,
        }),
      ).not.toThrow();
    }
    expect(() =>
      assertAcademyProductionSeal({
        courseSlug: "01_office_ai",
        lessonKey: "yok-ders",
      }),
    ).toThrow(/Metin/u);
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

  it("ısınma MP4 veya müzik BED diskte yoksa mühür fail-closed", () => {
    const onDisk = (relativePath: string): boolean => {
      const absolute = join(ROOT, relativePath);
      try {
        return existsSync(absolute) && statSync(absolute).size > 0;
      } catch {
        return false;
      }
    };
    registerAcademyProductionDiskProbe((relativePath) =>
      relativePath.endsWith(".bed.mp3") ? false : onDisk(relativePath),
    );
    try {
      expect(() =>
        assertAcademyProductionSeal({
          courseSlug: "01_office_ai",
          lessonKey: "01_office_ai-1",
        }),
      ).toThrow(/Müzik BED/u);
    } finally {
      registerAcademyProductionDiskProbe(onDisk);
    }
    registerAcademyProductionDiskProbe((relativePath) =>
      relativePath.endsWith("-warmup.mp4") ? false : onDisk(relativePath),
    );
    try {
      expect(() =>
        assertAcademyProductionSeal({
          courseSlug: "01_office_ai",
          lessonKey: "01_office_ai-1",
        }),
      ).toThrow(/Isınma MP4/u);
    } finally {
      registerAcademyProductionDiskProbe(onDisk);
    }
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
    expect(pedagogy).toContain("VERİYİ VERMEDEN ÖNCE");
    expect(pedagogy).toContain("Şirket politikası");
    expect(pedagogy).toContain("Veri sınıfı");
    expect(pedagogy).toContain("Aktarım yolu");
    expect(pedagogy).toContain("Punchcard Rozetleri");
    expect(pedagogy).toContain("## B. GOOGLE AI STUDIO FABRİKASI VE ROL DAĞILIMI");
    expect(pedagogy).toContain("model-roles.ts");
    expect(pedagogy).toContain("ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS");
    expect(pedagogy).not.toContain("Gemini 3.8 Flash TTS");
    expect(pedagogy).not.toContain("gemini-3.8-flash-tts");
    expect(pedagogy).not.toContain("atempo=0.93");
    expect(pedagogy).not.toContain("-22 dB");
    expect(pedagogy).toContain("5 medya katmanı");
    expect(pedagogy).toContain("assertAcademyProductionSeal");
    expect(pedagogy).toContain("01_office_ai");
    expect(pedagogy).toContain("1 Eğitim Kodu = 1 Ses");
    expect(pedagogy).not.toContain("1 Maç = 1 Hakem");
    expect(pedagogy).not.toContain("1 Maç = MAX 100 Düdük");
    expect(pedagogy).not.toContain("Yardımcı Hakem Kadrosu");
    expect(pedagogy).not.toContain("FIFA");
    expect(pedagogy).not.toContain("VAR Hakemi");
    expect(pedagogy).toContain("Evrensel Metin Standardı");
    expect(pedagogy).toContain("Çiğ metin fırına atılamaz");
    expect(pedagogy).toContain("ACADEMY_BAKE_ATEMPO");
    expect(pedagogy).not.toContain("0.93");
    expect(pedagogy).toContain("MUSIC_GEN");
    expect(pedagogy).not.toContain("Lyria 3.5");
    expect(pedagogy).toContain("IMAGE_GEN");
    expect(pedagogy).not.toContain("Nano Banana 2");
    expect(pedagogy).toContain("Veo 3.1 Lite");
    expect(pedagogy).toContain("SIRA SENDE");
    expect(pedagogy).toContain("`SIRA SİZDE` bu rozette durmaz");
    expect(pedagogy).toContain("vatandaş dilinde **üç adım**dır");
    expect(pedagogy).toContain("courseMasterVoice");
    expect(pedagogy).not.toContain("ACADEMY_OFF201_LESSON_TTS_VOICE");
    expect(pedagogy).toContain("ACADEMY_SEALED_MEDIA_MODEL");
    expect(pedagogy).not.toContain("Gemini 3.1 Flash TTS");
    expect(pedagogy).toContain("Callirrhoe");
    expect(pedagogy).toContain("yerel `-warmup.mp4`");
    expect(pedagogy).not.toContain("Nano Banana 2 / Veo 3.1 Lite");
    expect(pedagogy).toContain("ACADEMY_BED_BREATH_DB");
    expect(pedagogy).toContain("lib/academy/lesson-bed-duck.ts");
    expect(pedagogy).toContain("Jenerik logo plakası opsiyoneldir");
    expect(pedagogy).toContain("1-2-3 iş özeti");
    expect(pedagogy).not.toContain("0.70");
    expect(pedagogy).toContain("**Altın Şablon görsel reji**");
    expect(pedagogy).toContain("Ken Burns");
    expect(pedagogy).toContain("### E.3 İşitsel Reji ve Outro Crescendo");
    expect(pedagogy).toContain("### E.4 Bütçe Korumalı B-roll Mimarisi");
    expect(pedagogy).not.toContain("## F. DOYGUNLUK AKIŞI");
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
    expect(pedagogy).toContain("taşıma su");
    expect(pedagogy).toContain("**Şirket politikası.**");
    expect(pedagogy).toContain("**Veri sınıfı.**");
    expect(pedagogy).toContain("**Aktarım yolu.**");
    expect(pedagogy).not.toContain("Üç Kapı yalnız aktarım yöntemidir");
    expect(pedagogy).toContain("Son çare");
    expect(pedagogy).toContain("Ders adedi Pedagoji kotası değildir");
    expect(pedagogy).not.toContain("Üst süre tavanı yoktur");
    expect(pedagogy).toContain("TTS bütçe tavanı");
    expect(ACADEMY_MATCH_WHISTLE_MAX).toBe(100);
    expect(ACADEMY_TTS_LESSON_REQUEST_MIN).toBe(10);
    expect(ACADEMY_TTS_LESSON_REQUEST_MAX).toBe(12);
    expect(pedagogy).toContain("bu paragraf o sayıları ikinci kez yazmaz");
    expect(pedagogy).not.toContain("Mühür tabanı 5 dakika ve 6 derstir");
    expect(pedagogy).not.toContain("Çekirdek 9 ders kilitlidir");
    expect(pedagogy).not.toContain("Aptala Anlatır");
    expect(pedagogy).not.toContain("TAŞIMA SU YASAĞI");
    expect(pedagogy).toContain("Masaüstü gerçek dışı vaat etmez");
    expect(pedagogy).not.toContain("Sıfır Kopyala-Yapıştır");
    expect(pedagogy).not.toContain("Copilot (1. Kapı)");
    expect(pedagogy).toContain("Soyut «AI Masası» paneli **KESİNLİKLE YASAKTIR**");
    expect(pedagogy).toContain("ÖNCE (DÜZENLEMESİZ)");
    expect(pedagogy).toContain("SONRA (AI İLE)");
    expect(pedagogy).toContain("Düzensiz Tablo");
    expect(pedagogy).toContain("lib/academy/production-standard.ts");
    expect(pedagogy).not.toContain("docs/ops/akademi-bake-elkitabi.md");
    expect(pedagogy).not.toContain("docs/ops/DURUM.md");
    expect(pedagogy).toContain("01_office_ai");
    expect(pedagogy).toContain("Çok Yakında / Hazırlanıyor");
    expect(pedagogy).not.toContain("Video katmanı terk edilmiştir");
    expect(pedagogy).not.toContain("Vitrin cümlesi video vaadi taşımaz.");
    expect(pedagogy).not.toContain("gelecek müfredatın anayasa maddesidir");
    expect(readFileSync(join(ROOT, ".system_docs", "README.md"), "utf8")).toContain(
      "Akademi mühürlü yayın **8**",
    );
    expect(readFileSync(join(ROOT, ".system_docs", "README.md"), "utf8")).not.toContain(
      "Akademi mühürlü WAV **18**",
    );

    const constitution = readFileSync(join(ROOT, ".system_docs", "ANAYASA.md"), "utf8");
    expect(constitution).toContain("1 Eğitim Kodu = 1 Ses");
    expect(constitution).not.toContain("1 Maç = 1 Hakem");
    expect(constitution).not.toContain("1 Maç = MAX 100 Düdük");
    expect(constitution).not.toContain("FIFA Kokartlı Hakem");
    expect(constitution).not.toContain("1 Maç = En az 6 yarı");
    expect(constitution).not.toContain("1 Yarı = En az 5 dakika");
    expect(constitution).toContain("Gemini 2.5 ve alt modeller yasaktır");
    expect(constitution).toContain("5 medya katmanı zorunluluğu");
    expect(constitution).toContain("ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS");
    expect(constitution).not.toContain("Gemini 3.8 Flash TTS");
    expect(constitution).not.toContain("gemini-3.8-flash-tts");
    expect(constitution).not.toContain("atempo=0.93");
    expect(constitution).not.toContain("-22 dB");
    expect(constitution).toContain("academyCatalogPurchasable");
    expect(constitution).toContain("academyCourseProductionDiskSealed");
    expect(constitution).toContain("beş katmanın tamamı teyit edilmeden `--seal` basılamaz");
    expect(constitution).not.toContain("dört katmanlı eğitim videosudur");
    expect(constitution).not.toContain("eksikleri satışı tek başına kapatmaz");
    expect(constitution).toContain("ACADEMY_AI_LESSON_DURATION_MIN_MINUTES");
    expect(constitution).not.toContain("üst dakika veya üst ders tavanı yoktur");
    expect(constitution).toContain("ACADEMY_MATCH_WHISTLE_MAX");
    expect(constitution).toContain("lib/academy/tts-breath-chunks.ts");
    expect(constitution).not.toContain("kurs başına 100 istek");
    expect(constitution).not.toContain("10–12");
    expect(constitution).not.toContain("Yayın = makale + mühürlü karaoke");
    expect(constitution).toContain("sayılar ve müfredat koddadır");
    expect(constitution).toContain(
      "Süre bantları üretim standardıdır; müfredatın hakkını kesmek için gerekçe gösterilemez.",
    );
    expect(constitution).not.toContain("Mühürlü ders sayısı depo gerçeğidir: **5**");
    expect(constitution).not.toContain("PEDAGOJI.md` §F");

    expect(constitution).toContain("lib/academy/pilot-sku.ts");
    expect(constitution).toContain("lib/academy/curricula/lesson-index.ts");
    expect(constitution).not.toContain("docs/ops/DURUM.md");
    expect(constitution).not.toContain("docs/ops/akademi-bake-elkitabi.md");
    expect(constitution).toContain("Pragmatik Monolit + İnce Sözleşme Paketi + Tek Native İstemci");
    const saleOpen = academyCourseSaleOpen("01_office_ai_ileri");
    const voiceStatus = academyOff201VoiceStatus();
    expect(voiceStatus).toContain(saleOpen ? "Satış açıktır." : "Satış kapalıdır.");
    expect(voiceStatus).not.toContain(saleOpen ? "Satış kapalıdır." : "Satış açıktır.");

    const runbook = readFileSync(join(ROOT, ".system_docs", "OPS_RUNBOOK.md"), "utf8");
    expect(runbook).toContain("Akademi mühürlü yayın **8**");
    expect(runbook).toContain("01_office_ai-1");
    expect(runbook).toContain("ops/ops-db.md");
    const opsDb = readFileSync(join(ROOT, ".system_docs", "ops", "ops-db.md"), "utf8");
    expect(opsDb).toContain("## 19. Akademi TTS bağları");

    expect(ACADEMY_VEO_BAKE_MODEL).toBe("veo-3.1-lite-generate-preview");
    expect(ACADEMY_VEO_PREMIUM_MODEL).toBe("veo-3.1-generate-preview");
    expect(isAcademyVeoPremiumBakeModel(ACADEMY_VEO_BAKE_MODEL)).toBe(false);
    expect(isAcademyVeoPremiumBakeModel(ACADEMY_VEO_PREMIUM_MODEL)).toBe(true);
    expect(() => assertAcademyVeoBudgetBakeModel(ACADEMY_VEO_BAKE_MODEL)).toThrow(/PEDAGOJI §E\.4/u);
    expect(() => assertAcademyVeoBudgetBakeModel(ACADEMY_VEO_PREMIUM_MODEL)).toThrow(/PEDAGOJI §E\.4/u);
    expect(() => assertAcademyVeoLessonBudget({ calls: 0, durationSec: 8 })).not.toThrow();
    expect(() => assertAcademyVeoLessonBudget({ calls: 1, durationSec: 8 })).toThrow(/0 çağrı/u);
    expect(() => assertAcademyVeoLessonBudget({ calls: 0, durationSec: 12 })).toThrow(/6–8/u);

    const veoBake = readFileSync(join(ROOT, "scripts", "generate-academy-lesson-veo.ts"), "utf8");
    expect(veoBake).toContain("assertAcademyVeoApiCancelled");
    expect(veoBake).toContain("reuse");
    expect(veoBake).toContain("--dry-run");
    expect(veoBake).toContain("-warmup.mp4");
    expect(veoBake).toContain("public/media/academy/micro");
    expect(veoBake).not.toContain("generateVideos");
    expect(veoBake).not.toContain("GoogleGenAI");
    expect(veoBake).not.toContain("veo-3.1-generate-preview");
    expect(veoBake).not.toContain("veo-3.1-lite-generate-preview");
    expect(pedagogy).toContain("Otomatik Veo 3.1 API video üretimi maliyet sızıntısı yarattığı için iptal edilmiştir.");
    expect(constitution).toContain("Otomatik Veo 3.1 API video üretimi maliyet sızıntısı yarattığı için iptal edilmiştir.");

    expect(constitution).toContain("lib/academy/production-standard.ts");
    expect(existsSync(join(ROOT, "docs", "ops", "akademi-bake-elkitabi.md"))).toBe(false);
    expect(existsSync(join(ROOT, "docs", "ops", "DURUM.md"))).toBe(false);
  });

  it("yaşayan kesit süreleri timings SSOT ile birebir eşleşir", () => {
    const keys = curriculumLessonKeysForSlug("01_office_ai");
    expect(keys).toHaveLength(8);
    expect(keys.join(" → ")).toBe("01_office_ai-1 → 01_office_ai-k1 → 01_office_ai-2 → 01_office_ai-3 → 01_office_ai-5 → 01_office_ai-g1 → 01_office_ai-w1 → 01_office_ai-6");
    for (const lessonKey of keys) {
      const timings = loadAcademySealedAudioTimings(lessonKey);
      expect(timings?.durationSec, lessonKey).toBeGreaterThan(0);
      const rounded = Math.round(timings!.durationSec);
      expect(ACADEMY_SEALED_AUDIO_DURATION_SEC[lessonKey]).toBe(rounded);
      expect(isAcademyAiLessonDurationSec(timings!.durationSec)).toBe(true);
    }
  });

  it("1 Eğitim Kodu = 1 Ses — aktif kurs dersleri tek courseMasterVoice kullanır", () => {
    const slugs = Object.keys(CURRICULUM_MODULES_BY_SLUG);
    expect(slugs.length).toBeGreaterThan(0);
    const instructors = readFileSync(join(ROOT, "lib", "academy", "instructors.ts"), "utf8");
    expect(instructors).not.toContain("ACADEMY_OFF201_LESSON_TTS_VOICE");
    expect(instructors).toContain("ACADEMY_OFF201_COURSE_MASTER_VOICE");
    for (const slug of slugs) {
      const module = CURRICULUM_MODULES_BY_SLUG[slug];
      expect(module, slug).toBeDefined();
      expect(module!.voiceConfig).not.toHaveProperty("lessonVoices");
      expect(typeof module!.voiceConfig.courseMasterVoice).toBe("string");
      const lessons = CURRICULUM_DRAFTS_BY_SLUG[slug] ?? [];
      const voicesUsed = [
        ...new Set([
          module!.voiceConfig.courseMasterVoice,
          academyCourseMasterVoice(slug),
          ...lessons.map(() => academyInstructorTtsCast(slug).voice),
        ]),
      ];
      expect(voicesUsed.length).toBe(1);
    }
    expect(CURRICULUM_MODULES_BY_SLUG["01_office_ai"]!.voiceConfig.courseMasterVoice).toBe(
      "Callirrhoe",
    );
    expect(academyCourseMasterVoice("01_office_ai")).toBe("Callirrhoe");
    expect(CURRICULUM_MODULES_BY_SLUG["01_office_ai_ileri"]!.voiceConfig.courseMasterVoice).toBe(
      "Kore",
    );
    expect(CURRICULUM_MODULES_BY_SLUG["01_office_ai_ileri"]!.voiceConfig.courseMasterVoice).not.toBe(
      "Callirrhoe",
    );
    expect(ACADEMY_OFF201_COURSE_MASTER_VOICE).toBe("Kore");
    expect(academyCourseMasterVoice("01_office_ai_ileri")).toBe("Kore");
    expect(academyCourseMasterVoice("01_office_ai_ileri")).not.toBe("Callirrhoe");
    expect(CURRICULUM_MODULES_BY_SLUG["02_ecommerce_ai"]!.voiceConfig.courseMasterVoice).toBe(
      "Aoede",
    );
    expect(academyCourseMasterVoice("02_ecommerce_ai")).toBe("Aoede");
    expect(academyEcommerceBakeVoice()).toBe("Aoede");
    expect(academyCourseVoiceSeal("02_ecommerce_ai")).toMatchObject({
      model: academyBakeVoiceModelId(),
      courseMasterVoice: "Aoede",
      gender: "female",
    });
    expect(academyCourseVoiceSeal("01_office_ai")).toMatchObject({
      model: academyBakeVoiceModelId(),
      courseMasterVoice: "Callirrhoe",
      gender: "female",
    });
    expect(academyInstructorBySlug("02_ecommerce_ai").voiceFingerprint.model).toBe(
      academyBakeVoiceModelId(),
    );
    expect(academyBakeVoiceModelId()).toBe("gemini-3.8-flash-tts");
    expect(ACADEMY_MATCH_WHISTLE_MAX).toBe(100);
    expect(ACADEMY_TTS_LESSON_REQUEST_MIN).toBe(10);
    expect(ACADEMY_TTS_LESSON_REQUEST_MAX).toBe(12);
    expect(ACADEMY_MATCH_WHISTLE_REGULATION_MIN).toBe(70);
    expect(ACADEMY_MATCH_WHISTLE_REGULATION_MAX).toBe(80);
    expect(ACADEMY_MATCH_WHISTLE_RESERVE_MIN).toBe(15);
    expect(ACADEMY_MATCH_WHISTLE_RESERVE_MAX).toBe(20);
    const regulationTop = ACADEMY_AI_LESSON_COUNT_MIN * ACADEMY_TTS_LESSON_REQUEST_MAX;
    expect(regulationTop).toBeGreaterThanOrEqual(ACADEMY_MATCH_WHISTLE_REGULATION_MIN);
    expect(regulationTop).toBeLessThanOrEqual(ACADEMY_MATCH_WHISTLE_REGULATION_MAX);
    expect(academyMatchWhistlePlan(regulationTop).inRegulationBand).toBe(true);
    expect(academyMatchWhistlePlan(regulationTop).withinCap).toBe(true);
    expect(academyMatchWhistlePartitionHolds()).toBe(true);
    expect(ACADEMY_MATCH_WHISTLE_MAX - ACADEMY_MATCH_WHISTLE_REGULATION_MAX).toBe(
      ACADEMY_MATCH_WHISTLE_RESERVE_MAX,
    );
    expect(academyMatchWhistlePlan(80).extensionReserve).toBe(ACADEMY_MATCH_WHISTLE_RESERVE_MAX);
    expect(academyMatchWhistlePlan(70).reserveRemaining).toBe(30);
    expect(academyMatchWhistlePlan(70).extensionReserve).toBe(ACADEMY_MATCH_WHISTLE_RESERVE_MAX);
    expect(8 * ACADEMY_TTS_LESSON_REQUEST_MIN).toBe(ACADEMY_MATCH_WHISTLE_REGULATION_MAX);
    expect(() => assertAcademyMatchWhistleBudget(ACADEMY_MATCH_WHISTLE_MAX)).not.toThrow();
    expect(() => assertAcademyMatchWhistleBudget(ACADEMY_MATCH_WHISTLE_MAX + 1)).toThrow(
      /1 Maç = MAX 100 Düdük/u,
    );
    expect(ACADEMY_TTS_LESSON_REQUEST_MIN).toBe(10);
  });
});
