import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { LEGAL_ENTITY, LEGAL_PAGE_TITLE, LEGAL_WHATSAPP_HREF } from "@/lib/copy/legal-launch";
import { academyVerifyShareMetadata } from "@/lib/academy/certificate-share";
import {
  ORGANIZATION_ID,
  ORGANIZATION_LOGO_PATH,
  ORGANIZATION_SAME_AS,
  WEBSITE_ID,
  breadcrumbListJsonLd,
  faqPageJsonLd,
  itemListJsonLd,
  jsonLdDocument,
  juniorOnlineCourseJsonLd,
  legalSectionBreadcrumbs,
  organizationJsonLd,
  siteGraphJsonLd,
} from "@/lib/copy/json-ld";
import {
  AUTH_ROBOTS,
  CANONICAL_SITE_ORIGIN,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  OG_IMAGE_SIZE,
  OG_LOCALE,
  PAGE_SEO,
  PRODUCT_ROOM_PATHS,
  ROBOTS_ALLOW_COURSE_PATHS,
  ROBOTS_DISALLOW_AUTH_REDIRECTS,
  ROBOTS_DISALLOW_PATHS,
  SITEMAP_STATIC_PATHS,
  isRobotsDisallowedPath,
  JUNIOR_SEO_BRAND,
  JUNIOR_TITLE_TEMPLATE,
  TITLE_TEMPLATE,
  canonicalUrl,
  juniorLessonSeoTitle,
  pageMetadata,
  SITE_CONTENT_REVISED_AT,
  sitemapRoutePolicy,
} from "@/lib/copy/seo";
import { readSitemapLastModified, resolveSitemapLastModified } from "@/lib/copy/sitemap-lastmod";
import { readGoogleSiteVerification } from "@/lib/copy/site-verification";
import { juniorCoverAlt } from "@/lib/junior/cover-alt";
import { juniorFreeLessonKeys } from "@/lib/junior/catalog";
import {
  JUNIOR_ELECTIVE_PUBLIC_OPENERS,
  JUNIOR_ELECTIVE_SLUGS,
  JUNIOR_FREE_LESSON_KEY,
  JUNIOR_PILOT_SLUGS,
} from "@/lib/junior/limits";
import {
  JUNIOR_DESCRIPTION_MAX,
  juniorLandingJsonLd,
  juniorLessonPageMetadata,
  juniorPublicLessonJsonLd,
  juniorSeoDescription,
} from "@/lib/junior/seo";
import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { CAREER_SEN } from "@/lib/copy/sen-voice/career";
import {
  CAREER_LANDING_FAQ,
  HOME_LANDING_FAQ,
  SEM_LANDING_KEYWORDS,
  VIZE_LANDING_FAQ,
} from "@/lib/copy/sem-keywords";
import { SEM_CONVERSION_EVENT, SEM_CONVERSION_NAMES } from "@/lib/kernel/sem/conversion";
import * as jsonLdExports from "@/lib/copy/json-ld";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function sitemapPathname(url: string): string {
  const parsed = new URL(url);
  return parsed.pathname === "" ? "/" : parsed.pathname;
}

describe("Aşama 1 SEO yüzeyi", () => {
  it("kök layout metadataBase, title şablonu, canonical ve OG/Twitter taşır", () => {
    const layout = readSrc("app/layout.tsx");
    expect(CANONICAL_SITE_ORIGIN).toBe("https://yetkin.ai");
    expect(TITLE_TEMPLATE).toBe(`%s · ${YETKIN_BRAND}`);
    expect(OG_LOCALE).toBe("tr_TR");
    expect(layout).toContain("metadataBase");
    expect(layout).toContain("CANONICAL_SITE_ORIGIN");
    expect(layout).toContain("TITLE_TEMPLATE");
    expect(layout).toContain("default: YETKIN_BRAND");
    expect(layout).not.toContain("PUBLIC_SEN.home.title");
    expect(layout).not.toContain("alternates:");
    expect(layout).toContain("openGraph");
    expect(layout).toContain("twitter");
    const home = pageMetadata(PAGE_SEO.home);
    expect(home.alternates).toMatchObject({ canonical: "https://yetkin.ai/" });
  });

  it("ana sayfa ve kariyer özgün title/description taşır; 410 freelancer'ın SEO girdisi yoktur", () => {
    expect(PAGE_SEO.home.title).toBe(PUBLIC_SEN.home.title);
    expect(PAGE_SEO.career.title).not.toBe(PAGE_SEO.home.title);
    expect(PAGE_SEO.home.description).not.toBe(PAGE_SEO.career.description);
    expect(readSrc("app/(public)/page.tsx")).toContain("PAGE_SEO.home");
    expect(readSrc("app/career/page.tsx")).toContain("PAGE_SEO.career");
    // PayTR B2C (E7): 410 dönen odanın meta girdisi sahipsiz kalmaz.
    expect("freelancer" in PAGE_SEO).toBe(false);
    expect(readSrc("lib/copy/seo.ts")).not.toContain("freelancer:");
    expect(readSrc("app/freelancer/page.tsx")).not.toContain("PAGE_SEO.freelancer");
    expect(readSrc("app/freelancer/page.tsx")).toContain("index: false");
  });

  it("kamuya açık ana sayfalar Open Graph tr_TR ve Twitter Card giyer", () => {
    const helper = readSrc("lib/copy/seo.ts");
    expect(helper).toContain("openGraph");
    expect(helper).toContain("locale: OG_LOCALE");
    expect(helper).toContain('card: "summary_large_image"');
    expect(helper).toContain("canonicalUrl(path)");
    expect(PAGE_SEO.home.image).toBe(DEFAULT_OG_IMAGE);
    expect(DEFAULT_OG_IMAGE).toBe("/opengraph-image");
    expect(DEFAULT_OG_IMAGE_ALT).toContain(PUBLIC_SEN.home.title);
    expect(OG_IMAGE_SIZE).toEqual({ width: 1200, height: 630 });
    const homeMeta = pageMetadata(PAGE_SEO.home);
    expect(homeMeta.openGraph).toMatchObject({
      images: [{ url: DEFAULT_OG_IMAGE, alt: PAGE_SEO.home.title }],
    });
    expect(homeMeta.twitter).toMatchObject({
      card: "summary_large_image",
      images: [DEFAULT_OG_IMAGE],
    });
    expect(existsSync(join(ROOT, "app/opengraph-image.tsx"))).toBe(true);
    expect(existsSync(join(ROOT, "app/twitter-image.tsx"))).toBe(true);
    expect(readSrc("app/opengraph-image.tsx")).toContain("ImageResponse");
    expect(readSrc("app/opengraph-image.tsx")).toContain("OG_IMAGE_SIZE");
    expect(readSrc("app/twitter-image.tsx")).toContain("./opengraph-image");
    expect(existsSync(join(ROOT, "archived/academy/app/dogrula/[hash]/opengraph-image.tsx"))).toBe(true);
    expect(readSrc("archived/academy/app/dogrula/[hash]/twitter-image.tsx")).toContain("./opengraph-image");
    for (const file of [
      "archived/academy/app/page.tsx",
      "app/(public)/iletisim/page.tsx",
      "app/(public)/legal/page.tsx",
    ]) {
      expect(readSrc(file), file).toContain("pageMetadata");
    }
    expect(readSrc("archived/academy/app/layout.tsx")).not.toContain("pageMetadata");
    expect(readSrc("app/(public)/kasa/page.tsx")).toContain('path: "/kasa"');
    expect(readSrc("app/(public)/kasa/donus/page.tsx")).toContain('path: "/kasa/donus"');
    expect(readSrc("app/(auth)/sifremi-unuttum/page.tsx")).toContain('path: "/sifremi-unuttum"');
    expect(readSrc("app/(auth)/sifre-yenile/page.tsx")).toContain('path: "/sifre-yenile"');
    expect(readSrc("archived/academy/app/[slug]/oyna/page.tsx")).toContain("/oyna");
    expect(readSrc("archived/academy/app/[slug]/cikis-paketi/page.tsx")).toContain("/cikis-paketi");
  });

  it("giriş ve kayıt noindex, follow taşır", () => {
    expect(AUTH_ROBOTS).toEqual({ index: false, follow: true });
    expect(readSrc("app/(auth)/layout.tsx")).toContain("AUTH_ROBOTS");
    expect(readSrc("app/(auth)/login/page.tsx")).toContain("AUTH_ROBOTS");
    expect(readSrc("app/(auth)/register/page.tsx")).toContain("AUTH_ROBOTS");
    expect(readSrc("app/(auth)/login/page.tsx")).toContain("PAGE_SEO.login");
    expect(readSrc("app/(auth)/register/page.tsx")).toContain("PAGE_SEO.register");
    expect(readSrc("app/career/page.tsx")).not.toContain("AUTH_ROBOTS");
    const careerMeta = pageMetadata(PAGE_SEO.career);
    expect(careerMeta.robots).toBeUndefined();
    expect(careerMeta.alternates).toMatchObject({ canonical: "https://yetkin.ai/career" });
  });
});

describe("Aşama 2 SEO — ürün odaları ve dinamik sitemap", () => {
  it("kurs generateMetadata başlık, özet ve kapak og:image basar", () => {
    // Arşiv sayfası canlı ürün değildir; sözleşme `pageMetadata` üzerinden doğrulanır.
    const meta = pageMetadata({
      title: "Python Temel · Akademi",
      description: "Python ile programlamanın temelleri.",
      path: "/academy/python-temel",
      image: DEFAULT_OG_IMAGE,
    });
    expect(meta.openGraph).toMatchObject({
      images: [{ url: DEFAULT_OG_IMAGE, alt: "Python Temel · Akademi" }],
    });
    expect(meta.twitter).toMatchObject({
      images: [DEFAULT_OG_IMAGE],
    });
  });

  it("eski /academy/courses/[slug] alias'ı ve emekli SKU 301 bloğu kaldırıldı; /verify canlı kalır", () => {
    const config = readSrc("next.config.ts");
    // SEO Tedavi (P0) — 301 → 410 zinciri kırıldı.
    expect(config).not.toContain('source: "/academy/courses/:slug"');
    expect(config).not.toContain("academyRetiredStorefrontRedirects");
    expect(config).not.toContain("destination: \"https://yetkin.ai/academy\"");
    // Emekli slug artık doğrudan 410 alır; 404 basmak yönlendirmeyi gölgelemez.
    expect(readSrc("lib/academy/retired-storefront.ts")).toContain("ACADEMY_RETIRED_STOREFRONT_SLUGS");
    // Korunması zorunlu canlı yönlendirmeler.
    expect(config).toContain('source: "/verify"');
    expect(config).toContain('destination: "https://yetkin.ai/vize"');
    expect(config).toContain('source: "/verify/:hash"');
    expect(config).toContain('destination: "https://yetkin.ai/vize/:hash"');
    expect(config).toContain('source: "/academy/dogrula/:hash"');
    expect(config).toContain('destination: "https://yetkin.ai/vize/:hash"');
    expect(config).toContain('source: "/p/:id"');
    expect(config).toContain('destination: "https://yetkin.ai/vize/:id"');
  });

  it("301 kural sayısı /academy hedefli blok kaldırıldığı için düştü", async () => {
    const { default: nextConfig } = await import("../../next.config");
    const rules = await nextConfig.redirects();
    const academyTargets = rules.filter((rule) => rule.destination === "https://yetkin.ai/academy");
    // Eski blok 318 kural üretiyordu (106 slug × 3) — hepsi 410'a düşüyordu.
    expect(academyTargets).toEqual([]);
    expect(rules.length).toBeLessThan(40);
    // Doğrulama yüzeyi yönlendirmesi korunur.
    expect(rules.some((rule) => rule.source === "/verify" && rule.destination === "https://yetkin.ai/vize")).toBe(true);
  });

  it("sitemap ürün odaları, iletişim/yasal ve yayın kurslarını doğru öncelikle basar", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://yetkin-ai.vercel.app");
    const { default: sitemap } = await import("@/app/sitemap");
    const entries = await sitemap();
    const byPath = new Map(entries.map((entry) => [sitemapPathname(entry.url), entry]));

    expect(PRODUCT_ROOM_PATHS).toEqual(["/career"]);
    // Kök marka iniş sayfası artık indekslenebilir (P1 tedavi).
    expect(byPath.has("/")).toBe(true);
    for (const path of ["/vize", "/legal", "/iletisim", "/hakkimizda"]) {
      expect(byPath.has(path), path).toBe(true);
    }
    expect(byPath.has("/academy")).toBe(false);
    expect(byPath.has("/academy/dogrula")).toBe(false);
    expect(byPath.has("/career")).toBe(true);
    expect(byPath.get("/career")?.priority).toBe(0.9);
    expect(byPath.has("/junior")).toBe(false);
    expect(byPath.has(`/junior/ders/${JUNIOR_FREE_LESSON_KEY}`)).toBe(false);
    expect(byPath.has("/junior/ders/jr_06_ing_main-20")).toBe(false);
    expect(byPath.has("/junior/ders/jr_06_ing_main-1")).toBe(false);
    expect(byPath.has("/junior/ders/jr_06_mat-1")).toBe(false);
    expect(byPath.has("/junior/ders/jr_06_mat-2")).toBe(false);
    expect(byPath.has("/junior/checkout")).toBe(false);

    // SEO Tedavi (P0): Akademi kursları site haritasına hiç yazılmaz ve
    // sitemap politikası ölü `/academy/*` yüksek önceliğini artık taşımaz.
    expect(sitemapRoutePolicy("/academy")).toEqual({ changeFrequency: "weekly", priority: 0.7 });
    expect(sitemapRoutePolicy("/academy/python-temel")).toEqual({
      changeFrequency: "weekly",
      priority: 0.7,
    });
    expect(sitemapRoutePolicy("/").priority).toBe(1);
    expect(sitemapRoutePolicy("/career").priority).toBe(0.9);
    expect(sitemapRoutePolicy("/e-ticaret").priority).toBe(0.9);
    for (const path of ["/academy", "/academy/01_office_ai", "/academy/dogrula"]) {
      expect(byPath.has(path), path).toBe(false);
    }

    expect(entries).toHaveLength(byPath.size);
    expect(entries.length).toBeGreaterThanOrEqual(7 + PRODUCT_ROOM_PATHS.length);
    // SEO Tedavi (P1) — sabit mühür yok; üretim anı dinamik basılır.
    expect(readSrc("app/sitemap.ts")).not.toContain('new Date("2026-09-05")');
    expect(readSrc("app/sitemap.ts")).not.toContain("new Date()");
    const clock = readSrc("lib/copy/sitemap-lastmod.ts");
    for (const literal of [
      "lib/copy/seo.ts",
      "lib/copy/legal-launch.ts",
      "lib/copy/json-ld.ts",
      "lib/junior/limits.ts",
      "lib/academy/pilot-sku.ts",
      "app/sitemap.ts",
    ]) {
      expect(clock).toContain(`statSync(join(process.cwd(), "${literal}"))`);
    }
    expect(clock).not.toMatch(/statSync\(join\(process\.cwd\(\),\s*[A-Za-z_][\w]*\s*\)\)/);
    const revised = readSitemapLastModified();
    expect(revised.getTime()).toBeGreaterThanOrEqual(SITE_CONTENT_REVISED_AT.getTime());
    expect(revised.getUTCHours()).toBe(0);
    expect(revised.getTime()).toBeLessThanOrEqual(Date.now());
    for (const entry of entries) {
      expect(entry.lastModified, entry.url).toEqual(revised);
      const loc = new URL(entry.url);
      expect(loc.origin, entry.url).toBe("https://yetkin.ai");
      expect(isRobotsDisallowedPath(loc.pathname), entry.url).toBe(false);
    }
    vi.unstubAllEnvs();
  });

  it("lastmod istek saatini basmaz; içerik günü ve gelecek mühür tavanı dürüsttür", () => {
    const floor = new Date("2026-10-27T00:00:00.000Z");
    const now = Date.parse("2026-10-31T18:22:11.000Z");
    expect(
      resolveSitemapLastModified({
        floor,
        envStamp: null,
        fileMtimesMs: [Date.parse("2026-10-20T12:00:00.000Z")],
        nowMs: now,
      }).toISOString(),
    ).toBe("2026-10-27T00:00:00.000Z");
    expect(
      resolveSitemapLastModified({
        floor,
        envStamp: null,
        fileMtimesMs: [Date.parse("2026-10-31T15:04:00.000Z")],
        nowMs: now,
      }).toISOString(),
    ).toBe("2026-10-31T00:00:00.000Z");
    expect(
      resolveSitemapLastModified({
        floor,
        envStamp: "2026-10-30",
        fileMtimesMs: [Date.parse("2026-10-31T15:04:00.000Z")],
        nowMs: now,
      }).toISOString(),
    ).toBe("2026-10-30T00:00:00.000Z");
    expect(
      resolveSitemapLastModified({
        floor,
        envStamp: "2027-01-01",
        fileMtimesMs: [],
        nowMs: now,
      }).toISOString(),
    ).toBe("2026-10-31T00:00:00.000Z");
    expect(readGoogleSiteVerification({})).toBeNull();
    expect(readGoogleSiteVerification({ GOOGLE_SITE_VERIFICATION: "short" })).toBeNull();
    expect(readGoogleSiteVerification({ GOOGLE_SITE_VERIFICATION: "<script>alert(1)</script>" })).toBeNull();
    expect(readGoogleSiteVerification({ NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: "abcdefghijklmnopqrst" })).toBe(
      "abcdefghijklmnopqrst",
    );
    expect(readSrc("app/layout.tsx")).toContain("readGoogleSiteVerification");
    expect(readSrc("app/layout.tsx")).toContain("verification");
  });

  it("robots allow listesi sitemap statik yollarıyla aynı SSOT'tur; sığınaklar disallow", async () => {
    const { default: robots } = await import("@/app/robots");
    const rules = robots().rules;
    const rule = Array.isArray(rules) ? rules[0] : rules;
    expect(SITEMAP_STATIC_PATHS).toEqual([
      // Kök marka iniş sayfası (P1 tedavi): 308 kilidi kalktı, index:true.
      "/",
      "/rehber",
      "/career",
      "/tezgah",
      "/fiyatlandirma",
      "/e-ticaret",
      // YetkinHibe kamu odası (`app/(public)/hibe`) — site haritası kaydı.
      "/hibe",
      "/kurumsal",
      "/vize",
      "/career/vitrin",
      "/sozluk",
      "/tetkik",
      // Faz 2 (SEO P2): footer'dan bağımsız açık kayıt.
      "/hakkimizda",
      "/iletisim",
    ]);
    expect(SITEMAP_STATIC_PATHS).toContain("/");
    expect(rule?.userAgent).toEqual(["*", "Googlebot"]);
    expect(rule?.allow).toEqual(expect.arrayContaining([...SITEMAP_STATIC_PATHS, "/legal"]));
    expect(rule?.allow).toEqual(expect.arrayContaining(["/career", "/vize"]));
    expect(rule?.disallow).toEqual(expect.arrayContaining(["/academy"]));
    expect(rule?.disallow).toEqual(expect.arrayContaining([...ROBOTS_DISALLOW_PATHS]));
    expect(rule?.disallow).toEqual(expect.arrayContaining([...ROBOTS_DISALLOW_AUTH_REDIRECTS]));
    expect(isRobotsDisallowedPath("/career")).toBe(false);
    expect(isRobotsDisallowedPath("/kariyer")).toBe(true);
    expect(isRobotsDisallowedPath("/academy/01_office_ai/oyna")).toBe(true);
    expect(isRobotsDisallowedPath("/academy/01_office_ai")).toBe(true);
    expect(isRobotsDisallowedPath("/profil")).toBe(true);
    expect(isRobotsDisallowedPath("/profile")).toBe(true);
    // E-ticaret kokpiti robots'ta kapalı; kamu vitrini `/e-ticaret` açık kalır.
    expect(isRobotsDisallowedPath("/panel/e-ticaret")).toBe(true);
    expect(isRobotsDisallowedPath("/magazam/yeni")).toBe(true);
    expect(isRobotsDisallowedPath("/e-ticaret")).toBe(false);
    expect(rule?.disallow).toEqual(
      expect.arrayContaining(["/dashboard", "/freelancer", "/login", "/api/"]),
    );
    // SEO Tedavi (P1) — duvar arkası oynatıcı crawl edilmez.
    expect(ROBOTS_DISALLOW_PATHS).toContain("/academy/*/oyna");
    expect(ROBOTS_DISALLOW_PATHS).toContain("/academy/*/cikis-paketi");
    expect(rule?.disallow).toEqual(expect.arrayContaining(["/academy/*/oyna"]));
    expect(rule?.disallow).toEqual(expect.arrayContaining(["/academy/*/cikis-paketi"]));
    expect(ROBOTS_ALLOW_COURSE_PATHS).toEqual([]);
    for (const coursePath of [
      "/academy/01_office_ai",
      "/academy/01_office_ai_ileri",
      "/academy/02_ecommerce_ai",
      "/academy/03_social_media_ai",
      "/academy/04_chatbot_nocode",
      "/academy/05_prompt_practice",
    ]) {
      expect(rule?.allow ?? []).not.toContain(coursePath);
    }
    expect(isRobotsDisallowedPath("/academy/02_ecommerce_ai")).toBe(true);
    expect(isRobotsDisallowedPath("/academy/01_office_ai_ileri")).toBe(true);
    expect(isRobotsDisallowedPath("/academy/01_office_ai_ileri/oyna")).toBe(true);
    expect(isRobotsDisallowedPath("/junior")).toBe(true);
    expect(isRobotsDisallowedPath("/junior/ders/jr_06_mat-1")).toBe(true);
    expect(isRobotsDisallowedPath("/junior/checkout")).toBe(true);
    expect(ROBOTS_DISALLOW_PATHS).toContain("/junior");
    expect(ROBOTS_DISALLOW_PATHS).toContain("/junior/checkout");
    expect(ROBOTS_DISALLOW_PATHS).toContain("/admin");
    expect(isRobotsDisallowedPath("/admin/ops")).toBe(true);
    expect(isRobotsDisallowedPath("/rehber")).toBe(false);
    expect(SITEMAP_STATIC_PATHS).not.toContain("/admin");
    expect(SITEMAP_STATIC_PATHS).not.toContain("/kariyer");
    expect(ROBOTS_DISALLOW_PATHS).toContain("/dashboard");
  });
});

describe("Junior SEO — 6. sınıf başlık, schema ve kapak", () => {
  it("ders başlığı şablonu tam dizgiyi basar ve kanonik adres mutlaktır", () => {
    const title = juniorLessonSeoTitle("Üslü ifadede taban ve üs", "Matematik");
    expect(title).toBe("Üslü ifadede taban ve üs - 6. Sınıf Matematik | yetkin.ai Junior");
    expect(JUNIOR_TITLE_TEMPLATE).toBe(`%s | ${JUNIOR_SEO_BRAND}`);
    expect(PAGE_SEO.junior.description.length).toBeLessThanOrEqual(JUNIOR_DESCRIPTION_MAX);
    const meta = pageMetadata({
      title,
      description: juniorSeoDescription(
        "Üslü ifade, aynı doğal sayının üst üste çarpımıdır. Taban çarpılan sayıdır.",
      ),
      path: "/junior/ders/jr_06_mat-1",
      keywords: [...PAGE_SEO.junior.keywords],
      image: "/media/junior/covers/jr_06_mat-1.jpg",
    });
    expect(meta.title).toEqual({ absolute: title });
    expect(meta.alternates).toMatchObject({
      canonical: "https://yetkin.ai/junior/ders/jr_06_mat-1",
    });
    expect(meta.openGraph).toMatchObject({
      locale: "tr_TR",
      url: "https://yetkin.ai/junior/ders/jr_06_mat-1",
      title,
      images: [{ url: "/media/junior/covers/jr_06_mat-1.jpg", alt: title }],
    });
    expect(meta.keywords).toEqual([...PAGE_SEO.junior.keywords]);
  });

  it("Junior ders sayfaları arama dizinine kapalıdır", () => {
    const free = juniorLessonPageMetadata(JUNIOR_FREE_LESSON_KEY);
    expect(free.title).toEqual({
      absolute: "Çarpanlar, Katlar ve Bölünebilme - 6. Sınıf Matematik | yetkin.ai Junior",
    });
    expect(free.robots).toEqual({ index: false, follow: false });
    const unknown = juniorLessonPageMetadata("jr_06_mat-99");
    expect(unknown.robots).toEqual({ index: false, follow: false });
    expect(juniorPublicLessonJsonLd("jr_06_mat-99")).toBeNull();
    const locked = juniorLessonPageMetadata("jr_06_mat-2");
    expect(locked.robots).toEqual({ index: false, follow: false });
    expect(locked).not.toHaveProperty("alternates");
    const lessonLd = juniorPublicLessonJsonLd(JUNIOR_FREE_LESSON_KEY);
    expect(lessonLd?.["@graph"].map((node) => node["@type"])).toEqual(["Course", "FAQPage"]);
    expect(juniorPublicLessonJsonLd("jr_06_mat-2")).toBeNull();
    const landing = juniorLandingJsonLd();
    expect(landing["@graph"].map((node) => node["@type"])).toEqual(["Course", "FAQPage"]);
    const course = juniorOnlineCourseJsonLd({
      name: "Üslü ifadede taban ve üs",
      description: "Üslü ifade, aynı doğal sayının üst üste çarpımıdır.",
      path: "/junior/ders/jr_06_mat-1",
      subject: "Matematik",
      isAccessibleForFree: true,
    });
    expect(course.educationalLevel).toBe("6. Sınıf");
    expect(course.isAccessibleForFree).toBe(true);
    expect(course.hasCourseInstance).toMatchObject({
      courseMode: "Online",
      offers: { price: "0", priceCurrency: "TRY" },
    });
    const layout = readSrc("app/junior/layout.tsx");
    expect(layout).toContain("JUNIOR_TITLE_TEMPLATE");
    expect(layout).toContain("redirectUnlessJuniorVisible");
    expect(layout).not.toContain("alternates:");
    expect(layout).toContain("index: false");
    expect(readSrc("app/junior/page.tsx")).toContain("pageMetadata");
    expect(readSrc("app/junior/page.tsx")).toContain("juniorLandingJsonLd");
    expect(readSrc("app/junior/ders/[lessonKey]/page.tsx")).toContain("generateMetadata");
    expect(readSrc("app/junior/checkout/page.tsx")).toContain("index: false");
    expect(readSrc("app/layout.tsx")).toContain("keywords");
    expect(readSrc("components/junior/lesson-covers.tsx")).toContain("juniorCoverAlt");
    expect(readSrc("components/junior/lesson-covers.tsx")).toContain("juniorCoverSrc");
    expect(readSrc("components/junior/lesson-covers.tsx")).not.toContain('alt=""');
    expect(readSrc("components/junior/lesson-covers.tsx")).toContain("onError");
    expect(readSrc("components/junior/lesson-covers.tsx")).toContain("juniorCoverDecodeFailed");
    expect(readSrc("components/junior/lesson-covers.tsx")).toContain("FallbackLessonCover");
    expect(juniorCoverAlt({ title: "Üslü ifadede taban ve üs", subject: "Matematik", grade: 6 })).toBe(
      "Üslü ifadede taban ve üs - 6. Sınıf Matematik",
    );
    const freeKeys = juniorFreeLessonKeys();
    expect(freeKeys).toContain(JUNIOR_FREE_LESSON_KEY);
    expect(freeKeys).toContain("jr_06_mat-1");
    expect(freeKeys).not.toContain("jr_06_mat-2");
    const openers = JUNIOR_PILOT_SLUGS.map((slug) =>
      slug === "jr_06_ing_main" ? "jr_06_ing_main-20" : `${slug}-1`,
    );
    for (const slug of JUNIOR_ELECTIVE_SLUGS) {
      // Her seçmeli kartta yalnız 1. konu ücretsiz; 2. konu pakete kalır.
      expect(freeKeys).toContain(`${slug}-1`);
      expect(freeKeys).not.toContain(`${slug}-2`);
    }
    expect(freeKeys).toContain("jr_06_ing_main-20");
    expect(freeKeys).not.toContain("jr_06_ing_main-1");
    expect(JUNIOR_FREE_LESSON_KEY).toBe("jr_06_mat-1");
    expect(freeKeys).not.toContain("jr_06_mat-4");
    expect([...freeKeys].sort()).toEqual(
      [
        ...new Set([
          ...openers.filter((key) => key !== "jr_06_mat-1"),
          JUNIOR_FREE_LESSON_KEY,
          ...JUNIOR_ELECTIVE_PUBLIC_OPENERS,
        ]),
      ].sort(),
    );
    expect(readSrc("app/sitemap.ts")).not.toContain("@/lib/junior/catalog");
  });
});

describe("Aşama 3 SEO — JSON-LD yapısal veri", () => {
  it("Organization legalName sicil unvanını taşır; ana sayfa görünür DOM künye basmaz", () => {
    expect(readSrc("lib/copy/json-ld.ts")).toContain("legalName: LEGAL_ENTITY.tradeName");
    expect(organizationJsonLd().legalName).toBe(LEGAL_ENTITY.tradeName);
    expect(readSrc("app/(public)/page.tsx")).not.toContain("Yapınet");
    expect(readSrc("app/(public)/page.tsx")).not.toContain(LEGAL_ENTITY.vkn);
    expect(readSrc("app/(public)/page.tsx")).not.toContain(LEGAL_ENTITY.mersis);
    expect(readSrc("components/legal/legal-site-footer.tsx")).not.toContain("LEGAL_ENTITY");
    expect(readSrc("components/legal/legal-colophon-strip.tsx")).not.toContain("LEGAL_ENTITY.");
  });

  it("kök layout Organization ve WebSite grafiğini basar", () => {
    const layout = readSrc("app/layout.tsx");
    expect(layout).toContain("JsonLd");
    expect(layout).toContain("siteGraphJsonLd");
    expect(canonicalUrl("/icon.svg")).toBe("https://yetkin.ai/icon.svg");
    expect(canonicalUrl("/")).toBe("https://yetkin.ai/");

    const graph = siteGraphJsonLd();
    expect(graph["@context"]).toBe("https://schema.org");
    const org = graph["@graph"].find((node) => node["@type"] === "Organization");
    const site = graph["@graph"].find((node) => node["@type"] === "WebSite");
    expect(org).toMatchObject({
      "@id": ORGANIZATION_ID,
      name: YETKIN_BRAND,
      legalName: LEGAL_ENTITY.tradeName,
      url: CANONICAL_SITE_ORIGIN,
      email: LEGAL_ENTITY.supportEmail,
    });
    expect(org?.logo).toEqual({
      "@type": "ImageObject",
      url: canonicalUrl(ORGANIZATION_LOGO_PATH),
    });
    expect(ORGANIZATION_SAME_AS).toEqual([LEGAL_WHATSAPP_HREF]);
    expect(org?.sameAs).toEqual([LEGAL_WHATSAPP_HREF]);
    expect(site).toMatchObject({
      "@id": WEBSITE_ID,
      name: YETKIN_BRAND,
      url: "https://yetkin.ai/",
    });
    expect(site?.potentialAction).toBeUndefined();
    expect(readSrc("lib/copy/json-ld.ts")).not.toContain("SearchAction");
    expect(readSrc("lib/copy/json-ld.ts")).not.toContain("academy?q=");
  });

  it("kurs Course ve BreadcrumbList giyen sayfa arşivde; canlı şema yalnız kök graf", () => {
    // Yorum satırı eski adı anabilir; canlı export yüzeyi denetlenir.
    expect("courseJsonLd" in jsonLdExports).toBe(false);
    const crumbs = legalSectionBreadcrumbs({ slug: "gizlilik", title: "Gizlilik Politikası" });
    expect(crumbs.map((row) => row.path)).toEqual(["/", "/legal", "/legal/gizlilik"]);
  });

  it("yasal derinlik sayfası BreadcrumbList giyer; script kaçışı kapanır", () => {
    const slug = readSrc("app/(public)/legal/[slug]/page.tsx");
    expect(slug).toContain("legalSectionBreadcrumbs");
    expect(slug).toContain("breadcrumbListJsonLd");
    const jsonLdSource = readSrc("lib/copy/json-ld.ts");
    expect(readSrc("components/seo/json-ld.tsx")).toContain("application/ld+json");
    expect(readSrc("components/seo/json-ld.tsx")).toContain("serializeJsonLd");
    // `</script>` kırılması ve Cloudflare e-posta gizleme çakışması kapanır.
    expect(jsonLdSource).toContain(".replace(/</g, \"\\\\u003c\")");
    expect(jsonLdSource).toContain("\\\\u0040");
    const crumbs = legalSectionBreadcrumbs({
      slug: "gizlilik",
      title: "Gizlilik Politikası ve KVKK Aydınlatma Metni",
    });
    expect(crumbs.map((row) => row.path)).toEqual(["/", "/legal", "/legal/gizlilik"]);
    expect(crumbs[1]?.name).toBe(LEGAL_PAGE_TITLE);
    const document = jsonLdDocument([breadcrumbListJsonLd(crumbs)]);
    expect(document["@graph"][0]?.["@type"]).toBe("BreadcrumbList");
  });

  it("FAQPage ve ItemList JSON-LD basar; görünür FAQ ile aynı soruları taşır", () => {
    const home = readSrc("app/(public)/page.tsx");
    const academy = readSrc("archived/academy/app/page.tsx");
    const career = readSrc("app/career/page.tsx");
    const vize = readSrc("app/(public)/vize/page.tsx");
    expect(home).toContain("faqPageJsonLd");
    expect(home).toContain("HOME_LANDING_FAQ");
    expect(home).toContain("LandingFaq");
    expect(academy).toContain("faqPageJsonLd");
    expect(academy).not.toContain("itemListJsonLd");
    expect(career).toContain("CAREER_LANDING_FAQ");
    expect(vize).toContain("VIZE_LANDING_FAQ");
    const faq = faqPageJsonLd(HOME_LANDING_FAQ);
    expect(faq["@type"]).toBe("FAQPage");
    expect(faq.mainEntity).toHaveLength(HOME_LANDING_FAQ.length);
    expect((faq.mainEntity as Array<{ name: string }>)[0]?.name).toBe(HOME_LANDING_FAQ[0]?.question);
    const list = itemListJsonLd({
      name: ACADEMY_SEN.catalog.boardTitle,
      path: "/academy",
      items: [{ name: "Ofis", path: "/academy/01_office_ai" }],
    });
    expect(list).toMatchObject({
      "@type": "ItemList",
      numberOfItems: 1,
      url: "https://yetkin.ai/academy",
    });
  });
});

describe("Aşama 4 SEM — Kalite Puanı anahtar kelime ve dönüşüm kancası", () => {
  function haystack(parts: readonly string[]): string {
    return parts.join("\n").toLocaleLowerCase("tr");
  }

  it("hedef anahtar kelimeler H1/H2, gövde, meta ve FAQ’da durur", () => {
    expect(PAGE_SEO.home.title).toBe(PUBLIC_SEN.home.title);
    expect(PAGE_SEO.career.title.toLocaleLowerCase("tr")).toContain("kariyer");
    expect(PAGE_SEO.career.title.toLocaleLowerCase("tr")).toContain("yetkincv");
    // Kapalı Akademi meta girdisi silindi (SEO Tedavi P0): basan sayfa yok.
    expect("academy" in PAGE_SEO).toBe(false);
    expect(CAREER_SEN.eyebrow.toLocaleLowerCase("tr")).toBe("kariyer");
    expect(CAREER_SEN.title.toLocaleLowerCase("tr")).toBe("kariyer");
    expect(CAREER_SEN.description.toLocaleLowerCase("tr")).toContain("yetkincv");
    expect(PUBLIC_SEN.home.chainTitle.toLocaleLowerCase("tr")).toContain("dört adım");
    expect(readSrc("app/(public)/page.tsx")).toContain("<h2");
    expect(readSrc("app/(public)/page.tsx")).toContain("home-chain-heading");
    expect(readSrc("app/(public)/page.tsx")).toContain("home-tracks-heading");
    expect(PAGE_SEO.career.image).toBe(DEFAULT_OG_IMAGE);
    expect(pageMetadata(PAGE_SEO.career).openGraph).toMatchObject({
      title: PAGE_SEO.career.title,
      description: PAGE_SEO.career.description,
    });

    const homeText = haystack([
      PUBLIC_SEN.home.title,
      PUBLIC_SEN.home.description,
      PUBLIC_SEN.home.chainTitle,
      ...PUBLIC_SEN.home.chain.flatMap((step) => [step.title, step.body]),
      PUBLIC_SEN.home.tracksTitle,
      ...PUBLIC_SEN.home.tracks.flatMap((track) => [track.title, track.body]),
      PAGE_SEO.home.title,
      PAGE_SEO.home.description,
      ...HOME_LANDING_FAQ.flatMap((row) => [row.question, row.answer]),
    ]);
    const careerText = haystack([
      CAREER_SEN.title,
      CAREER_SEN.description,
      PAGE_SEO.career.title,
      PAGE_SEO.career.description,
      CAREER_SEN.publicPage.landingTitle,
      CAREER_SEN.publicPage.landingLead,
      PAGE_SEO.publicTalent.title,
      PAGE_SEO.publicTalent.description,
      ...CAREER_LANDING_FAQ.flatMap((row) => [row.question, row.answer]),
      ...VIZE_LANDING_FAQ.flatMap((row) => [row.question, row.answer]),
    ]);
    // Kök layout aktif ürün niyetlerini taşır; kapalı Akademi niyeti köke sızmaz.
    expect(SEM_LANDING_KEYWORDS).toEqual([
      "yapay zeka iş araçları",
      "kobi yapay zeka",
      "e-ticaret yönetim paneli",
      "kosgeb hibe bulucu",
      "yapay zeka belge oluşturucu",
      "aday değerlendirme testi",
    ]);
    expect(readSrc("app/layout.tsx")).toContain("SEM_LANDING_KEYWORDS");
    expect(readSrc("app/layout.tsx")).not.toContain("OFFICE_AI_SEM_KEYWORDS");
    expect(homeText).toContain("yapay zeka araçları");
    // tr locale: "AI" → "aı"
    expect(homeText).toContain("aı tezgâh");
    expect(homeText).toContain("e-ticaret");
    expect(homeText).not.toContain("beş modül");
    expect(homeText).not.toContain("işletim sistemi");
    expect(homeText).not.toContain("e-ticaret os");
    expect(homeText).not.toContain("online kurs");
    expect(careerText).toContain("yetkincv");
    expect(careerText).toContain("doğrulanabilir");
    expect(careerText).not.toContain("sha-256");
    expect(CAREER_SEN.hashLabel.toLocaleLowerCase("tr")).toContain("sha-256");
    // Kapalı Akademi niyetleri kök keywords listesine sızmaz.
    expect(SEM_LANDING_KEYWORDS).not.toContain("yapay zeka eğitimi");
    expect(SEM_LANDING_KEYWORDS).not.toContain("online kurs");
    expect(SEM_LANDING_KEYWORDS).not.toContain("excel yapay zeka eğitimi");
  });

  it("Purchase/Register dönüşüm kancası birinci taraftır; komut dosyası yüklenmez", () => {
    // 4.4 (Tedavi): huni olayları eklendi. `purchase` vardı ama "nerede kaybettik"
    // bilinmiyordu; dört yeni olay o boşluğu kapatıyor.
    expect(SEM_CONVERSION_NAMES).toEqual({
      purchase: "purchase",
      register: "sign_up",
      form: "generate_lead",
      tezgahFirstOutput: "tezgah_first_output",
      tezgahQuotaWall: "tezgah_quota_wall",
      pricingView: "pricing_view",
      checkoutStart: "checkout_start",
    });
    expect(SEM_CONVERSION_EVENT).toBe("yetkin:conversion");
    expect(readSrc("archived/academy/components/purchase-button.tsx")).toContain("trackPurchase(");
    expect(readSrc("archived/academy/components/purchase-button.tsx")).not.toContain('emitSemConversion("purchase"');
    expect(readSrc("components/auth/register-form.tsx")).toContain('emitSemConversion("register")');
    expect(readSrc("lib/kernel/sem/conversion.ts")).not.toContain("dataLayer.push");
    expect(readSrc("app/api/academy/courses/[id]/purchase/route.ts")).toContain('event: "sem.conversion"');
    expect(readSrc("app/api/(kernel)/auth/register/route.ts")).toContain('event: "sem.conversion"');
    expect(readSrc("lib/kernel/sem/conversion.ts")).not.toContain("gtag.js");
    expect(readSrc("lib/kernel/sem/conversion.ts")).not.toContain("googletagmanager");
    expect(readSrc("lib/kernel/security/edge-guard.ts")).not.toContain("google-analytics");
    expect(readSrc("lib/kernel/security/edge-guard.ts")).not.toContain("googletagmanager");
  });
});

describe("SEO Tedavi (P0) — ölü kurs yüzeyi kapandı", () => {
  it("kurs SEO sabitleri, JSON-LD halkası ve ilişkili SSS kaldırıldı", async () => {
    // Modül export yüzeyi denetlenir: yorum satırı kalan adı taşıyabilir ama API taşımaz.
    const seoModule = await import("@/lib/copy/seo");
    for (const needle of [
      "OFFICE_AI_SEO",
      "OFFICE_AI_ILERI_SEO",
      "ECOMMERCE_AI_SEO",
      "SOCIAL_MEDIA_AI_SEO",
      "CHATBOT_NOCODE_SEO",
      "PROMPT_PRACTICE_SEO",
      "academyCourseSeoOverride",
      "OFFICE_AI_LESSON_TEASERS",
      "ECOMMERCE_AI_PUBLIC_PATH",
    ]) {
      expect(needle in seoModule, needle).toBe(false);
    }
    const jsonLdModule = await import("@/lib/copy/json-ld");
    for (const needle of [
      "courseJsonLd",
      "educationalOccupationalProgramJsonLd",
      "academyCourseBreadcrumbs",
    ]) {
      expect(needle in jsonLdModule, needle).toBe(false);
    }
    // `/academy` meta girdisi yok: diskte sayfa yok, kenar 410.
    expect("academy" in PAGE_SEO).toBe(false);
    expect("academyAdvanced" in PAGE_SEO).toBe(false);
    expect("academyVerify" in PAGE_SEO).toBe(false);
  });

  it("kalan canlı şema: Organization, FAQ, ItemList, Article, Junior Course", () => {
    // Doğrudan çağrılabilirlik (metin arama değil, canlı export).
    for (const live of [
      organizationJsonLd,
      itemListJsonLd,
      faqPageJsonLd,
      breadcrumbListJsonLd,
      legalSectionBreadcrumbs,
      jsonLdDocument,
      siteGraphJsonLd,
    ]) {
      expect(typeof live).toBe("function");
    }
    const course = juniorOnlineCourseJsonLd({
      name: "Üslü ifade",
      description: "Üslü ifade tanımı.",
      path: "/junior/ders/jr_06_mat-1",
      isAccessibleForFree: true,
    });
    expect(course["@type"]).toBe("Course");
    expect(readSrc("app/(public)/sozluk/[terim]/page.tsx")).toContain("guideArticleJsonLd");
    expect(readSrc("app/(public)/rehber/[slug]/page.tsx")).toContain("guideArticleJsonLd");
    expect(readSrc("app/junior/page.tsx")).toContain("juniorLandingJsonLd");
  });

  it("sertifika sicil sayfası noindex+follow; oynatıcı noindex giyer", () => {
    const meta = academyVerifyShareMetadata({
      hash: "b".repeat(64),
      title: "Ofis · Sertifika doğrula",
      description: "SHA-256 sicil bütünlük kaydı.",
    });
    expect(meta.robots).toEqual({ index: false, follow: true });
    const player = readSrc("archived/academy/app/[slug]/oyna/page.tsx");
    expect(player).toContain("index: false");
    expect(player).toContain("generateMetadata");
    expect(player).toContain("/oyna");
    const exitKit = readSrc("archived/academy/app/[slug]/cikis-paketi/page.tsx");
    expect(exitKit).toContain("index: false");
    expect(exitKit).toContain("generateMetadata");
    expect(exitKit).toContain("/cikis-paketi");
    expect(exitKit).toContain("OfficeAiExitKit");
    expect(exitKit).toContain("requirePageSession");
  });

  it("vize derinliği: bulunamayan kart noindex+follow döner (soft-404 kapanır)", () => {
    const vize = readSrc("app/(public)/vize/[id]/page.tsx");
    expect(vize).toContain("MISSING_CARD_ROBOTS");
    expect(vize).toContain("index: false");
    expect(vize).toContain("follow: true");
    // Bulunan kart dalı robots taşımaz; indeks açık kalır.
    expect(vize).toContain("robots: MISSING_CARD_ROBOTS");
  });
});
