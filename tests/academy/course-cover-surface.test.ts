import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACADEMY_COURSE_COVER_SIZES,
  ACADEMY_COURSE_COVER_SRCSET_WIDTHS,
  ACADEMY_HOME_CINEMA_COVER_SIZES,
  ACADEMY_HOME_LCP_COVER_AVIF,
  ACADEMY_HOME_LCP_COVER_AVIF_SRCSET,
  ACADEMY_HOME_LCP_PRELOAD_LINK,
  academyCourseCoverAvifPath,
  academyCourseCoverPath,
  academyCourseCoverSrcSet,
  academyCourseCoverWidthPath,
  isAcademyCinemaCoverPath,
} from "@/lib/academy/course-cover";
import { ACADEMY_GROWTH_SKU_SLUGS } from "@/lib/academy/pilot-sku";

const ROOT = process.cwd();
const COVER_CEILING_BYTES = 50 * 1024;

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("akademi vitrin kapak WebP/AVIF yüzeyi", () => {
  it("büyüme SKU kapakları WebP kanon + AVIF yedek taşır; 50 KB tavanını aşmaz", () => {
    for (const slug of ACADEMY_GROWTH_SKU_SLUGS) {
      const webp = academyCourseCoverPath(slug);
      const avif = academyCourseCoverAvifPath(slug);
      expect(isAcademyCinemaCoverPath(webp), slug).toBe(true);
      expect(webp.endsWith(".webp"), slug).toBe(true);
      expect(avif.endsWith(".avif"), slug).toBe(true);
      const webpDisk = join(ROOT, "public", webp.slice(1));
      const avifDisk = join(ROOT, "public", avif.slice(1));
      expect(existsSync(webpDisk), webp).toBe(true);
      expect(existsSync(avifDisk), avif).toBe(true);
      expect(statSync(webpDisk).size, webp).toBeLessThanOrEqual(COVER_CEILING_BYTES);
      expect(statSync(avifDisk).size, avif).toBeLessThanOrEqual(COVER_CEILING_BYTES);
      for (const width of ACADEMY_COURSE_COVER_SRCSET_WIDTHS) {
        const webpW = academyCourseCoverWidthPath(webp, width);
        const avifW = academyCourseCoverWidthPath(avif, width);
        expect(existsSync(join(ROOT, "public", webpW.slice(1))), webpW).toBe(true);
        expect(existsSync(join(ROOT, "public", avifW.slice(1))), avifW).toBe(true);
        expect(statSync(join(ROOT, "public", webpW.slice(1))).size, webpW).toBeLessThanOrEqual(
          COVER_CEILING_BYTES,
        );
        expect(statSync(join(ROOT, "public", avifW.slice(1))).size, avifW).toBeLessThanOrEqual(
          COVER_CEILING_BYTES,
        );
      }
      expect(academyCourseCoverSrcSet(webp)).toContain("640w");
      expect(academyCourseCoverSrcSet(avif)).toContain("960w");
    }
    expect(academyCourseCoverPath("03_social_media_ai")).toBe(
      "/academy/cinema/03_social_media_ai-reels-1-eye.webp",
    );
    expect(academyCourseCoverAvifPath("01_office_ai")).toBe(ACADEMY_HOME_LCP_COVER_AVIF);
    expect(academyCourseCoverSrcSet(ACADEMY_HOME_LCP_COVER_AVIF)).toBe(
      ACADEMY_HOME_LCP_COVER_AVIF_SRCSET,
    );
  });

  it("ana sayfa Next Image + AVIF preload basar; kenar Link Early Hints ile aynı AVIF’e kilitlidir", () => {
    const home = readSrc("app/(public)/page.tsx");
    const config = readSrc("next.config.ts");
    const cover = readSrc("components/academy/course-cover-image.tsx");
    const listing = readSrc("components/showcase/listing-card.tsx");
    const card = readSrc("components/academy/course-card.tsx");
    expect(cover).toContain('from "next/image"');
    expect(cover).toContain('type="image/avif"');
    expect(cover).toContain("unoptimized");
    expect(cover).toContain("academyCourseCoverSrcSet");
    expect(cover).toContain('fetchPriority={highPriority ? "high" : "low"}');
    expect(cover).toContain('loading={eager || highPriority ? "eager" : "lazy"}');
    expect(home).toContain("CourseCoverImage");
    expect(home).toContain("preload(");
    expect(home).toContain("ACADEMY_HOME_LCP_COVER_AVIF");
    expect(home).toContain("ACADEMY_HOME_LCP_COVER_AVIF_SRCSET");
    expect(home).toContain("imageSrcSet");
    expect(home).toContain("imageSizes");
    expect(home).toContain("ACADEMY_HOME_CINEMA_COVER_SIZES");
    expect(home).toContain("eager={index === 0}");
    expect(home).toContain("highPriority={index === 0}");
    expect(home).toContain('type: "image/avif"');
    expect(listing).toContain("CourseCoverImage");
    expect(listing).toContain("ACADEMY_COURSE_COVER_SIZES");
    expect(card).toContain("ACADEMY_COURSE_COVER_SIZES");
    expect(card).toContain("coverPriority={featured}");
    expect(ACADEMY_COURSE_COVER_SIZES).toBe(
      "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    );
    expect(ACADEMY_HOME_CINEMA_COVER_SIZES).toBe(
      "(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw",
    );
    expect(config).toContain('formats: ["image/avif", "image/webp"]');
    expect(config).toContain(ACADEMY_HOME_LCP_PRELOAD_LINK);
    expect(config).toContain("imagesrcset=");
    expect(config).toContain("imagesizes=");
    expect(config).toContain('source: "/"');
    expect(ACADEMY_HOME_LCP_PRELOAD_LINK).toContain(ACADEMY_HOME_LCP_COVER_AVIF);
    expect(ACADEMY_HOME_LCP_PRELOAD_LINK).toContain(ACADEMY_HOME_LCP_COVER_AVIF_SRCSET);
    expect(ACADEMY_GROWTH_SKU_SLUGS[0]).toBe("01_office_ai");
  });
});
