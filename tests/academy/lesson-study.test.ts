import { describe, expect, it } from "vitest";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import {
  extractLessonStudyPack,
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

  it("01_office_ai 1. ders özet, prompt ve saha görevini ayırır", () => {
    const lesson = curriculumForCourseSlug("01_office_ai")[0]!;
    const pack = extractLessonStudyPack(lesson.body);
    expect(pack.prompts.length).toBeGreaterThan(0);
    expect(pack.prompts[0]!.content).toMatch(/Rol:/i);
    expect(pack.fieldTask).toMatch(/Saha Görevi/);
    expect(pack.summaryMarkdown).toMatch(/stajyer/i);
    expect(pack.highlightsMarkdown).toContain("```");
    expect(stripAcademyColdTemplateHeadings(lesson.body)).not.toMatch(/TANIŞMA/u);
  });

  it("01_office_ai ve 02_ecommerce_ai 6. ders özetini BÖLÜM ÖZETİ başlığından ayırır", () => {
    const office = curriculumForCourseSlug("01_office_ai")[5]!;
    const officePack = extractLessonStudyPack(office.body);
    expect(office.body).toMatch(/^#{1,6}\s+BÖLÜM ÖZETİ/m);
    expect(officePack.summaryMarkdown.length).toBeGreaterThan(200);
    expect(officePack.summaryMarkdown).toMatch(/KVKK/i);
    expect(officePack.summaryMarkdown).toMatch(/halüsinasyon/i);
    expect(officePack.highlightsMarkdown).toContain("Bu bölümde cebine koyacakların");

    const ecommerce = curriculumForCourseSlug("02_ecommerce_ai")[5]!;
    const ecommercePack = extractLessonStudyPack(ecommerce.body);
    expect(ecommerce.body).toMatch(/^#{1,6}\s+BÖLÜM ÖZETİ/m);
    expect(ecommercePack.summaryMarkdown.length).toBeGreaterThan(200);
    expect(ecommercePack.summaryMarkdown).toMatch(/KVKK/i);
    expect(ecommercePack.summaryMarkdown).toMatch(/maskele/i);
  });
});
