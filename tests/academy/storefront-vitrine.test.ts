import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { ACADEMY_LEGACY_PURGE_CATALOG_UNITS } from "@/lib/academy/catalog-seed";
import {
  ACADEMY_FLAGSHIP_SKU_SLUG,
  ACADEMY_GROWTH_SKU_SLUGS,
  academyCourseHasSealedAudio,
  academyStorefrontStaticParams,
  isAcademyGrowthSkuSlug,
} from "@/lib/academy/pilot-sku";
import {
  ACADEMY_LEGACY_UNIT_SLUGS_FOR_TEST,
  ACADEMY_RETIRED_STOREFRONT_SLUGS,
  ACADEMY_VITRINE_SLUGS_FOR_TEST,
  academyRetiredStorefrontRedirects,
  isAcademyRetiredStorefrontSlug,
} from "@/lib/academy/retired-storefront";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("akademi vitrin 011 — künye, tek raf, sert 404", () => {
  it("amiral SKU büyüme beşlisinin başıdır", () => {
    expect(ACADEMY_FLAGSHIP_SKU_SLUG).toBe("01_office_ai");
    expect(ACADEMY_GROWTH_SKU_SLUGS[0]).toBe(ACADEMY_FLAGSHIP_SKU_SLUG);
    expect(isAcademyGrowthSkuSlug("01_office_ai")).toBe(true);
    expect(isAcademyGrowthSkuSlug("python-temel")).toBe(false);
    expect(isAcademyGrowthSkuSlug("06_n8n_automation")).toBe(false);
    expect(isAcademyGrowthSkuSlug("siber-guvenlik")).toBe(false);
    expect(academyStorefrontStaticParams().map((row) => row.slug)).toEqual([
      ...ACADEMY_GROWTH_SKU_SLUGS,
    ]);
  });

  it("katalog viewport kilidi html taşmasını kesmez; künye kaydırma gövdesindedir", () => {
    const page = readSrc("app/academy/page.tsx");
    const list = readSrc("components/academy/course-list.tsx");
    const css = readSrc("app/globals.css");
    const strip = readSrc("components/legal/legal-colophon-strip.tsx");
    const skeleton = readSrc("components/academy/academy-room-skeleton.tsx");
    expect(page).not.toContain("academy-catalog-viewport-lock");
    expect(page).toContain("LegalColophonStrip");
    expect(list).toContain("data-academy-catalog-colophon");
    expect(list).not.toContain("overflow-hidden");
    expect(list).not.toContain("overflow-y-auto");
    expect(list).not.toContain("groupAcademyCatalogBySeries");
    expect(list).not.toContain("seriesPath");
    expect(list).toContain("orderAcademyCatalogByCurriculum");
    expect(list).toContain("ACADEMY_FLAGSHIP_SKU_SLUG");
    expect(list).toContain("md:col-span-2");
    expect(css).not.toContain("html:has(.academy-catalog-viewport-lock)");
    expect(css).toContain("html:has(.academy-player-viewport-lock)");
    expect(strip).toContain("opacity-90");
    expect(strip).not.toContain("opacity-70");
    expect(skeleton).not.toContain("academy-catalog-viewport-lock");
  });

  it("antre ve oynatıcı vitrin dışı slug için dynamicParams = false ve notFound basar", () => {
    const antre = readSrc("app/academy/[slug]/page.tsx");
    const oyna = readSrc("app/academy/[slug]/oyna/page.tsx");
    expect(antre).toContain("dynamicParams = false");
    expect(antre).toContain("generateStaticParams");
    expect(antre).toContain("academyStorefrontStaticParams");
    expect(antre).toContain("isAcademyGrowthSkuSlug");
    expect(antre).toContain("notFound()");
    expect(antre).not.toContain("PAGE_SEO.academy.title");
    expect(oyna).toContain("dynamicParams = false");
    expect(oyna).toContain("academyStorefrontStaticParams");
    expect(oyna).toContain("isAcademyGrowthSkuSlug");
    expect(oyna).toContain("notFound()");
  });

  it("SEN oynatıcı callout hayalet python-temel href taşımaz", () => {
    expect(ACADEMY_SEN.player.codeCalloutHref).toBe("/academy/05_prompt_practice");
    expect(ACADEMY_SEN.player.codeCalloutModule).toBe("Pratik Prompt Mühendisliği");
    expect(ACADEMY_SEN.player.codeCalloutHref).not.toContain("python-temel");
    expect(JSON.stringify(ACADEMY_SEN)).not.toContain("/academy/python-temel");
    expect(JSON.stringify(ACADEMY_SEN)).not.toContain("Python ile Yazılım ve Veri Mühendisliği");
  });

  it("eski vitrin slug 301 kataloga gider; 5 compact SKU haritada yoktur", () => {
    expect(isAcademyRetiredStorefrontSlug("python-temel")).toBe(true);
    expect(isAcademyRetiredStorefrontSlug("fullstack-temel")).toBe(true);
    expect(isAcademyRetiredStorefrontSlug("security-temel")).toBe(true);
    expect(isAcademyRetiredStorefrontSlug("excel-masterclass")).toBe(true);
    expect(isAcademyRetiredStorefrontSlug("06_n8n_automation")).toBe(true);
    expect(isAcademyRetiredStorefrontSlug("01_office_ai")).toBe(false);
    for (const slug of ACADEMY_GROWTH_SKU_SLUGS) {
      expect(isAcademyRetiredStorefrontSlug(slug), slug).toBe(false);
    }
    expect([...ACADEMY_VITRINE_SLUGS_FOR_TEST]).toEqual([...ACADEMY_GROWTH_SKU_SLUGS]);
    const fromUnits = ACADEMY_LEGACY_PURGE_CATALOG_UNITS.map((unit) => unit.slice("course:".length));
    expect([...ACADEMY_LEGACY_UNIT_SLUGS_FOR_TEST].sort()).toEqual([...fromUnits].sort());
    const redirects = academyRetiredStorefrontRedirects();
    const python = redirects.find((row) => row.source === "/academy/python-temel");
    const pythonPlay = redirects.find((row) => row.source === "/academy/python-temel/oyna");
    const pythonCourses = redirects.find((row) => row.source === "/academy/courses/python-temel");
    expect(python).toEqual({ source: "/academy/python-temel", destination: "/academy", statusCode: 301 });
    expect(pythonPlay).toEqual({
      source: "/academy/python-temel/oyna",
      destination: "/academy",
      statusCode: 301,
    });
    expect(pythonCourses).toEqual({
      source: "/academy/courses/python-temel",
      destination: "/academy",
      statusCode: 301,
    });
    const nextConfig = readSrc("next.config.ts");
    expect(nextConfig).toContain("academyRetiredStorefrontRedirects");
    expect(nextConfig.indexOf("academyRetiredStorefrontRedirects")).toBeLessThan(
      nextConfig.indexOf('source: "/academy/courses/:slug"'),
    );
    const aliasPage = readSrc("app/academy/courses/[slug]/page.tsx");
    expect(aliasPage).toContain("isAcademyRetiredStorefrontSlug");
    expect(aliasPage).toContain('permanentRedirect("/academy")');
    expect(academyCourseHasSealedAudio("01_office_ai")).toBe(true);
    expect(academyCourseHasSealedAudio("02_ecommerce_ai")).toBe(false);
    expect(academyCourseHasSealedAudio("05_prompt_practice")).toBe(false);
    expect(ACADEMY_SEN.catalog.audioBadge).not.toContain("Seslendirmeli");
    expect(ACADEMY_RETIRED_STOREFRONT_SLUGS).toContain("siber-guvenlik");
  });
});
