import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import {
  academyCitizenLessonOrdinal,
  curriculumLessonKeysForSlug,
} from "@/lib/academy/curricula/lesson-index";
import { officeAiSections, OFFICE_AI_PREP_STRIP_KEY } from "@/lib/academy/curricula/office_ai";
import {
  academyPrepStripForSlug,
  isAcademyPrepStripKey,
} from "@/lib/academy/prep-strip";
import { academyPaywallLockedLessonShells } from "@/lib/academy/preview-lock";
import {
  academyCourseOffersFreePreview,
  isAcademyFreePreviewLessonKey,
  isAcademyLessonPaywalled,
} from "@/lib/academy/purchase-path";
import { isAcademySpokenScriptLessonKey } from "@/lib/academy/spoken-scripts";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

const SLUG = "01_office_ai";

describe("01_office_ai Ders 0 — Başlamadan Önce hazırlık şeridi", () => {
  it("lesson-index, compact 9'lu ve spoken-script anahtarına girmez", () => {
    expect(OFFICE_AI_PREP_STRIP_KEY).toBe("01_office_ai-0");
    expect(isAcademyPrepStripKey(OFFICE_AI_PREP_STRIP_KEY)).toBe(true);
    expect(curriculumLessonKeysForSlug(SLUG)).toHaveLength(8);
    expect(curriculumLessonKeysForSlug(SLUG)).not.toContain(OFFICE_AI_PREP_STRIP_KEY);
    expect(officeAiSections).toHaveLength(8);
    expect(officeAiSections.some((row) => row.lessonKey === OFFICE_AI_PREP_STRIP_KEY)).toBe(false);
    expect(curriculumForCourseSlug(SLUG).map((row) => row.key)).not.toContain(OFFICE_AI_PREP_STRIP_KEY);
    expect(academyCitizenLessonOrdinal(SLUG, OFFICE_AI_PREP_STRIP_KEY)).toBeNull();
    expect(isAcademySpokenScriptLessonKey(OFFICE_AI_PREP_STRIP_KEY)).toBe(false);
  });

  it("antre rozeti ve kapsama alanı sınav yolunu bozmaz", () => {
    const strip = academyPrepStripForSlug(SLUG);
    expect(strip).not.toBeNull();
    expect(strip?.badge).toBe(ACADEMY_SEN.outline.prepBadge);
    expect(strip?.title).toMatch(/Yapay Zekâyla Tanışma/u);
    expect(strip?.estimatedMinutes).toBe(8);
    expect(strip?.contentMarkdown).toMatch(/Bu şeridin sonunda/u);
    expect(strip?.contentMarkdown).toMatch(/ücretsiz ile ücretli/u);
    expect(strip?.contentMarkdown).toMatch(/istem kutusudur/u);
    expect(strip?.contentMarkdown).toMatch(/Türkçe mi İngilizce mi/u);
    expect(strip?.contentMarkdown).not.toMatch(/Sınav şimdi açıldı/u);
    expect(strip?.contentMarkdown).not.toMatch(/Baraj 70 puandır/u);
    expect(academyPrepStripForSlug("02_ecommerce_ai")).toBeNull();
  });

  it("yalnız hazırlık şeridi ücretsizdir; 1–8 ana ders satın almadan kilitlidir", () => {
    const keys = curriculumLessonKeysForSlug(SLUG);
    expect(academyCourseOffersFreePreview(SLUG)).toBe(true);
    expect(isAcademyFreePreviewLessonKey(OFFICE_AI_PREP_STRIP_KEY)).toBe(true);
    expect(isAcademyLessonPaywalled(SLUG, OFFICE_AI_PREP_STRIP_KEY, false)).toBe(false);
    expect(keys).toHaveLength(8);
    for (const key of keys) {
      expect(isAcademyLessonPaywalled(SLUG, key, false)).toBe(true);
      expect(isAcademyLessonPaywalled(SLUG, key, true)).toBe(false);
    }
    expect(isAcademyLessonPaywalled("02_ecommerce_ai", "02_ecommerce_ai-1", false)).toBe(true);
    const shells = academyPaywallLockedLessonShells(SLUG);
    expect(shells.map((row) => row.key)).toEqual([...keys]);
    expect(shells.every((row) => row.open === false && row.body === "" && row.completed === false)).toBe(
      true,
    );
    expect(shells.some((row) => row.key === OFFICE_AI_PREP_STRIP_KEY)).toBe(false);
    const oyna = readFileSync(join(process.cwd(), "app/academy/[slug]/oyna/page.tsx"), "utf8");
    expect(oyna).toContain("paywallLocked");
    expect(oyna).toContain("academyPaywallLockedLessonShells");
    expect(oyna).toContain("academyCourseOffersFreePreview");
    expect(oyna).toContain("hasPurchased");
  });
});
