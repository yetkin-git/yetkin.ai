import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  OFF_201_ECOMMERCE_COLLISION_CODE,
  OFF_201_EXAM_PASS_SCORE,
  OFF_201_MODULE_CODE,
  OFF_201_NOT_IN_THIS_VERSION,
  OFF_201_SATELLITE_KEYS,
  OFF_201_SKU_SLUG,
  OFF_201_TITLE,
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
  it("yayın kart kodu OFF-201 kilitlenir; EC-102 ile çakışmaz; ön koşul sabiti yoktur", () => {
    expect(OFF_201_SKU_SLUG).toBe("01_office_ai_ileri");
    expect(OFF_201_MODULE_CODE).toBe("OFF-201");
    expect(OFF_201_ECOMMERCE_COLLISION_CODE).toBe("EC-102");
    expect(OFF_201_MODULE_CODE).not.toBe(OFF_201_ECOMMERCE_COLLISION_CODE);
    expect(OFF_201_MODULE_CODE.endsWith("-201")).toBe(true);
    expect(OFF_201_MODULE_CODE.split("-")[1]).toBe("201");
    expect(OFF_201_TITLE).toMatch(/İleri Ofis/u);
    expect(OFF_201_EXAM_PASS_SCORE).toBe(70);
    const source = readFileSync(
      join(process.cwd(), "lib/academy/curricula/office_ai/off-201.ts"),
      "utf8",
    );
    expect(source).not.toContain("OFF_201_PREREQUISITE");
    expect(source).not.toContain("OFF_102_");
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
    expect(drafts[0]?.title).toBe("Toplantı Notu ve Eylem Listesi");
    expect(drafts[1]?.title).toBe("Excel Formül ve Grafik");
    expect(drafts[2]?.title).toBe("Uzun Belge ve Sayfa Kontrolü");
    for (const row of drafts) {
      const promise = `${row.title}\n${row.pedagogicalObjective}`;
      for (const topic of OFF_201_NOT_IN_THIS_VERSION) {
        expect(promise.toLocaleLowerCase("tr")).not.toContain(topic.toLocaleLowerCase("tr"));
      }
    }
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
    expect((ACADEMY_CANON_SKU_SLUGS as readonly string[]).includes(OFF_201_SKU_SLUG)).toBe(
      false,
    );
    expect(curriculumLessonKeysForSlug("01_office_ai")).toHaveLength(8);
    expect(curriculumLessonKeysForSlug("01_office_ai")).not.toEqual(
      expect.arrayContaining([...OFF_201_SATELLITE_KEYS]),
    );
    expect(curriculumLessonKeysForSlug(OFF_201_SKU_SLUG)).toHaveLength(6);
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
    expect(pedagogy).toContain("Model sicili");
    expect(pedagogy).toContain("`lib/kernel/ai/model-roles.ts`");
    expect(pedagogy).not.toContain("Gemini 3.8 Flash");
    expect(pedagogy).not.toContain("tablodaki adlar silinmez");
    expect(pedagogy).toContain("`01_office_ai_ileri`");
  });
});
