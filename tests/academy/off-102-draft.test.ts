import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  OFF_102_EXAM_PASS_SCORE,
  OFF_102_MODULE_CODE_ALTERNATIVE,
  OFF_102_MODULE_CODE_DRAFT,
  OFF_102_MODULE_CODE_RETIRED,
  OFF_102_PREREQUISITE_LESSON_COUNT,
  OFF_102_PREREQUISITE_SKU_SLUG,
  OFF_102_SKU_SLUG_DRAFT,
  OFF_102_TITLE_DRAFT,
  OFF_201_ECOMMERCE_COLLISION_CODE,
  OFF_201_MODULE_CODE,
  OFF_201_SATELLITE_KEYS,
  OFF_201_SKU_SLUG_DRAFT,
  OFF_201_TITLE_DRAFT,
  assertOff201DraftIntegrity,
  off201DraftLessonsFromSatellites,
} from "@/lib/academy/curricula/office_ai";
import { OFFICE_AI_PLANNED_LESSONS } from "@/lib/academy/curricula/office_ai/planned";
import { curriculumLessonKeysForSlug } from "@/lib/academy/curricula/lesson-index";
import { ACADEMY_CANON_SKU_SLUGS, ACADEMY_NEED_SKU_CODES } from "@/lib/kernel/catalog-ids";
import {
  ACADEMY_MODULE_LEVEL_SPOKEN,
  academyModuleCodeBySlug,
  academySpokenModuleCode,
} from "@/lib/academy/catalog-filter";

describe("OFF-201 taslağı — uydu 10/11/12 projeksiyonu (kart kodu kilitli, salt okunur)", () => {
  it("yayın kart kodu OFF-201 kilitlenir; OFF-102 emekli; EC-102 ile çakışmaz", () => {
    expect(OFF_201_SKU_SLUG_DRAFT).toBe("01_office_ai_ileri");
    expect(OFF_102_SKU_SLUG_DRAFT).toBe(OFF_201_SKU_SLUG_DRAFT);
    expect(OFF_201_MODULE_CODE).toBe("OFF-201");
    expect(OFF_102_MODULE_CODE_DRAFT).toBe("OFF-201");
    expect(OFF_102_MODULE_CODE_ALTERNATIVE).toBe("OFF-201");
    expect(OFF_102_MODULE_CODE_RETIRED).toBe("OFF-102");
    expect(OFF_201_ECOMMERCE_COLLISION_CODE).toBe("EC-102");
    expect(OFF_201_MODULE_CODE).not.toBe(OFF_201_ECOMMERCE_COLLISION_CODE);
    expect(OFF_201_MODULE_CODE.endsWith("-201")).toBe(true);
    expect(OFF_201_MODULE_CODE.split("-")[1]).toBe("201");
    expect(OFF_201_TITLE_DRAFT).toMatch(/İleri Ofis/u);
    expect(OFF_102_TITLE_DRAFT).toBe(OFF_201_TITLE_DRAFT);
    expect(OFF_102_PREREQUISITE_SKU_SLUG).toBe("01_office_ai");
    expect(OFF_102_PREREQUISITE_LESSON_COUNT).toBe(8);
    expect(OFF_102_EXAM_PASS_SCORE).toBe(70);
  });

  it("üç uydu OFF-201 taslak sırasına projekte olur; planned.ts ana şeridi durur", () => {
    const drafts = off201DraftLessonsFromSatellites();
    expect([...OFF_201_SATELLITE_KEYS]).toEqual([
      "01_office_ai-10",
      "01_office_ai-11",
      "01_office_ai-12",
    ]);
    expect(drafts.map((row) => row.satelliteKey)).toEqual([...OFF_201_SATELLITE_KEYS]);
    expect(drafts.map((row) => row.draftOrder)).toEqual([1, 2, 3]);
    expect(drafts.map((row) => row.targetModuleCode)).toEqual(["OFF-201", "OFF-201", "OFF-201"]);
    expect(drafts[0]?.title).toMatch(/Takvim/u);
    expect(drafts[1]?.title).toMatch(/Formül/u);
    expect(drafts[2]?.title).toMatch(/PDF/u);
    expect(drafts.map((row) => row.method)).toEqual([
      "copilot-live",
      "direct-file-upload",
      "doc-upload-gemini",
    ]);
    expect(() => assertOff201DraftIntegrity()).not.toThrow();
    expect(OFFICE_AI_PLANNED_LESSONS.filter((row) => row.lane === "satellite")).toHaveLength(3);
    expect(
      OFFICE_AI_PLANNED_LESSONS.filter((row) => row.targetModuleCode === "OFF-201").map(
        (row) => row.key,
      ),
    ).toEqual([...OFF_201_SATELLITE_KEYS]);
    expect(
      OFFICE_AI_PLANNED_LESSONS.filter((row) => row.targetModuleCode === "OFF-101"),
    ).toHaveLength(8);
  });

  it("taslak kanona, Büyüme Beşlisi’ne ve OFF-101 sınav yoluna girmez", () => {
    expect((ACADEMY_CANON_SKU_SLUGS as readonly string[]).includes(OFF_201_SKU_SLUG_DRAFT)).toBe(
      false,
    );
    expect(curriculumLessonKeysForSlug("01_office_ai")).toHaveLength(8);
    expect(curriculumLessonKeysForSlug("01_office_ai")).not.toEqual(
      expect.arrayContaining([...OFF_201_SATELLITE_KEYS]),
    );
    expect(curriculumLessonKeysForSlug(OFF_201_SKU_SLUG_DRAFT)).toEqual([]);
    expect((ACADEMY_NEED_SKU_CODES as readonly string[]).includes("OFF-201")).toBe(false);
    expect((ACADEMY_NEED_SKU_CODES as readonly string[]).includes("OFF-102")).toBe(false);
    expect(ACADEMY_NEED_SKU_CODES).toContain("EC-102");
  });

  it("katalog okunuşu «iki yüz bir» kilitlenir; EC-102 «yüz iki» durur", () => {
    expect(ACADEMY_MODULE_LEVEL_SPOKEN["201"]).toBe("iki yüz bir");
    expect(ACADEMY_MODULE_LEVEL_SPOKEN["102"]).toBe("yüz iki");
    expect(academyModuleCodeBySlug("01_office_ai_ileri")).toBe("OFF-201");
    expect(academyModuleCodeBySlug("01_office_ai")).toBe("OFF-101");
    expect(academyModuleCodeBySlug("02_ecommerce_ai")).toBe("EC-102");
    expect(academySpokenModuleCode("01_office_ai_ileri")).toBe("Ofis iki yüz bir");
    expect(academySpokenModuleCode("01_office_ai")).toBe("Ofis yüz bir");
    expect(academySpokenModuleCode("02_ecommerce_ai")).toBe("E-ticaret yüz iki");
    expect(academySpokenModuleCode("06_n8n_automation")).toBe("Otomasyon iki yüz bir");
  });

  it("Pedagoji §D.1 ayrım örneği OFF-101 / OFF-201 kilitler", () => {
    const pedagogy = readFileSync(join(process.cwd(), ".system_docs", "PEDAGOJI.md"), "utf8");
    expect(pedagogy).toMatch(/SKU `OFF-101` \/ `OFF-201`/u);
    expect(pedagogy).not.toMatch(/SKU `OFF-101` \/ `OFF-102`/u);
    expect(pedagogy).toContain("OFF-201");
  });
});
