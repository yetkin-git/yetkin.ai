import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import {
  PAGE_SEO,
  SITEMAP_STATIC_PATHS,
  isRobotsDisallowedPath,
  sitemapRoutePolicy,
} from "@/lib/copy/seo";
import { GLOSSARY_PATH, GLOSSARY_TERMS, glossaryPath } from "@/lib/copy/glossary";
import { GUIDE_HUB_PATH, PUBLIC_GUIDES, guidePath } from "@/lib/copy/guides";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

/**
 * Faz 2 / P2 — SEO ve iç keşif tedavisi.
 *
 * Kilitlenen davranışlar:
 *   1. `/sozluk` ve `/tetkik` artık ana sayfadan **doğrudan** bağ alır
 *      (yetim sayfa değil). Bağlar yasal footer'dan bağımsız bir bölümdedir.
 *   2. `/hakkimizda` ve `/iletisim` `SITEMAP_STATIC_PATHS` içinde **açık**
 *      kayıttır; footer listesinden sızıntıya bağlı değildir.
 *   3. `/magaza/[slug]` sitemap'e dinamik eklenir ve hata durumunda site
 *      haritası üretimi düşmez (güvenli boş dizi).
 */
describe("Faz 2 SEO — yetim sayfa kapanışı ve sitemap kapsamı", () => {
  it("ana sayfa yasal footer'dan bağımsız bir Kaynaklar bölümü basar", () => {
    const page = readSrc("app/(public)/page.tsx");

    expect(page).toContain("data-home-resources");
    expect(page).toContain("home-resources-heading");
    expect(page).toContain("copy.resources");
    expect(page).toContain("{copy.resourcesKicker}");
    expect(page).toContain("{copy.resourcesTitle}");
    // CTA ve başlık da kopyadan basılır (sabit metin gömülmez).
    expect(page).toContain("{resource.title}");
    expect(page).toContain("{resource.cta}");
    expect(page).toContain("href={resource.href as Route}");

    // Bölüm footer değildir: yasal bağ listesini okumaz.
    expect(page).not.toContain("LEGAL_FOOTER_LINKS");
    expect(page).not.toContain("LegalSiteFooter");
  });

  it("dört keşif yüzeyi (/sozluk, /tetkik, /rehber, /career/vitrin) doğrudan bağ alır", () => {
    const copy = SEN_VOICE.public.home;
    const hrefs = copy.resources.map((row) => row.href);
    expect(hrefs).toEqual(["/sozluk", "/tetkik", "/rehber", "/career/vitrin"]);

    // Her satır başlık + gövde + CTA taşır; boş kart basılmaz.
    for (const row of copy.resources) {
      expect(row.title.length).toBeGreaterThan(0);
      expect(row.body.length).toBeGreaterThan(20);
      expect(row.cta.length).toBeGreaterThan(0);
    }

    // Hiçbiri korumalı ya da kapalı bir odaya gitmez.
    for (const href of hrefs) {
      expect(isRobotsDisallowedPath(href), href).toBe(false);
    }
  });

  it("Kaynaklar bölümü çözüm yollarından sonra, SSS'ten önce durur (semantik sıra)", () => {
    const page = readSrc("app/(public)/page.tsx");
    const tracksAt = page.indexOf("home-tracks-heading");
    const resourcesAt = page.indexOf("data-home-resources");
    const faqAt = page.indexOf("<LandingFaq");
    expect(tracksAt).toBeGreaterThan(-1);
    expect(resourcesAt).toBeGreaterThan(tracksAt);
    expect(faqAt).toBeGreaterThan(resourcesAt);
  });

  it("/hakkimizda ve /iletisim sitemap statik listesinde açık kayıttır", () => {
    const staticPaths: readonly string[] = SITEMAP_STATIC_PATHS;
    // Footer'dan sızıntı değil: iki yol da listede doğrudan yazılı.
    expect(staticPaths).toContain("/hakkimizda");
    expect(staticPaths).toContain("/iletisim");

    // SEO meta girdileriyle aynı SSOT: yol adı tek yerde.
    expect(PAGE_SEO.about.path).toBe("/hakkimizda");
    expect(PAGE_SEO.contact.path).toBe("/iletisim");
    expect(staticPaths).toContain(PAGE_SEO.about.path);
    expect(staticPaths).toContain(PAGE_SEO.contact.path);

    // Yasal öncelik bandı korunur.
    expect(sitemapRoutePolicy("/hakkimizda")).toEqual({
      changeFrequency: "monthly",
      priority: 0.5,
    });
    expect(sitemapRoutePolicy("/iletisim")).toEqual({
      changeFrequency: "monthly",
      priority: 0.5,
    });
  });

  it("/magaza/[slug] sitemap'e dinamik girer; hata durumunda boş dizi döner", async () => {
    const sitemap = readSrc("app/sitemap.ts");
    expect(sitemap).toContain("listPublicStorefrontSlugs");
    expect(sitemap).toContain("storefrontSitemapEntries");
    expect(sitemap).toContain("/magaza/");

    const loader = readSrc("lib/commerce/storefront-sitemap.ts");
    // Fail-safe: DB yoksa veya sorgu patlarsa boş dizi, site haritası düşmez.
    expect(loader).toContain("catch");
    expect(loader).toContain("return []");
    expect(loader).toContain('status: "ACTIVE"');
    // Satılabilir satır yoksa vitrin boş içerik: listeye girmez.
    expect(loader).toContain("sellableQty");

    // Kamu önceliği: yasal bandın üstünde, ürün odalarının altında.
    expect(sitemapRoutePolicy("/magaza/ornek-magaza")).toEqual({
      changeFrequency: "weekly",
      priority: 0.4,
    });
    // `/magaza` robots tarafından kapatılmamıştır (kamu vitrini).
    expect(isRobotsDisallowedPath("/magaza/ornek-magaza")).toBe(false);

    // Sınırlı sorgu: binlerce mağaza site haritasını şişirmez.
    expect(loader).toContain("take:");
  });

  it("sitemap giriş sayısı ve sözlük/rehber kapsamı korunur", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const entries = await sitemap();
    const paths = entries.map((entry) => new URL(entry.url).pathname);

    // Statik + yasal + sözlük + rehber havuzu eksiksiz.
    for (const path of SITEMAP_STATIC_PATHS) {
      expect(paths, path).toContain(path);
    }
    expect(paths).toContain(LEGAL_HUB_FIXTURE);
    for (const term of GLOSSARY_TERMS) {
      expect(paths).toContain(glossaryPath(term.slug));
    }
    for (const guide of PUBLIC_GUIDES) {
      expect(paths).toContain(guidePath(guide.slug));
    }
    expect(paths.length).toBeGreaterThanOrEqual(64);

    // Site haritası kapalı oda basmaz.
    for (const path of paths) {
      expect(isRobotsDisallowedPath(path), path).toBe(false);
    }
  });
});

const LEGAL_HUB_FIXTURE = "/legal";

describe("Faz 2 SEO — sözlük ve rehber yollarının SSOT'u", () => {
  it("hub yolları iç bağlantı hedefleriyle aynıdır", () => {
    expect(GLOSSARY_PATH).toBe("/sozluk");
    expect(GUIDE_HUB_PATH).toBe("/rehber");
    expect(existsSync(join(ROOT, "app/(public)/sozluk/page.tsx"))).toBe(true);
    expect(existsSync(join(ROOT, "app/(public)/tetkik/page.tsx"))).toBe(true);
    expect(existsSync(join(ROOT, "app/(public)/uzmanlar/page.tsx"))).toBe(true);
    expect(existsSync(join(ROOT, "app/(public)/career/vitrin/page.tsx"))).toBe(true);
  });
});
