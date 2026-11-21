import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { COURSE_REGISTRY } from "@yetkin/kernel/catalog-ids/course-registry";
import { academyCourseSaleOpen } from "@/lib/academy/pilot-sku";
import {
  LEGAL_ABOUT_LEAD,
  LEGAL_ABOUT_STORY,
  LEGAL_ACTIVITY_SCOPE_BODY,
  LEGAL_LAUNCH_SECTIONS,
  LEGAL_SOLD_PRODUCTS_BODY,
} from "@/lib/copy/legal-launch";
import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";
import {
  PAGE_SEO,
  PRODUCT_ROOM_PATHS,
  SITEMAP_STATIC_PATHS,
  isRobotsDisallowedPath,
} from "@/lib/copy/seo";
import { ACADEMY_RETIRED_STOREFRONT_SLUGS } from "@/lib/academy/retired-storefront";
import { DRON_KAYIT } from "@/lib/dronlar/kayit";
import {
  academyShowcasePrice,
  PUBLIC_FREE_EVALUATION_LABEL,
  PUBLIC_KURUMSAL_QUOTE_LABEL,
} from "@/lib/pricing/showcase-price";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const CLOSED_ROOMS = DRON_KAYIT.filter((room) => room.kapali);

/**
 * SEO Tedavi (P0): kurs SEO sabitleri silindi (üretim ithalatçısı yoktu).
 * Kapanış kapısı artık **slug sicili** üzerinden doğrulanır: emekli her slug
 * robots dışında kalmalı ve hiçbir kamu meta girdisi o slug'ı basmamalı.
 */
const COURSE_PATHS = ACADEMY_RETIRED_STOREFRONT_SLUGS.slice(0, 6).map(
  (slug) => `/academy/${slug}`,
);

function legalCorpus(): string {
  return [
    LEGAL_SOLD_PRODUCTS_BODY,
    LEGAL_ACTIVITY_SCOPE_BODY,
    LEGAL_ABOUT_LEAD,
    ...LEGAL_ABOUT_STORY,
    ...LEGAL_LAUNCH_SECTIONS.flatMap((section) =>
      section.articles.flatMap((article) => article.paragraphs),
    ),
  ].join("\n");
}

function coversClosedRoom(path: string): boolean {
  return CLOSED_ROOMS.some((room) => path === room.path || path.startsWith(`${room.path}/`));
}

describe("kapalı oda sızıntı koruması", () => {
  it("kayıt kapalı odaları Akademi, Freelancer ve Young olarak tutar", () => {
    expect(CLOSED_ROOMS.map((room) => room.path).sort()).toEqual([
      "/academy",
      "/freelancer",
      "/young",
    ]);
  });

  it("kamu vitrini, yasal metin ve indeks kapalı odayı satılan ürün diye basmaz", () => {
    const vitrine = readSrc("lib/pricing/public-vitrine.ts");
    const legal = legalCorpus();
    for (const room of CLOSED_ROOMS) {
      expect(vitrine, room.path).not.toContain(`"${room.path}"`);
      expect(legal, room.path).not.toContain(room.path);
      expect(legal, room.label).not.toContain(room.label);
      expect(isRobotsDisallowedPath(room.path), room.path).toBe(true);
      const sitemapPaths: readonly string[] = SITEMAP_STATIC_PATHS;
      const productPaths: readonly string[] = PRODUCT_ROOM_PATHS;
      expect(
        sitemapPaths.some((path) => path === room.path || path.startsWith(`${room.path}/`)),
        room.path,
      ).toBe(false);
      expect(productPaths, room.path).not.toContain(room.path);
    }

    // SEO Tedavi (P0): hiçbir kamu meta girdisi kapalı odayı hedeflemez.
    for (const page of Object.values(PAGE_SEO)) {
      expect(coversClosedRoom(page.path), page.path).toBe(false);
      const text = [page.title, page.description, ...("keywords" in page ? page.keywords ?? [] : [])].join(
        "\n",
      );
      for (const room of CLOSED_ROOMS) {
        expect(text, page.path).not.toContain(room.path);
        expect(text, page.path).not.toContain(room.label);
      }
    }
    // Site haritası hiçbir kapalı oda yolunu taşımaz.
    const sitemapPathsAsStrings: readonly string[] = SITEMAP_STATIC_PATHS;
    for (const room of CLOSED_ROOMS) {
      expect(sitemapPathsAsStrings, room.path).not.toContain(room.path);
    }
  });

  it("kapalı odaların meta girdisi yoktur; emekli kurs slug'ı robots dışındadır", async () => {
    // SEO Tedavi (P0) — `/academy` meta girdileri ve kurs SEO sabitleri silindi.
    // Kapalı odanın SEO girdisi tutmak, hiçbir sayfanın basmadığı bir vaadi belgeleme olurdu.
    const seoModule = await import("@/lib/copy/seo");
    for (const removed of ["academy", "academyAdvanced", "academyVerify"] as const) {
      expect(removed in PAGE_SEO, removed).toBe(false);
    }
    // Modül export'u gerçekten yok (yorum metni değil, canlı API yüzeyi).
    for (const removed of [
      "OFFICE_AI_SEO",
      "OFFICE_AI_ILERI_SEO",
      "ECOMMERCE_AI_SEO",
      "SOCIAL_MEDIA_AI_SEO",
      "CHATBOT_NOCODE_SEO",
      "PROMPT_PRACTICE_SEO",
      "academyCourseSeoOverride",
      "OFFICE_AI_LESSON_TEASERS",
    ]) {
      expect(removed in seoModule, removed).toBe(false);
    }
    const jsonLdModule = await import("@/lib/copy/json-ld");
    for (const removed of [
      "courseJsonLd",
      "educationalOccupationalProgramJsonLd",
      "academyCourseBreadcrumbs",
    ]) {
      expect(removed in jsonLdModule, removed).toBe(false);
    }
    for (const coursePath of COURSE_PATHS) {
      expect(isRobotsDisallowedPath(coursePath), coursePath).toBe(true);
      expect(SITEMAP_STATIC_PATHS).not.toContain(coursePath);
    }
  });

  it("kök README ve kenar notu kapalı odayı canlı nakit diye anlatmaz", () => {
    const readme = readSrc("README.md");
    const guard = readSrc("lib/kernel/security/edge-guard.ts");
    const contexts = readSrc("lib/kernel/bounded-contexts.ts");
    expect(readme).toContain("lib/dronlar/kayit.ts");
    expect(readme).toContain("kapali: true");
    expect(readme).toContain("yetkinhibe");
    expect(readme).not.toContain("Faz 1 nakit");
    expect(readme).not.toContain("Kamu Vitrini 3");
    expect(guard).not.toContain("Tedavi_Raporu.md");
    expect(guard).toContain("lib/dronlar/kayit.ts");
    expect(contexts).not.toContain("Academy açık");
    expect(contexts).toContain("yetkinhibe");
    expect(contexts).toContain("kapali: false");
  });
});

describe("vitrin etiketi ve katalog dürüstlüğü", () => {
  it("canlı YetkinCV ve Kurumsal kartı ön talep etiketini taşımaz", () => {
    const vitrine = readSrc("lib/pricing/public-vitrine.ts");
    expect(PUBLIC_FREE_EVALUATION_LABEL).toBe("Ücretsiz Değerlendirme");
    expect(PUBLIC_KURUMSAL_QUOTE_LABEL).toBe("Kurumsal Teklif");
    expect(vitrine).toContain("PUBLIC_FREE_EVALUATION_LABEL");
    expect(vitrine).toContain("PUBLIC_KURUMSAL_QUOTE_LABEL");
    expect(vitrine).not.toContain("PUBLIC_PREORDER_LABEL");
    expect(vitrine).not.toContain("Kurumsal Tanımlama");
  });

  it("katalog satırı yoksa akademi vitrini canlı fiyat dönmez", () => {
    expect(readSrc("lib/pricing/showcase-price.ts")).not.toContain("priceSeedMinor");
    for (const card of COURSE_REGISTRY) {
      if (card.audience !== "adult" || card.lessonKeys.length === 0) {
        continue;
      }
      const missing = academyShowcasePrice({
        slug: card.slug,
        catalogAmountMinor: null,
        isPublished: true,
      });
      expect(missing.honesty, card.slug).not.toBe("live");
      expect(missing.amountMinor, card.slug).toBeNull();
      const listed = academyShowcasePrice({
        slug: card.slug,
        catalogAmountMinor: card.priceSeedMinor,
        isPublished: true,
      });
      if (academyCourseSaleOpen(card.slug)) {
        expect(listed.honesty, card.slug).toBe("live");
        expect(listed.amountMinor, card.slug).toBe(card.priceSeedMinor);
      } else {
        expect(listed.honesty, card.slug).not.toBe("live");
      }
    }
  });
});

describe("ticari oda hata sınırı", () => {
  it("fiyat, kasa, cüzdan, tezgâh ve junior yeniden dene ile panele döner", () => {
    expect(PUBLIC_SEN.error.panelRetry).toBe("Yeniden Dene");
    expect(PUBLIC_SEN.error.panelBack).toBe("Panele Dön");
    const files = [
      "app/(public)/fiyatlandirma/error.tsx",
      "app/(public)/kasa/error.tsx",
      "app/(kernel)/cuzdan/error.tsx",
      "app/tezgah/error.tsx",
      "app/junior/error.tsx",
    ];
    for (const file of files) {
      const source = readSrc(file);
      expect(source, file).toContain('backHref="/dashboard"');
      expect(source, file).toContain("panelBack");
      expect(source, file).toContain("panelRetry");
      expect(source, file).toContain("retry");
    }
  });
});
