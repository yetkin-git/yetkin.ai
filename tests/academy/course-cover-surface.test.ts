import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACADEMY_BRAND_FALLBACK_COVER,
  ACADEMY_CATALOG_LCP_PRELOAD_LINK,
  ACADEMY_COURSE_COVER_SIZES,
  ACADEMY_FLAGSHIP_CHAPTER_ONE_DURATION_MIN,
  ACADEMY_HOME_CINEMA_COVER_SIZES,
  ACADEMY_HOME_LCP_COVER_AVIF,
  ACADEMY_HOME_LCP_COVER_AVIF_SRCSET,
  ACADEMY_HOME_LCP_PRELOAD_LINK,
  academyCourseCoverAvifPath,
  academyCourseCoverPath,
  academyCourseCoverSrcSet,
  academyCourseHasCinemaCover,
  academyCourseIsComingSoon,
  isAcademyBrandFallbackCover,
  isAcademyCinemaCoverPath,
} from "@/lib/academy/course-cover";
import { ACADEMY_FLAGSHIP_SKU_SLUG, ACADEMY_GROWTH_SKU_SLUGS } from "@/lib/academy/pilot-sku";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("akademi vitrin kapak — amiral 1. bölüm + Yakında şablonu", () => {
  it("amiral cinema 1-eye bağlar; kardeş SKU marka mührüne düşmez", () => {
    const flagship = academyCourseCoverPath(ACADEMY_FLAGSHIP_SKU_SLUG);
    expect(flagship).toBe("/academy/cinema/01_office_ai-1-eye.webp");
    expect(isAcademyCinemaCoverPath(flagship!)).toBe(true);
    expect(academyCourseHasCinemaCover(ACADEMY_FLAGSHIP_SKU_SLUG)).toBe(true);
    expect(academyCourseIsComingSoon(ACADEMY_FLAGSHIP_SKU_SLUG)).toBe(false);
    expect(academyCourseIsComingSoon("05_prompt_practice")).toBe(true);
    expect(academyCourseCoverPath("05_prompt_practice")).toBeNull();
    expect(academyCourseCoverAvifPath(ACADEMY_FLAGSHIP_SKU_SLUG)).toBe(
      "/academy/cinema/01_office_ai-1-eye.avif",
    );
    expect(academyCourseCoverSrcSet(flagship!)).toContain("640w");
    expect(existsSync(join(ROOT, "public", "academy", "cinema", "01_office_ai-1-eye.webp"))).toBe(
      true,
    );
    expect(ACADEMY_FLAGSHIP_CHAPTER_ONE_DURATION_MIN).toBe(10);

    for (const slug of ACADEMY_GROWTH_SKU_SLUGS) {
      if (slug === ACADEMY_FLAGSHIP_SKU_SLUG) {
        continue;
      }
      expect(academyCourseCoverPath(slug), slug).toBeNull();
      expect(academyCourseIsComingSoon(slug), slug).toBe(true);
      expect(academyCourseHasCinemaCover(slug), slug).toBe(false);
      expect(academyCourseCoverAvifPath(slug), slug).toBeNull();
    }
    expect(isAcademyBrandFallbackCover(ACADEMY_BRAND_FALLBACK_COVER)).toBe(true);
    expect(existsSync(join(ROOT, "public", "icon.svg"))).toBe(true);
    const cinemaDir = join(ROOT, "public", "academy", "cinema");
    const cinemaFiles = existsSync(cinemaDir) ? readdirSync(cinemaDir) : [];
    expect(cinemaFiles.some((name) => name === "01_office_ai-1-eye.webp")).toBe(true);
    expect(ACADEMY_HOME_LCP_COVER_AVIF).toBe("/academy/cinema/01_office_ai-1-eye.avif");
    expect(ACADEMY_HOME_LCP_COVER_AVIF_SRCSET).toContain("01_office_ai-1-eye.avif");
    expect(ACADEMY_HOME_LCP_PRELOAD_LINK).toBe("");
    expect(ACADEMY_CATALOG_LCP_PRELOAD_LINK).toBe("");
  });

  it("ana sayfa taslak SKU ızgarası basmaz; üretim bandı dürüst kart durur", () => {
    const home = readSrc("app/(public)/page.tsx");
    const config = readSrc("next.config.ts");
    const cover = readSrc("components/academy/course-cover-image.tsx");
    const listing = readSrc("components/showcase/listing-card.tsx");
    const card = readSrc("components/academy/course-card.tsx");
    expect(cover).toContain('from "next/image"');
    expect(home).not.toContain("CourseCoverImage");
    expect(home).not.toContain("academyCourseCoverPath");
    expect(home).not.toContain("comingSoonBadge");
    expect(home).not.toContain("preload(");
    expect(home).not.toContain("ACADEMY_GROWTH_SKU_SLUGS");
    expect(home).toContain("data-academy-production-band");
    expect(home).toContain("ACADEMY_SEN.catalog.empty");
    expect(listing).toContain("CourseCoverImage");
    expect(listing).toContain("coverComingSoon");
    expect(listing).toContain("ACADEMY_COURSE_COVER_SIZES");
    expect(card).toContain("ACADEMY_COURSE_COVER_SIZES");
    expect(card).toContain("coverPriority={featured}");
    expect(card).toContain("comingSoonBadge");
    expect(card).toContain("cardMetaAudio");
    expect(card).not.toContain("ACADEMY_BRAND_FALLBACK_COVER");
    expect(ACADEMY_COURSE_COVER_SIZES).toBe(
      "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    );
    expect(ACADEMY_HOME_CINEMA_COVER_SIZES).toBe(
      "(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw",
    );
    expect(config).toContain('formats: ["image/avif", "image/webp"]');
    expect(config).not.toContain("ACADEMY_HOME_LCP_PRELOAD_LINK");
    expect(ACADEMY_GROWTH_SKU_SLUGS[0]).toBe("01_office_ai");
  });

  it("akademi vitrin Early Hints preload basmaz", () => {
    const academy = readSrc("app/academy/page.tsx");
    const config = readSrc("next.config.ts");
    const listing = readSrc("components/showcase/listing-card.tsx");
    expect(academy).not.toContain("preload(");
    expect(academy).not.toContain("ACADEMY_HOME_LCP_COVER_AVIF");
    expect(listing).toContain("aspect-[16/9]");
    expect(listing).toContain("data-academy-coming-soon-cover");
    expect(config).toContain('source: "/academy"');
    expect(config).not.toContain("ACADEMY_CATALOG_LCP_PRELOAD_LINK");
  });
});
