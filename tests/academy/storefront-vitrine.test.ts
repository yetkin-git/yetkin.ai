import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { ACADEMY_LEGACY_PURGE_CATALOG_UNITS, academyVitrineDisplaySeed } from "@/lib/academy/catalog-seed";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import {
  ACADEMY_FLAGSHIP_SKU_SLUG,
  ACADEMY_GROWTH_SKU_SLUGS,
  ACADEMY_PRODUCTION_LINE_SKU_SLUGS,
  ACADEMY_VITRINE_SHELL_SKU_SLUGS,
  academyCourseHasSealedAudio,
  academyStorefrontStaticParams,
  isAcademyGrowthSkuSlug,
  isAcademyProductionLineSkuSlug,
} from "@/lib/academy/pilot-sku";
import { academyCourseIsComingSoon } from "@/lib/academy/course-cover";
import { resolveAcademyCatalogCardCta } from "@/lib/academy/storefront-cta";
import { academyModuleCodeBySlug } from "@/lib/academy/catalog-filter";
import { academyCourseRecordFromSeed, academyVitrineShellCourses } from "@/lib/academy/published-catalog";
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
  it("amiral SKU mühürlü vitrin çekirdeğidir", () => {
    expect(ACADEMY_FLAGSHIP_SKU_SLUG).toBe("01_office_ai");
    expect(ACADEMY_GROWTH_SKU_SLUGS[0]).toBe(ACADEMY_FLAGSHIP_SKU_SLUG);
    expect(isAcademyGrowthSkuSlug("01_office_ai")).toBe(true);
    expect(isAcademyGrowthSkuSlug("02_ecommerce_ai")).toBe(false);
    expect(isAcademyGrowthSkuSlug("python-temel")).toBe(false);
    expect(isAcademyGrowthSkuSlug("06_n8n_automation")).toBe(false);
    expect(isAcademyGrowthSkuSlug("siber-guvenlik")).toBe(false);
    expect(academyStorefrontStaticParams().map((row) => row.slug)).toEqual([
      ...ACADEMY_GROWTH_SKU_SLUGS,
    ]);
    expect([...ACADEMY_VITRINE_SHELL_SKU_SLUGS]).toEqual([
      "01_office_ai",
      "01_office_ai_ileri",
      "02_ecommerce_ai",
      "03_social_media_ai",
      "04_chatbot_nocode",
      "05_prompt_practice",
    ]);
    expect([...ACADEMY_PRODUCTION_LINE_SKU_SLUGS]).toEqual([
      "02_ecommerce_ai",
      "03_social_media_ai",
      "04_chatbot_nocode",
      "05_prompt_practice",
    ]);
    expect(isAcademyProductionLineSkuSlug("05_prompt_practice")).toBe(true);
    expect(isAcademyProductionLineSkuSlug("01_office_ai")).toBe(false);
    expect(academyCourseIsComingSoon("01_office_ai")).toBe(false);
    expect(academyCourseIsComingSoon("03_social_media_ai")).toBe(false);
    expect(academyCourseIsComingSoon("04_chatbot_nocode")).toBe(false);
    expect(academyCourseIsComingSoon("05_prompt_practice")).toBe(false);
    expect(academyVitrineShellCourses().map((row) => row.slug)).toEqual([
      ...ACADEMY_VITRINE_SHELL_SKU_SLUGS,
    ]);
    expect(academyVitrineShellCourses().map((row) => academyModuleCodeBySlug(row.slug))).toEqual([
      "OFF-101",
      "OFF-201",
      "EC-102",
      "SM-103",
      "BOT-104",
      "PR-105",
    ]);
    expect(academyModuleCodeBySlug("01_office_ai_ileri")).toBe("OFF-201");
    const closed = academyVitrineShellCourses();
    expect(closed.find((row) => row.slug === "01_office_ai_ileri")?.purchasable).toBe(false);
    expect(closed.find((row) => row.slug === "01_office_ai_ileri")?.isPublished).toBe(false);
    expect(closed.find((row) => row.slug === "01_office_ai_ileri")?.priceMinor).toBeNull();
    expect(closed.filter((row) => row.purchasable).map((row) => row.slug)).toEqual([]);
    expect(closed.find((row) => row.slug === "02_ecommerce_ai")?.isPublished).toBe(false);
    expect(closed.find((row) => row.slug === "02_ecommerce_ai")?.purchasable).toBe(false);
    expect(academyCourseIsComingSoon("02_ecommerce_ai")).toBe(false);
  });

  it("EC-102 kamu kapısı açıkken yayınlı ve fiyatlı satır satın alınır", () => {
    const seed = academyVitrineDisplaySeed("02_ecommerce_ai");
    expect(seed).toBeDefined();
    const base = academyCourseRecordFromSeed(seed!);
    const priced = {
      ...base,
      isPublished: true,
      priceMinor: toAmountMinor(seed!.seedAmountMinor),
      currencyCode: SETTLEMENT_CURRENCY,
      purchasable: false,
    };
    const open = academyVitrineShellCourses([priced]);
    const ec102 = open.find((row) => row.slug === "02_ecommerce_ai");
    expect(ec102?.purchasable).toBe(true);
    expect(ec102?.isPublished).toBe(true);
    const card = resolveAcademyCatalogCardCta({
      slug: "02_ecommerce_ai",
      owned: false,
      priceLabel: "₺990,00",
      purchasable: ec102?.purchasable,
      isPublished: ec102?.isPublished,
    });
    expect(card.cta).toBe("Satın Al");
    expect(card.href).toBe("/academy/02_ecommerce_ai");
    expect(card.ctaDisabled).toBeUndefined();
    expect(open.find((row) => row.slug === "01_office_ai")?.purchasable).toBe(false);

    const unpublished = academyVitrineShellCourses([{ ...priced, isPublished: false }]);
    expect(unpublished.find((row) => row.slug === "02_ecommerce_ai")?.purchasable).toBe(false);

    const noPrice = academyVitrineShellCourses([{ ...priced, priceMinor: null }]);
    expect(noPrice.find((row) => row.slug === "02_ecommerce_ai")?.purchasable).toBe(false);
    expect(noPrice.find((row) => row.slug === "02_ecommerce_ai")?.isPublished).toBe(true);
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
    expect(list).toContain("filterAcademyVitrineCatalog");
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
    const exitKit = readSrc("app/academy/[slug]/cikis-paketi/page.tsx");
    expect(antre).toContain("dynamicParams = false");
    expect(antre).toContain("generateStaticParams");
    expect(antre).toContain("academyStorefrontStaticParams");
    expect(antre).toContain("isAcademyStorefrontSlug");
    expect(antre).toContain("notFound()");
    expect(antre).not.toContain("PAGE_SEO.academy.title");
    expect(oyna).toContain("dynamicParams = false");
    expect(oyna).toContain("academyStorefrontStaticParams");
    expect(oyna).toContain("isAcademyStorefrontSlug");
    expect(oyna).toContain("notFound()");
    expect(exitKit).toContain("dynamicParams = false");
    expect(exitKit).toContain("OFFICE_AI_EXIT_KIT_SLUG");
    expect(exitKit).toContain("notFound()");
  });

  it("SEN oynatıcı callout hayalet python-temel href taşımaz", () => {
    expect(ACADEMY_SEN.player.codeCalloutHref).toBe("/academy");
    expect(ACADEMY_SEN.player.codeCalloutModule).toBe(
      "Yapay Zekâ Prompt Mühendisliği",
    );
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
    expect(isAcademyRetiredStorefrontSlug("02_ecommerce_ai")).toBe(false);
    expect(isAcademyRetiredStorefrontSlug("05_prompt_practice")).toBe(false);
    expect(isAcademyRetiredStorefrontSlug("03_social_media_ai")).toBe(false);
    expect(isAcademyRetiredStorefrontSlug("04_chatbot_nocode")).toBe(false);
    expect(isAcademyRetiredStorefrontSlug("01_office_ai")).toBe(false);
    for (const slug of ACADEMY_GROWTH_SKU_SLUGS) {
      expect(isAcademyRetiredStorefrontSlug(slug), slug).toBe(false);
    }
    expect([...ACADEMY_VITRINE_SLUGS_FOR_TEST]).toEqual([
      "01_office_ai",
      "02_ecommerce_ai",
      "03_social_media_ai",
      "04_chatbot_nocode",
      "05_prompt_practice",
    ]);
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
    expect(academyCourseHasSealedAudio("02_ecommerce_ai")).toBe(true);
    expect(academyCourseHasSealedAudio("05_prompt_practice")).toBe(true);
    expect(academyCourseHasSealedAudio("03_social_media_ai")).toBe(true);
    expect(academyCourseHasSealedAudio("04_chatbot_nocode")).toBe(true);
    expect(ACADEMY_SEN.catalog.audioBadge).not.toContain("Seslendirmeli");
    expect(ACADEMY_RETIRED_STOREFRONT_SLUGS).toContain("siber-guvenlik");
  });

  it("vitrin dürüstlük kilidi: beş SKU compact makale; video vaadi yok; 13 eğitim vaadi yok", () => {
    expect(ACADEMY_SEN.catalog.heroAudioBadge).toBe(
      "Sesli Anlatım + Sınav + Sertifika",
    );
    expect(ACADEMY_SEN.catalog.heroArticleBadge).toBe(
      "Makale / Okuma Metni + Uygulamalı Senaryolar + Sınav + Sertifika",
    );
    expect(ACADEMY_SEN.catalog.description).toContain("yayındadır");
    expect(ACADEMY_SEN.catalog.description).not.toContain("fırın");
    expect(ACADEMY_SEN.catalog.description).not.toContain("Çok Yakında / Hazırlanıyor");
    expect(ACADEMY_SEN.catalog.description).not.toContain("13 eğitim");
    expect(ACADEMY_SEN.catalog.description).not.toMatch(/Video/i);
    expect(ACADEMY_SEN.catalog.infoBand(1)).toContain("Test barajı 70+");
    expect(ACADEMY_SEN.catalog.infoBand(1)).not.toContain("5 yayın");
    expect(ACADEMY_SEN.catalog.infoBand(1)).not.toContain("karaoke");
    expect(JSON.stringify(ACADEMY_SEN.catalog)).not.toContain("Sesli Akademi");
    expect(readSrc("lib/copy/sen-voice/public.ts")).not.toContain("sinema kataloğu");
    expect(readSrc("lib/copy/sen-voice/public.ts")).not.toMatch(/Prompt Box videonun/i);
    expect(ACADEMY_SEN.pilotPath.steps(70)[0]?.detail).not.toMatch(/Video/i);
    expect(ACADEMY_GROWTH_SKU_SLUGS).toHaveLength(1);
    expect(ACADEMY_GROWTH_SKU_SLUGS).not.toContain("06_n8n_automation");
    const purchase = readSrc("lib/academy/purchase-path.ts");
    expect(purchase).toContain("Sesli Anlatım + Sınav + Sertifika");
    expect(purchase).toContain(
      "Makale / Okuma Metni + Uygulamalı Senaryolar + Sınav + Sertifika",
    );
    expect(ACADEMY_SEN.catalog.heroArticleBadge).not.toMatch(/Sesli Akademi/i);
    expect(ACADEMY_SEN.catalog.heroAudioBadge).not.toMatch(/Sesli Akademi/i);
    const seo = readSrc("lib/copy/seo.ts");
    expect(seo).not.toContain("13 eğitim");
    expect(readSrc("app/academy/page.tsx")).not.toContain("13 eğitim");
    expect(readSrc("components/academy/course-list.tsx")).not.toContain("13 eğitim");
  });
});
