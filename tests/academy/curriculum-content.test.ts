import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACADEMY_COURSE_SEEDS } from "@/lib/academy/seed";
import { ACADEMY_CATALOG_SEEDS } from "@/lib/academy/catalog-seed";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import {
  ACADEMY_COURSE_LEVELS,
  isAcademyCourseLevel,
} from "@/lib/academy/course-level";
import { ACADEMY_TERM } from "@/archived/lib/academy-studio/term-glossary";
import {
  ACADEMY_INSTRUCTORS_BY_VOICE,
  ACADEMY_INSTRUCTOR_TTS_VOICES,
  academyInstructorBySlug,
  ACADEMY_ANNOUNCER,
  ACADEMY_CAST_REGISTRY,
  ACADEMY_MODERATOR,
  ACADEMY_TTS_VOICES,
  ACADEMY_SECURITY_MODERATOR,
  ACADEMY_DIGITAL_SKILLS_MODERATOR,
} from "@/lib/academy/instructors";
import {
  ACADEMY_GROWTH_SKU_SLUGS,
  ACADEMY_PILOT_SKU_LESSON_COUNT,
  ACADEMY_PILOT_SKU_SLUG,
} from "@/lib/academy/pilot-sku";
import { ACADEMY_COURSE_TITLES } from "@/lib/academy/course-titles";
import { ACADEMY_CANON_SKU_SLUGS } from "@/lib/kernel/catalog-ids";

const ROOT = process.cwd();
const CURRICULA_DIR = join(ROOT, "lib", "academy", "curricula");
const MASTERY_DOC = join(ROOT, "docs", "curriculum", "01_office_ai_mastery.md");

const OPERATING_ROOM = /dilek cümlesi|kilitli paket|negatif kısıt|spec ihlali/iu;
const MECHANICAL_LOCK =
  /kilitlemiştik|kilitliyoruz|kilitliyorum|kilitleyeceğiz|kilitleyince|kilitleniyor|kilitlenir|kilitlersin|kilitleme\b|kilitli paket|nasıl kilitleniyor/iu;

describe("03.16 gerçek müfredat gövdesi — amiral compact", () => {
  it("vitrin tohumu ingest edilmiş compact müfredat basar; master doc durur", () => {
    expect(ACADEMY_COURSE_SEEDS.map((row) => row.slug)).toEqual(["01_office_ai", "02_ecommerce_ai", "03_social_media_ai", "04_chatbot_nocode", "05_prompt_practice"]);
    expect(ACADEMY_CATALOG_SEEDS.map((row) => row.slug)).toEqual(["01_office_ai", "02_ecommerce_ai", "03_social_media_ai", "04_chatbot_nocode", "05_prompt_practice"]);
    expect([...ACADEMY_GROWTH_SKU_SLUGS]).toEqual(["01_office_ai", "02_ecommerce_ai", "03_social_media_ai", "04_chatbot_nocode", "05_prompt_practice"]);
    expect(Object.keys(ACADEMY_COURSE_TITLES)).toEqual([...ACADEMY_CANON_SKU_SLUGS]);
    expect(ACADEMY_PILOT_SKU_SLUG).toBeNull();
    expect(ACADEMY_PILOT_SKU_LESSON_COUNT).toBe(0);
    expect(ACADEMY_COURSE_SEEDS.map((row) => row.slug)).toEqual([...ACADEMY_GROWTH_SKU_SLUGS]);
    const lessons = curriculumForCourseSlug("01_office_ai");
    expect(lessons).toHaveLength(6);
    expect(lessons[0]?.key).toBe("01_office_ai-1");
    expect(lessons[0]?.body.length).toBeGreaterThan(200);
    expect(curriculumForCourseSlug("02_ecommerce_ai")).toHaveLength(6);
    expect(curriculumForCourseSlug("03_social_media_ai")).toHaveLength(6);
    expect(curriculumForCourseSlug("04_chatbot_nocode")).toHaveLength(6);
    expect(curriculumForCourseSlug("05_prompt_practice")).toHaveLength(6);
    expect(curriculumForCourseSlug("sample-course")).toEqual([]);
    expect(existsSync(MASTERY_DOC)).toBe(true);
  });

  it("tohum klasörü ve curriculum.ts mock başlık taşımaz", () => {
    const files = readdirSync(CURRICULA_DIR).filter((name) => name.endsWith(".ts"));
    expect(files.sort()).toEqual([
      "index.ts",
      "lesson-index.ts",
      "types.ts",
    ]);
    for (const name of files) {
      const source = readFileSync(join(CURRICULA_DIR, name), "utf8");
      expect(source, name).not.toContain("Tutar nasıl tutulur");
      expect(source, name).not.toContain("Tek nakit defter");
    }
    const sealed = readFileSync(join(ROOT, "lib", "academy", "curriculum.ts"), "utf8");
    expect(sealed).toContain("CURRICULUM_DRAFTS_BY_SLUG");
    expect(sealed).toContain("LESSON_VISUALS");
    expect(sealed).toContain("composePedagogicalLessonBody");
    expect(sealed).not.toContain("@/lib/academy/real-world-pedagogy");
    expect(sealed).not.toContain("@/lib/academy/field-voice");
    expect(sealed).not.toContain("@/lib/academy/sealed-diagrams");
    expect(sealed).not.toContain("@/archived/lib/academy-studio/real-world-pedagogy");
    expect(sealed).not.toContain("@/archived/lib/academy-studio/field-voice");
    expect(sealed).not.toContain("@/archived/lib/academy-studio/sealed-diagrams");
    expect(sealed).not.toContain("Tutar nasıl tutulur");
  });
});

describe("03.19 seviye ve pedagoji", () => {
  it("seviye etiketi serbesttir; amiral tohum Temel taşır", () => {
    expect(ACADEMY_COURSE_LEVELS).toEqual(["Temel", "Orta", "İleri"]);
    expect(ACADEMY_COURSE_SEEDS).toHaveLength(5);
    expect(ACADEMY_COURSE_SEEDS[0]?.level).toBe("Temel");
    for (const row of ACADEMY_COURSE_SEEDS) {
      expect(isAcademyCourseLevel(row.level), row.slug).toBe(true);
    }
    expect(readFileSync(join(ROOT, "lib", "academy", "course-level.ts"), "utf8")).toContain(
      "resolveAcademySeedMoney",
    );
    expect(readFileSync(join(ROOT, "lib", "academy", "schemas.ts"), "utf8")).toContain(
      "level: z.string().trim().min(1).max(64).optional()",
    );
  });
});

describe("03.20 insani diyalog ve terim parantezleri", () => {
  it("kanonik terimler parantezli Türkçe taşır; TTS uzman yönergesi durur", () => {
    expect(ACADEMY_TERM.RELEASE).toContain("Hak Devri");
    expect(ACADEMY_TERM.UNSET).toContain("Henüz Tanımlanmamış");
    expect(ACADEMY_TERM.DOD).toContain("Kabul Kriteri");
    expect(ACADEMY_TERM.FAIL_SAFE).toContain("Hata Anında Emniyet");
    for (const value of Object.values(ACADEMY_TERM)) {
      expect(value).toMatch(/^.+ \(.+\)$/u);
    }
    const listen = readFileSync(join(ROOT, "archived", "lib", "academy-studio", "lesson-listen.ts"), "utf8");
    expect(listen).toContain("nefes molası");
    expect(listen).toContain("samimi bir uzman");
    expect(listen).toContain("{instructorName}");
    expect(listen).toContain("çayını yudumlarken");
    expect(listen).toContain("üç noktalarda");
    expect(curriculumForCourseSlug("01_office_ai").length).toBe(6);
  });
});

describe("03.22 tek ses tek isim", () => {
  it("sekiz TTS kodu sekiz Türkçe isme mühürlüdür; ikinci isim yok", () => {
    expect(ACADEMY_INSTRUCTOR_TTS_VOICES).toEqual([
      "Zephyr",
      "Erinome",
      "Puck",
      "Fenrir",
      "Aoede",
      "Leda",
      "Callirrhoe",
      "Kore",
    ]);
    expect(ACADEMY_TTS_VOICES).toEqual([
      "Zephyr",
      "Erinome",
      "Puck",
      "Fenrir",
      "Aoede",
      "Leda",
      "Callirrhoe",
      "Kore",
      "Charon",
      "Enceladus",
      "Iapetus",
      "Orus",
    ]);
    expect(ACADEMY_INSTRUCTORS_BY_VOICE.Zephyr.name).toBe("Deniz");
    expect(ACADEMY_INSTRUCTORS_BY_VOICE.Erinome.name).toBe("Maya");
    expect(ACADEMY_INSTRUCTORS_BY_VOICE.Puck.name).toBe("Kaan");
    expect(ACADEMY_INSTRUCTORS_BY_VOICE.Fenrir.name).toBe("Boran");
    expect(ACADEMY_INSTRUCTORS_BY_VOICE.Aoede.name).toBe("Selin");
    expect(ACADEMY_INSTRUCTORS_BY_VOICE.Leda.name).toBe("Ece");
    expect(ACADEMY_INSTRUCTORS_BY_VOICE.Callirrhoe.name).toBe("Gözde");
    expect(ACADEMY_INSTRUCTORS_BY_VOICE.Kore.name).toBe("Aylin");
    const names = ACADEMY_INSTRUCTOR_TTS_VOICES.map(
      (voice) => ACADEMY_INSTRUCTORS_BY_VOICE[voice].name,
    );
    expect(new Set(names).size).toBe(8);
    for (const voice of ACADEMY_INSTRUCTOR_TTS_VOICES) {
      expect(ACADEMY_INSTRUCTORS_BY_VOICE[voice].voice).toBe(voice);
    }
    const fingerprints = ACADEMY_CAST_REGISTRY.map((binding) =>
      JSON.stringify(binding.voiceFingerprint),
    );
    expect(new Set(fingerprints).size).toBe(ACADEMY_CAST_REGISTRY.length);
    expect(ACADEMY_TTS_VOICES).toContain(ACADEMY_ANNOUNCER.voice);
  });

  it("kast ve moderatör mühürü durur; amiral compact müfredat gövdesi vardır", () => {
    expect(ACADEMY_COURSE_SEEDS.map((row) => row.slug)).toEqual([...ACADEMY_GROWTH_SKU_SLUGS]);
    expect(ACADEMY_MODERATOR.name).toBe("Koray");
    expect(ACADEMY_MODERATOR.voice).toBe("Charon");
    expect(ACADEMY_SECURITY_MODERATOR.name).toBe("Can");
    expect(ACADEMY_SECURITY_MODERATOR.voice).toBe("Enceladus");
    expect(ACADEMY_SECURITY_MODERATOR.speechRate).toBe(1);
    expect(ACADEMY_DIGITAL_SKILLS_MODERATOR.name).toBe("Tarık");
    expect(ACADEMY_DIGITAL_SKILLS_MODERATOR.voice).toBe("Iapetus");
    expect(ACADEMY_DIGITAL_SKILLS_MODERATOR.speechRate).toBe(1);
    expect(academyInstructorBySlug("02_ecommerce_ai").name).toBe("Aylin");
    expect(academyInstructorBySlug("02_ecommerce_ai").voice).toBe("Kore");
    expect(academyInstructorBySlug("01_office_ai").name).toBe("Gözde");
    expect(academyInstructorBySlug("03_social_media_ai").name).toBe("Deniz");
    expect(academyInstructorBySlug("03_social_media_ai").voice).toBe("Zephyr");
    expect(academyInstructorBySlug("04_chatbot_nocode").name).toBe("Kaan");
    expect(academyInstructorBySlug("04_chatbot_nocode").voice).toBe("Puck");
    expect(ACADEMY_CAST_REGISTRY.find((row) => row.canonicalCharacterName === "Aylin")?.speechRate).toBe(
      0.93,
    );
    expect(ACADEMY_CAST_REGISTRY.find((row) => row.canonicalCharacterName === "Gözde")?.speechRate).toBe(
      0.93,
    );
    expect(ACADEMY_CAST_REGISTRY.find((row) => row.canonicalCharacterName === "Tarık")?.speechRate).toBe(
      1,
    );
    expect(ACADEMY_ANNOUNCER.voice).toBe("Orus");
    expect(ACADEMY_MODERATOR.role).toBe("Stüdyo Sunucusu / Moderatör");
    expect(ACADEMY_CAST_REGISTRY.find((row) => row.canonicalCharacterName === "Maya")?.speechRate).toBe(
      0.93,
    );
    expect(ACADEMY_CAST_REGISTRY.find((row) => row.canonicalCharacterName === "Koray")?.speechRate).toBe(
      1,
    );
    expect(ACADEMY_CAST_REGISTRY.find((row) => row.canonicalCharacterName === "Ece")?.speechRate).toBe(
      0.93,
    );
    expect(ACADEMY_CAST_REGISTRY.find((row) => row.canonicalCharacterName === "Can")?.speechRate).toBe(
      1,
    );
    expect(curriculumForCourseSlug("01_office_ai").length).toBe(6);
  });
});

describe("03.28 hedef kitle pusulası ve saha dili", () => {
  it("müfredat gövdesi pusula fabrikasını import etmez; iğne field-voice dosyasında durur", () => {
    const sealed = readFileSync(join(ROOT, "lib", "academy", "curriculum.ts"), "utf8");
    expect(sealed).not.toContain("@/lib/academy/field-voice");
    expect(sealed).not.toContain("@/archived/lib/academy-studio/field-voice");
    expect(sealed).not.toContain("academyAudienceCompassForLesson");
    expect(readFileSync(join(ROOT, "archived", "lib", "academy-studio", "field-voice.ts"), "utf8")).toContain(
      "ACADEMY_COMPASS_ANCHOR",
    );
    expect(curriculumForCourseSlug("01_office_ai").length).toBe(6);
  });

  it("tohum ve stüdyo kaynakları ameliyathane kalıbı taşımaz", () => {
    const files = readdirSync(CURRICULA_DIR).filter((name) => name.endsWith(".ts"));
    for (const name of files) {
      const source = readFileSync(join(CURRICULA_DIR, name), "utf8");
      expect(source, name).not.toMatch(OPERATING_ROOM);
    }
    expect(readFileSync(join(ROOT, "lib", "academy", "instructors.ts"), "utf8")).not.toMatch(
      OPERATING_ROOM,
    );
    expect(readFileSync(join(ROOT, "archived", "lib", "academy-studio", "field-voice.ts"), "utf8")).not.toMatch(
      OPERATING_ROOM,
    );
    expect(readFileSync(join(ROOT, "lib", "academy", "curriculum.ts"), "utf8")).not.toMatch(
      OPERATING_ROOM,
    );
    expect(readFileSync(join(ROOT, "lib", "academy", "lesson-practice.ts"), "utf8")).not.toMatch(
      OPERATING_ROOM,
    );
    expect(readFileSync(join(ROOT, "lib", "academy", "exam-pools.ts"), "utf8")).not.toMatch(
      OPERATING_ROOM,
    );
    expect(readFileSync(join(ROOT, "lib", "academy", "seed.ts"), "utf8")).not.toMatch(OPERATING_ROOM);
  });
});

describe("03.30 doğal dil temizliği", () => {
  it("stüdyo ve tohum kaynakları kilitlemiştik / kilitliyoruz taşımaz", () => {
    const files = [
      "lib/academy/instructors.ts",
      "archived/lib/academy-studio/mentor-voice.ts",
      "archived/lib/academy-studio/field-voice.ts",
      "lib/academy/lesson-practice.ts",
      "lib/academy/exam-pools.ts",
      "lib/academy/curriculum.ts",
    ];
    for (const relative of files) {
      const source = readFileSync(join(ROOT, relative), "utf8");
      expect(source, relative).not.toMatch(MECHANICAL_LOCK);
    }
    const curricula = readdirSync(CURRICULA_DIR).filter((name) => name.endsWith(".ts"));
    for (const name of curricula) {
      const source = readFileSync(join(CURRICULA_DIR, name), "utf8");
      expect(source, name).not.toMatch(MECHANICAL_LOCK);
    }
  });

  it("yayınlı compact müfredat gövdesi vardır; diyalog SKU yoktur", () => {
    expect(ACADEMY_COURSE_SEEDS.map((row) => row.slug)).toEqual(["01_office_ai", "02_ecommerce_ai", "03_social_media_ai", "04_chatbot_nocode", "05_prompt_practice"]);
    expect(curriculumForCourseSlug("01_office_ai")).toHaveLength(6);
    for (const row of ACADEMY_COURSE_SEEDS) {
      expect(curriculumForCourseSlug(row.slug).length).toBeGreaterThan(0);
    }
  });
});
