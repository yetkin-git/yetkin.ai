import { describe, expect, it } from "vitest";
import {
  OFF_102_EXAM_PASS_SCORE,
  OFF_102_MODULE_CODE_ALTERNATIVE,
  OFF_102_MODULE_CODE_DRAFT,
  OFF_102_PREREQUISITE_LESSON_COUNT,
  OFF_102_PREREQUISITE_SKU_SLUG,
  OFF_102_SKU_SLUG_DRAFT,
  OFF_102_TITLE_DRAFT,
  assertOff102DraftIntegrity,
  off102DraftLessonsFromSatellites,
} from "@/lib/academy/curricula/office_ai";
import { OFFICE_AI_PLANNED_LESSONS } from "@/lib/academy/curricula/office_ai/planned";
import { curriculumLessonKeysForSlug } from "@/lib/academy/curricula/lesson-index";
import { ACADEMY_CANON_SKU_SLUGS } from "@/lib/kernel/catalog-ids";

describe("OFF-102 taslağı — uydu 10/11/12 projeksiyonu (karar öncesi, salt okunur)", () => {
  it("taslak kimlik ve ön koşul kilitlenir", () => {
    expect(OFF_102_SKU_SLUG_DRAFT).toBe("01_office_ai_ileri");
    expect(OFF_102_MODULE_CODE_DRAFT).toBe("OFF-102");
    expect(OFF_102_MODULE_CODE_ALTERNATIVE).toBe("OFF-201");
    expect(OFF_102_TITLE_DRAFT).toMatch(/İleri Ofis/u);
    expect(OFF_102_PREREQUISITE_SKU_SLUG).toBe("01_office_ai");
    expect(OFF_102_PREREQUISITE_LESSON_COUNT).toBe(9);
    expect(OFF_102_EXAM_PASS_SCORE).toBe(70);
  });

  it("üç uydu taslak sırasına projekte olur; planned.ts değişmez", () => {
    const drafts = off102DraftLessonsFromSatellites();
    expect(drafts.map((row) => row.satelliteKey)).toEqual([
      "01_office_ai-10",
      "01_office_ai-11",
      "01_office_ai-12",
    ]);
    expect(drafts.map((row) => row.draftOrder)).toEqual([1, 2, 3]);
    expect(drafts[0]?.title).toMatch(/Takvim/u);
    expect(drafts[1]?.title).toMatch(/Formül/u);
    expect(drafts[2]?.title).toMatch(/PDF/u);
    expect(drafts.map((row) => row.method)).toEqual([
      "copilot-live",
      "direct-file-upload",
      "doc-upload-gemini",
    ]);
    expect(() => assertOff102DraftIntegrity()).not.toThrow();
    expect(OFFICE_AI_PLANNED_LESSONS.filter((row) => row.lane === "satellite")).toHaveLength(3);
  });

  it("taslak kanona ve sınav yoluna girmez", () => {
    expect((ACADEMY_CANON_SKU_SLUGS as readonly string[]).includes(OFF_102_SKU_SLUG_DRAFT)).toBe(
      false,
    );
    expect(curriculumLessonKeysForSlug("01_office_ai")).toHaveLength(9);
    expect(curriculumLessonKeysForSlug(OFF_102_SKU_SLUG_DRAFT)).toEqual([]);
  });
});
