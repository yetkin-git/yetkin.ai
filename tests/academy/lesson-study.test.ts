import { describe, expect, it } from "vitest";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import {
  isAcademyColdTemplateHeading,
  isAcademyLeadingColdHeading,
  stripAcademyColdTemplateHeadings,
} from "@/lib/academy/lesson-study";

describe("soğuk şablon başlık süzgeci — Aşama 1 oynatıcı", () => {
  it("TANIŞMA / DERS İÇERİĞİ / BÖLÜM 1 tepeden düşer; selamlama kalır", () => {
    const raw = `### 1. TANIŞMA: MERHABA, BEN GÖZDE!\n\nMerhaba! Ben Gözde.\n\nBu eğitimde seninle birlikte çalışacağız.`;
    const stripped = stripAcademyColdTemplateHeadings(raw);
    expect(stripped.startsWith("Merhaba! Ben Gözde.")).toBe(true);
    expect(stripped).not.toContain("TANIŞMA");
    expect(isAcademyColdTemplateHeading("DERS İÇERİĞİ")).toBe(true);
    expect(isAcademyColdTemplateHeading("1. TANIŞMA: MERHABA, BEN GÖZDE!")).toBe(true);
    expect(isAcademyLeadingColdHeading("BÖLÜM 1:")).toBe(true);
    expect(isAcademyColdTemplateHeading("6. BÖLÜM ÖZETİ")).toBe(false);
    expect(
      stripAcademyColdTemplateHeadings("# DERS İÇERİĞİ\n\n### BÖLÜM 1:\n\nMerhaba! Ben Gözde."),
    ).toBe("Merhaba! Ben Gözde.");
  });

  it("01_office_ai ders gövdesi 1. bölümü taşır", () => {
    expect(curriculumForCourseSlug("01_office_ai")).toHaveLength(9);
    expect(curriculumForCourseSlug("02_ecommerce_ai")).toEqual([]);
  });
});
