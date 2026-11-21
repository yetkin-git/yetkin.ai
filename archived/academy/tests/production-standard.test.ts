import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { academyProductionFilePresent } from "@/lib/academy/production-seal-disk";
import {
  ACADEMY_AI_COURSE_DURATION_MIN_MINUTES,
  ACADEMY_AI_LESSON_COUNT_MIN,
  ACADEMY_AI_LESSON_DURATION_MIN_MINUTES,
  ACADEMY_AI_LESSON_DURATION_MIN_SEC,
  ACADEMY_AI_LESSON_SPOKEN_WORD_MIN,
  ACADEMY_MATCH_WHISTLE_MAX,
  ACADEMY_MATCH_WHISTLE_REGULATION_MAX,
  ACADEMY_MATCH_WHISTLE_REGULATION_MIN,
  ACADEMY_MATCH_WHISTLE_RESERVE_MAX,
  ACADEMY_MATCH_WHISTLE_RESERVE_MIN,
  academyCalmSpeechWordsPerMinute,
  academyMatchWhistlePartitionHolds,
  academyMatchWhistlePlan,
  academySpokenMinutesFromWordCount,
  assertAcademyAiLessonCount,
  assertAcademyAiLessonSpokenWordCount,
  assertAcademySectionSpokenScriptSource,
  assertAcademyUtf8SourceBytes,
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
  mergeAcademyProductionSealPaths,
  academyTtsVoiceGenderFromLabel,
  isAcademyAiCourseDurationMinutes,
  isAcademyAiLessonCount,
  isAcademyAiLessonDurationMinutes,
  isAcademyAiLessonDurationSec,
  isAcademyAiLessonSpokenWordCount,
  isAcademyTtsVoiceGender,
} from "@/lib/academy/production-standard";
import { ACADEMY_FIVE_ACT_HEADINGS } from "@/lib/academy/lesson-body";
import {
  academyCatalogPurchasable,
  academyCourseSaleOpen,
  academyOff201VoiceStatus,
} from "@/lib/academy/pilot-sku";
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
  ACADEMY_EC102_COURSE_MASTER_VOICE,
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

  it("600 kelimenin altını ve 6 dersten azını fail-closed keser", () => {
    expect(ACADEMY_AI_LESSON_SPOKEN_WORD_MIN).toBe(600);
    expect(academyCalmSpeechWordsPerMinute()).toBe(
      ACADEMY_AI_LESSON_SPOKEN_WORD_MIN / ACADEMY_AI_LESSON_DURATION_MIN_MINUTES,
    );
    expect(academySpokenMinutesFromWordCount(ACADEMY_AI_LESSON_SPOKEN_WORD_MIN)).toBe(
      ACADEMY_AI_LESSON_DURATION_MIN_MINUTES,
    );
    expect(isAcademyAiLessonSpokenWordCount(ACADEMY_AI_LESSON_SPOKEN_WORD_MIN)).toBe(true);
    expect(isAcademyAiLessonSpokenWordCount(ACADEMY_AI_LESSON_SPOKEN_WORD_MIN - 1)).toBe(false);
    expect(() => assertAcademyAiLessonSpokenWordCount(599, "deneme-ders")).toThrow(/Fail-closed/);
    expect(() => assertAcademyAiLessonSpokenWordCount(600, "deneme-ders")).not.toThrow();
    expect(() => assertAcademyAiLessonCount(5, "deneme-egitim")).toThrow(/Fail-closed/);
    expect(() => assertAcademyAiLessonCount(6, "deneme-egitim")).not.toThrow();
  });

  it("spokenScript 600 kelimenin altını, dolaylı ifadeyi ve bozuk UTF-8'i fail-closed keser", () => {
    const words = Array.from({ length: ACADEMY_AI_LESSON_SPOKEN_WORD_MIN }, () => "ışık").join(" ");
    const source = `const spokenScript = \`\n${words}\n\`;`;
    const bytes = new TextEncoder().encode(source);
    expect(() => assertAcademyUtf8SourceBytes(bytes, "tam")).not.toThrow();
    expect(assertAcademySectionSpokenScriptSource(source, "tam")).toBe(ACADEMY_AI_LESSON_SPOKEN_WORD_MIN);

    const short = "const spokenScript = `bir iki`;";
    expect(() => assertAcademySectionSpokenScriptSource(short, "kisa")).toThrow(/Fail-closed/);
    expect(() => assertAcademySectionSpokenScriptSource("export const section = {};", "yok")).toThrow(
      /spokenScript/,
    );
    const indirect = `const spokenScript = \`\${baslik} ${words}\`;`;
    expect(() => assertAcademySectionSpokenScriptSource(indirect, "dolayli")).toThrow(/dolaylı/);

    expect(() => assertAcademyUtf8SourceBytes(Uint8Array.of(0xef, 0xbb, 0xbf, 0x41), "bom")).toThrow(
      /BOM/,
    );
    expect(() => assertAcademyUtf8SourceBytes(Uint8Array.of(0xff), "bayt")).toThrow(/uyumsuz bayt/);
    expect(() =>
      assertAcademyUtf8SourceBytes(new TextEncoder().encode("yazı \uFFFD"), "bozuk"),
    ).toThrow(/bozuk karakter/);

    const dir = join(ROOT, "lib/academy/curricula/pr-105");
    for (let n = 1; n <= ACADEMY_AI_LESSON_COUNT_MIN; n += 1) {
      const file = join(dir, `section_${n}.ts`);
      const lessonBytes = readFileSync(file);
      expect(() => assertAcademyUtf8SourceBytes(lessonBytes, `section_${n}.ts`)).not.toThrow();
      const lessonSource = new TextDecoder("utf-8", { fatal: true }).decode(lessonBytes);
      expect(
        assertAcademySectionSpokenScriptSource(lessonSource, `section_${n}.ts`),
      ).toBeGreaterThanOrEqual(ACADEMY_AI_LESSON_SPOKEN_WORD_MIN);
    }
  });

  it("disk okuyucusu süreç yuvasında durur; boş yuva satışı kapatır", () => {
    const key = Symbol.for("yetkin.academy.productionDiskProbe");
    registerAcademyProductionDiskProbe(null);
    try {
      const box = (globalThis as typeof globalThis & {
        [key]?: { current: ((relativePath: string) => boolean) | null };
      })[key];
      expect(box?.current).toBeNull();
      expect(academyCourseSaleOpen("01_office_ai")).toBe(false);
    } finally {
      registerAcademyProductionDiskProbe(academyProductionFilePresent);
    }
    expect(academyCourseSaleOpen("01_office_ai")).toBe(true);
  });

  it("ses ağacı yokken mühür anlığı konuşmayı var sayar; sınav dışı kaset false kalır", () => {
    const audioRoot = join(ROOT, "public/media/academy/audio");
    const tree = existsSync(audioRoot);
    registerAcademyProductionDiskProbe(academyProductionFilePresent);
    expect(
      academyProductionFilePresent("public/media/academy/audio/01_office_ai/01_office_ai-4.mp3"),
    ).toBe(false);
    if (!tree) {
      expect(
        academyProductionFilePresent("public/media/academy/audio/01_office_ai/01_office_ai-1.mp3"),
      ).toBe(true);
      expect(academyCourseSaleOpen("01_office_ai")).toBe(true);
    }
  });

  it("üretimde boş yuva mühür anlığını okur ve altı vitrin satışa açılır", () => {
    const env = process.env as { NODE_ENV?: string };
    const previous = env.NODE_ENV;
    registerAcademyProductionDiskProbe(null);
    env.NODE_ENV = "production";
    try {
      for (const slug of [
        "01_office_ai",
        "01_office_ai_ileri",
        "02_ecommerce_ai",
        "03_social_media_ai",
        "04_chatbot_nocode",
        "05_prompt_practice",
      ]) {
        expect(academyCourseSaleOpen(slug), slug).toBe(true);
      }
    } finally {
      env.NODE_ENV = previous;
      registerAcademyProductionDiskProbe(academyProductionFilePresent);
    }
  });

  it("üretimde disk okuyucusu false dese de mühür anlığı altı vitrini satışa açar", () => {
    const env = process.env as { NODE_ENV?: string };
    const previous = env.NODE_ENV;
    const slugs = [
      "01_office_ai",
      "01_office_ai_ileri",
      "02_ecommerce_ai",
      "03_social_media_ai",
      "04_chatbot_nocode",
      "05_prompt_practice",
    ] as const;
    registerAcademyProductionDiskProbe(() => false);
    env.NODE_ENV = "production";
    try {
      for (const slug of slugs) {
        expect(academyCourseSaleOpen(slug), slug).toBe(true);
        expect(
          academyCatalogPurchasable({
            courseSlug: slug,
            catalogRowPresent: true,
            isPublished: true,
          }),
          slug,
        ).toBe(true);
      }
    } finally {
      env.NODE_ENV = previous;
      registerAcademyProductionDiskProbe(academyProductionFilePresent);
    }
  });

  it("derleme, baytı olmayan mühürlü yolu anlıktan düşürmez", () => {
    const voice = "public/media/academy/audio/01_office_ai/01_office_ai-1.mp3";
    const kept = mergeAcademyProductionSealPaths({
      onDisk: ["lib/academy/spoken-scripts/01_office_ai-1.md"],
      previous: [voice],
      required: [voice, "lib/academy/spoken-scripts/01_office_ai-1.md"],
    });
    expect(kept.paths).toEqual([
      "lib/academy/spoken-scripts/01_office_ai-1.md",
      voice,
    ]);
    expect(kept.missingRequired).toEqual([]);
    const dropped = mergeAcademyProductionSealPaths({
      onDisk: ["lib/academy/spoken-scripts/01_office_ai-1.md"],
      previous: [voice],
      required: [voice, "lib/academy/spoken-scripts/01_office_ai-1.md"],
      dropMissing: true,
    });
    expect(dropped.paths).toEqual(["lib/academy/spoken-scripts/01_office_ai-1.md"]);
    expect(dropped.missingRequired).toEqual([voice]);
  });

  it("ısınma MP4 veya müzik BED diskte yoksa mühür fail-closed", () => {
    const onDisk = (relativePath: string): boolean => academyProductionFilePresent(relativePath);
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

  it("Veo bütçe kapısı ve satış ses cümlesi kodda durur", () => {
    const saleOpen = academyCourseSaleOpen("01_office_ai_ileri");
    const voiceStatus = academyOff201VoiceStatus();
    expect(voiceStatus).toContain(saleOpen ? "Satış açıktır." : "Satış kapalıdır.");
    expect(voiceStatus).not.toContain(saleOpen ? "Satış kapalıdır." : "Satış açıktır.");

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
      expect(isAcademyAiLessonDurationSec(timings!.durationSec, lessonKey)).toBe(true);
    }
  });

  it("1 Eğitim Kodu = 1 Ses — aktif kurs dersleri tek courseMasterVoice kullanır", () => {
    const slugs = Object.keys(CURRICULUM_MODULES_BY_SLUG);
    expect(slugs.length).toBeGreaterThan(0);
    const instructors = readFileSync(join(ROOT, "lib", "academy", "instructors.ts"), "utf8");
    expect(instructors).not.toContain("ACADEMY_OFF201_LESSON_TTS_VOICE");
    expect(instructors).toContain("ACADEMY_OFF201_COURSE_MASTER_VOICE");
    for (const slug of slugs) {
      const courseModule = CURRICULUM_MODULES_BY_SLUG[slug];
      expect(courseModule, slug).toBeDefined();
      expect(courseModule!.voiceConfig).not.toHaveProperty("lessonVoices");
      expect(typeof courseModule!.voiceConfig.courseMasterVoice).toBe("string");
      const lessons = CURRICULUM_DRAFTS_BY_SLUG[slug] ?? [];
      const voicesUsed = [
        ...new Set([
          courseModule!.voiceConfig.courseMasterVoice,
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
    expect(ACADEMY_EC102_COURSE_MASTER_VOICE).toBe("Puck");
    expect(CURRICULUM_MODULES_BY_SLUG["02_ecommerce_ai"]!.voiceConfig.courseMasterVoice).toBe(
      "Puck",
    );
    expect(academyCourseMasterVoice("02_ecommerce_ai")).toBe("Puck");
    expect(academyEcommerceBakeVoice()).toBe("Puck");
    expect(academyCourseVoiceSeal("02_ecommerce_ai")).toMatchObject({
      model: academyBakeVoiceModelId(),
      courseMasterVoice: "Puck",
      gender: "male",
    });
    expect(academyInstructorBySlug("02_ecommerce_ai")).toMatchObject({
      name: "Kaan",
      voice: "Puck",
      gender: "erkek",
      greetingLead: "Merhaba, ben Kaan",
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
