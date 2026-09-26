import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { academyModuleCodeBySlug, groupAcademyCatalogBySeries } from "@/lib/academy/catalog-filter";
import { CURRICULUM_DRAFTS_BY_SLUG } from "@/lib/academy/curricula";
import {
  assertPhase2DraftRegistryAligned,
  PHASE2_CURRICULUM_DRAFTS_BY_SLUG,
} from "@/lib/academy/curricula/phase2-drafts";
import { OFFICE_AI_2_SLUG } from "@/lib/academy/curricula/office_ai_2/planned";
import {
  CURRICULUM_LESSON_COUNT_BY_SLUG,
  CURRICULUM_LESSON_KEYS_BY_SLUG,
  curriculumLessonKeysForSlug,
  PHASE2_DRAFT_LESSON_COUNT_BY_SLUG,
  PHASE2_DRAFT_LESSON_KEYS_BY_SLUG,
  phase2DraftLessonCountForSlug,
  phase2DraftLessonKeysForSlug,
} from "@/lib/academy/curricula/lesson-index";
import { OFF_201_SKU_SLUG } from "@/lib/academy/curricula/office_ai/off-201";
import { assertPhase2ExamInterfacesReadyForText, phase2ExamGaps } from "@/lib/academy/curricula/phase2-exam-readiness";

describe("Faz 2 taslak indeks", () => {
  it("canlı sınav yoluna ve canlı taslak kaydına yazılmaz", () => {
    expect(curriculumLessonKeysForSlug("01_office_ai")).toEqual([
      "01_office_ai-1",
      "01_office_ai-k1",
      "01_office_ai-2",
      "01_office_ai-3",
      "01_office_ai-5",
      "01_office_ai-g1",
      "01_office_ai-w1",
      "01_office_ai-6",
    ]);
    expect(CURRICULUM_LESSON_KEYS_BY_SLUG["01_office_ai_ileri"]).toEqual([
      "01_office_ai_ileri-1",
      "01_office_ai_ileri-2",
      "01_office_ai_ileri-3",
      "01_office_ai_ileri-4",
      "01_office_ai_ileri-5",
      "01_office_ai_ileri-6",
    ]);
    expect(CURRICULUM_LESSON_COUNT_BY_SLUG["01_office_ai_ileri"]).toBe(6);
    expect(CURRICULUM_DRAFTS_BY_SLUG["01_office_ai_ileri"]).toHaveLength(6);
    expect(CURRICULUM_LESSON_KEYS_BY_SLUG["02_business_ai"]).toBeUndefined();
    expect(CURRICULUM_LESSON_KEYS_BY_SLUG.parent_teacher_ai).toBeUndefined();
    expect(CURRICULUM_LESSON_COUNT_BY_SLUG["02_business_ai"]).toBeUndefined();
    expect(CURRICULUM_DRAFTS_BY_SLUG["02_business_ai"]).toBeUndefined();
    expect(CURRICULUM_DRAFTS_BY_SLUG.parent_teacher_ai).toBeUndefined();
    expect(curriculumLessonKeysForSlug("01_office_ai_ileri")).toHaveLength(6);
    expect(curriculumLessonKeysForSlug("02_business_ai")).toEqual([]);
    expect(curriculumLessonKeysForSlug("parent_teacher_ai")).toEqual([]);
  });

  it("gövde anahtarları taslak indeks ve taslak kayıtta aynı sıradadır", () => {
    expect(() => assertPhase2DraftRegistryAligned()).not.toThrow();
    expect(phase2DraftLessonCountForSlug("01_office_ai_ileri")).toBe(0);
    expect(phase2DraftLessonCountForSlug("parent_teacher_ai")).toBe(6);
    expect(PHASE2_DRAFT_LESSON_COUNT_BY_SLUG["01_office_ai_ileri"]).toBeUndefined();
    expect(PHASE2_DRAFT_LESSON_KEYS_BY_SLUG["02_business_ai"]).toBeUndefined();
    expect(Object.keys(PHASE2_DRAFT_LESSON_KEYS_BY_SLUG).sort()).toEqual(
      Object.keys(PHASE2_CURRICULUM_DRAFTS_BY_SLUG).sort(),
    );
    for (const slug of Object.keys(PHASE2_DRAFT_LESSON_KEYS_BY_SLUG)) {
      const keys = phase2DraftLessonKeysForSlug(slug);
      const drafts = PHASE2_CURRICULUM_DRAFTS_BY_SLUG[slug] ?? [];
      expect(drafts.map((draft) => draft.key)).toEqual([...keys]);
      expect(drafts.every((draft) => draft.format === "compact" && draft.intro.trim().length > 0)).toBe(true);
    }
  });

  it("kanonik slug 01_office_ai_ileri ve kart OFF-201; emekli slug e-ticaret rafına düşmez", () => {
    expect(OFF_201_SKU_SLUG).toBe("01_office_ai_ileri");
    expect(OFFICE_AI_2_SLUG).toBe(OFF_201_SKU_SLUG);
    expect(academyModuleCodeBySlug("01_office_ai_ileri")).toBe("OFF-201");
    expect(academyModuleCodeBySlug("02_business_ai")).toBeNull();
    expect(academyModuleCodeBySlug("parent_teacher_ai")).toBeNull();
    expect(PHASE2_DRAFT_LESSON_KEYS_BY_SLUG["01_office_ai_ileri"]).toBeUndefined();
    expect(curriculumLessonKeysForSlug("01_office_ai_ileri")).toEqual([
      "01_office_ai_ileri-1",
      "01_office_ai_ileri-2",
      "01_office_ai_ileri-3",
      "01_office_ai_ileri-4",
      "01_office_ai_ileri-5",
      "01_office_ai_ileri-6",
    ]);
    const shelves = groupAcademyCatalogBySeries([
      { slug: "02_ecommerce_ai" },
      { slug: "02_business_ai" },
      { slug: "01_office_ai_ileri" },
    ]);
    const ecommerce = shelves.find((shelf) => shelf.key === "02_ecommerce_ai" || shelf.key === "02_");
    expect(ecommerce?.courses.map((course) => course.slug)).toEqual(["02_ecommerce_ai"]);
    expect(shelves.some((shelf) => shelf.courses.some((course) => course.slug === "02_business_ai" && shelf.title?.includes("E-Ticaret")))).toBe(false);
    const office = shelves.find((shelf) => shelf.courses.some((course) => course.slug === "01_office_ai_ileri"));
    expect(office?.key).toBe("01_office_ai");
    expect(office?.title).not.toMatch(/E-Ticaret/u);
  });

  it("canlı müfredat modülü taslak gövdeyi import etmez", () => {
    const liveIndex = readFileSync(join(process.cwd(), "lib/academy/curricula/index.ts"), "utf8");
    const curriculum = readFileSync(join(process.cwd(), "lib/academy/curriculum.ts"), "utf8");
    expect(liveIndex).toMatch(/from ["']@\/lib\/academy\/curricula\/office_ai_2/u);
    expect(liveIndex).not.toMatch(/from ["']@\/lib\/academy\/curricula\/parent_teacher_ai/u);
    expect(liveIndex).not.toMatch(/from ["']@\/lib\/academy\/curricula\/phase2-drafts/u);
    expect(liveIndex).not.toContain("assertPhase2DraftRegistryAligned");
    expect(curriculum).not.toMatch(/phase2-drafts/u);
    expect(curriculum).not.toMatch(/office_ai_2/u);
    expect(curriculum).not.toContain("02_business_ai");
  });

  it("OFF-201 sınav havuzu ve mini sınav hazırdır; öğretmen ve veli havuzu boştur", () => {
    expect(() => assertPhase2ExamInterfacesReadyForText()).not.toThrow();
    const gaps = phase2ExamGaps();
    expect(gaps.map((gap) => gap.slug).sort()).toEqual(["parent_teacher_ai"]);
    const parent = gaps.find((gap) => gap.slug === "parent_teacher_ai");
    expect(curriculumLessonKeysForSlug("01_office_ai_ileri")).toHaveLength(6);
    expect(parent?.coursePoolCount).toBe(0);
    expect(parent?.lessonExamKeys).toEqual([]);
    expect(parent?.missingLessonExamKeys.length).toBeGreaterThan(0);
  });
});
