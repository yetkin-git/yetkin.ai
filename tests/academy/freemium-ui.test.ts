import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { isAcademyLessonPaywalled } from "@/lib/academy/purchase-path";
import { academyCourseOffersFreePreview } from "@/lib/kernel/catalog-ids/free-preview";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

/**
 * Kurs detay yüzeyi Anayasa B4'ü satın alma duvarının önüne koyar.
 * Oynatıcı adresi `/academy/<slug>/oyna`. Boş kabukta düğme yoktur.
 */
describe("kurs detay freemium yüzeyi", () => {
  it("hero ve satın alma alanı 1. dersi ücretsiz oynatıcıya bağlar", () => {
    const page = readSrc("app/academy/[slug]/page.tsx");
    const hero = readSrc("components/academy/course-hero-actions.tsx");
    const link = readSrc("components/academy/free-preview-link.tsx");

    expect(ACADEMY_SEN.course.heroPreviewCta).toBe("1. Dersi Ücretsiz İzle");
    expect(page).toContain("academyCourseOffersFreePreview");
    expect(page).toContain("previewHref={previewHref}");
    expect(page).toContain('surface="purchase"');
    expect(page).toContain('surface="expired"');
    expect(page).toContain("freemium={showFreePreview}");
    expect(hero).toContain("FreePreviewLink");
    expect(hero).toContain('surface="hero"');
    expect(hero).toContain("w-full");
    expect(hero).toContain("sm:w-max");
    expect(page).toContain("sm:flex-row");
    expect(link).toContain("heroPreviewCta");
    expect(link).toContain('variant="success"');
  });

  it("ders listesi ilk dersi açar, sonrakine kilit ve Lisanslı basar", () => {
    const outline = readSrc("components/academy/curriculum-outline.tsx");
    expect(ACADEMY_SEN.outline.previewBadge).toBe("Ücretsiz / Önizleme");
    expect(ACADEMY_SEN.outline.previewPlayCta).toBe("İzle");
    expect(ACADEMY_SEN.outline.licensed).toBe("Lisanslı");
    expect(outline).toContain("isAcademyLessonPaywalled");
    expect(outline).toContain("data-academy-lesson-preview");
    expect(outline).toContain("data-academy-lesson-play");
    expect(outline).toContain("data-academy-lesson-licensed");
    expect(outline).toContain("IconLock");
    expect(outline).toContain("/oyna");
    expect(outline).toContain("previewHint");

    expect(academyCourseOffersFreePreview("01_office_ai")).toBe(true);
    expect(academyCourseOffersFreePreview("01_office_ai_ileri")).toBe(true);
    expect(academyCourseOffersFreePreview("03_social_media_ai")).toBe(false);
    expect(isAcademyLessonPaywalled("01_office_ai", "01_office_ai-1", false)).toBe(false);
    expect(isAcademyLessonPaywalled("01_office_ai", "01_office_ai-k1", false)).toBe(true);
    expect(isAcademyLessonPaywalled("01_office_ai_ileri", "01_office_ai_ileri-1", false)).toBe(false);
    expect(isAcademyLessonPaywalled("01_office_ai_ileri", "01_office_ai_ileri-2", false)).toBe(true);
  });
});
