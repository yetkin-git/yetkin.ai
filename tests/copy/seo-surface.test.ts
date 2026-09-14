import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { academyCourseCoverPath } from "@/lib/academy/course-cover";
import { ACADEMY_GROWTH_SKU_SLUGS } from "@/lib/academy/pilot-sku";
import { publishedCoursesFromSeed } from "@/lib/academy/published-catalog";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { LEGAL_ENTITY, LEGAL_PAGE_TITLE, LEGAL_WHATSAPP_HREF } from "@/lib/copy/legal-launch";
import {
  ORGANIZATION_ID,
  ORGANIZATION_LOGO_PATH,
  ORGANIZATION_SAME_AS,
  WEBSITE_ID,
  academyCourseBreadcrumbs,
  breadcrumbListJsonLd,
  courseJsonLd,
  faqPageJsonLd,
  itemListJsonLd,
  jsonLdDocument,
  legalSectionBreadcrumbs,
  organizationJsonLd,
  serializeJsonLd,
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
  ROBOTS_DISALLOW_PATHS,
  SITEMAP_STATIC_PATHS,
  TITLE_TEMPLATE,
  canonicalUrl,
  pageMetadata,
  sitemapRoutePolicy,
} from "@/lib/copy/seo";
import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { CAREER_SEN } from "@/lib/copy/sen-voice/career";
import {
  ACADEMY_LANDING_FAQ,
  CAREER_LANDING_FAQ,
  HOME_LANDING_FAQ,
  SEM_LANDING_KEYWORDS,
  VIZE_LANDING_FAQ,
} from "@/lib/copy/sem-keywords";
import { SEM_CONVERSION_EVENT, SEM_CONVERSION_NAMES } from "@/lib/kernel/sem/conversion";

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
    expect(layout).toContain("PUBLIC_SEN.home.title");
    expect(layout).toContain("alternates");
    expect(layout).toContain("openGraph");
    expect(layout).toContain("twitter");
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
    expect(helper).toContain("url: path");
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
    expect(existsSync(join(ROOT, "app/academy/dogrula/[hash]/opengraph-image.tsx"))).toBe(true);
    expect(readSrc("app/academy/dogrula/[hash]/twitter-image.tsx")).toContain("./opengraph-image");
    for (const file of [
      "app/academy/layout.tsx",
      "app/(public)/iletisim/page.tsx",
      "app/(public)/legal/page.tsx",
    ]) {
      expect(readSrc(file), file).toContain("pageMetadata");
    }
  });

  it("giriş ve kayıt noindex, follow taşır", () => {
    expect(AUTH_ROBOTS).toEqual({ index: false, follow: true });
    expect(readSrc("app/(auth)/layout.tsx")).toContain("AUTH_ROBOTS");
    expect(readSrc("app/(auth)/login/page.tsx")).toContain("AUTH_ROBOTS");
    expect(readSrc("app/(auth)/register/page.tsx")).toContain("AUTH_ROBOTS");
    expect(readSrc("app/(auth)/login/page.tsx")).toContain("PAGE_SEO.login");
    expect(readSrc("app/(auth)/register/page.tsx")).toContain("PAGE_SEO.register");
  });
});

describe("Aşama 2 SEO — ürün odaları ve dinamik sitemap", () => {
  it("kurs generateMetadata başlık, özet ve kapak og:image basar", () => {
    const page = readSrc("app/academy/[slug]/page.tsx");
    expect(page).toContain("generateMetadata");
    expect(page).toContain("resolveAcademyCourseFromSeed");
    expect(page).toContain("course.summary");
    expect(page).toContain("academyCourseCoverPath");
    expect(page).toContain("image:");
    const meta = pageMetadata({
      title: "Python Temel · Akademi",
      description: "Python ile programlamanın temelleri.",
      path: "/academy/python-temel",
      image: academyCourseCoverPath("python-temel") ?? DEFAULT_OG_IMAGE,
    });
    expect(meta.openGraph).toMatchObject({
      images: [{ url: DEFAULT_OG_IMAGE, alt: "Python Temel · Akademi" }],
    });
    expect(meta.twitter).toMatchObject({
      images: [DEFAULT_OG_IMAGE],
    });
  });

  it("eski /academy/courses/[slug] alias'ı kanonik /academy/[slug] adresine 301 döner", () => {
    const config = readSrc("next.config.ts");
    expect(config).toContain('source: "/academy/courses/:slug"');
    expect(config).toContain('destination: "/academy/:slug"');
    expect(config).toContain("statusCode: 301");
    const alias = readSrc("app/academy/courses/[slug]/page.tsx");
    expect(alias).toContain("permanentRedirect");
    expect(alias).not.toContain("AcademyCoursePage");
    expect(alias).not.toContain("baseGenerateMetadata");
    expect(config).toContain('source: "/verify/:hash"');
    expect(config).toContain('destination: "/academy/dogrula/:hash"');
  });

  it("amiral SKU cinema kapağı taşır; kardeş SKU Yakında şablonuna düşer", () => {
    expect(academyCourseCoverPath("01_office_ai")).toBe("/academy/cinema/01_office_ai-1-eye.webp");
    expect(existsSync(join(ROOT, "public", "academy", "cinema", "01_office_ai-1-eye.webp"))).toBe(
      true,
    );
    for (const slug of ACADEMY_GROWTH_SKU_SLUGS) {
      if (slug === "01_office_ai") {
        continue;
      }
      expect(academyCourseCoverPath(slug), slug).toBeNull();
    }
    expect(academyCourseCoverPath("03_social_media_ai")).toBeNull();
    expect(academyCourseCoverPath("02_ecommerce_ai")).toBe(
      academyCourseCoverPath("03_social_media_ai"),
    );
  });

  it("sitemap ürün odaları, iletişim/yasal ve yayın kurslarını doğru öncelikle basar", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    const { default: sitemap } = await import("@/app/sitemap");
    const entries = sitemap();
    const byPath = new Map(entries.map((entry) => [sitemapPathname(entry.url), entry]));

    expect(PRODUCT_ROOM_PATHS).toEqual(["/academy", "/career"]);
    for (const path of ["/", ...PRODUCT_ROOM_PATHS, "/academy/dogrula", "/vize", "/legal", "/iletisim", "/hakkimizda"]) {
      expect(byPath.has(path), path).toBe(true);
    }

    const published = publishedCoursesFromSeed().filter((row) => row.isPublished);
    expect(published.length).toBe(ACADEMY_GROWTH_SKU_SLUGS.length);
    for (const row of published) {
      const path = `/academy/${row.slug}`;
      const entry = byPath.get(path);
      expect(entry, path).toBeDefined();
      expect(entry?.priority).toBe(0.8);
      expect(entry?.changeFrequency).toBe("weekly");
      const cover = academyCourseCoverPath(row.slug);
      if (cover) {
        expect(entry?.images?.[0]).toBe(`https://yetkin.ai${cover}`);
      } else {
        expect(entry?.images).toBeUndefined();
      }
      expect(byPath.has(`/academy/courses/${row.slug}`), `/academy/courses/${row.slug}`).toBe(false);
    }

    expect(byPath.get("/")?.priority).toBe(1);
    expect(byPath.get("/academy")?.priority).toBe(1);
    expect(byPath.get("/career")?.priority).toBe(0.9);
    expect(byPath.has("/freelancer")).toBe(false);
    expect(byPath.get("/hakkimizda")?.priority).toBe(0.5);
    expect(byPath.get("/legal")?.priority).toBe(0.5);
    expect(byPath.get("/iletisim")?.priority).toBe(0.5);
    expect(byPath.get("/legal")?.changeFrequency).toBe("monthly");
    expect(sitemapRoutePolicy("/academy/python-temel")).toEqual({
      changeFrequency: "weekly",
      priority: 0.8,
    });

    expect(entries).toHaveLength(byPath.size);
    expect(entries.length).toBeGreaterThanOrEqual(7 + PRODUCT_ROOM_PATHS.length + published.length);
    vi.unstubAllEnvs();
  });

  it("robots allow listesi sitemap statik yollarıyla aynı SSOT'tur; sığınaklar disallow", async () => {
    const { default: robots } = await import("@/app/robots");
    const rules = robots().rules;
    const rule = Array.isArray(rules) ? rules[0] : rules;
    expect(SITEMAP_STATIC_PATHS).toEqual(["/", "/academy", "/career", "/academy/dogrula", "/vize"]);
    expect(rule?.allow).toEqual(expect.arrayContaining([...SITEMAP_STATIC_PATHS, "/legal"]));
    expect(rule?.allow).toEqual(expect.arrayContaining(["/academy", "/career", "/vize"]));
    expect(rule?.disallow).toEqual(expect.arrayContaining([...ROBOTS_DISALLOW_PATHS]));
    expect(rule?.disallow).toEqual(
      expect.arrayContaining(["/dashboard", "/freelancer", "/login", "/api/"]),
    );
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

  it("kurs sayfası Course ve BreadcrumbList giyer", () => {
    const page = readSrc("app/academy/[slug]/page.tsx");
    expect(page).toContain("courseJsonLd");
    expect(page).toContain("breadcrumbListJsonLd");
    expect(page).toContain("academyCourseBreadcrumbs");
    expect(page).toContain("academyCourseCoverPath");
    expect(page).toContain("board.course.createdAt");

    const cover = academyCourseCoverPath("python-temel") ?? DEFAULT_OG_IMAGE;
    const published = new Date("2026-08-21T15:00:00.000Z");
    const course = courseJsonLd({
      slug: "python-temel",
      title: "Python ile Programlama ve Problem Çözme",
      description: "Python ile programlamanın temelleri.",
      imagePath: cover,
      datePublished: published,
    });
    expect(course).toMatchObject({
      "@type": "Course",
      name: "Python ile Programlama ve Problem Çözme",
      description: "Python ile programlamanın temelleri.",
      url: "https://yetkin.ai/academy/python-temel",
      image: canonicalUrl(cover),
      datePublished: "2026-08-21T15:00:00.000Z",
      provider: {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: YETKIN_BRAND,
        url: CANONICAL_SITE_ORIGIN,
      },
    });
    const crumbs = academyCourseBreadcrumbs({
      slug: "python-temel",
      title: "Python ile Programlama ve Problem Çözme",
    });
    expect(crumbs.map((row) => row.path)).toEqual([
      "/",
      "/academy",
      "/academy/python-temel",
    ]);
    expect(breadcrumbListJsonLd(crumbs).itemListElement).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: YETKIN_BRAND,
        item: "https://yetkin.ai/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: PAGE_SEO.academy.title,
        item: "https://yetkin.ai/academy",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Python ile Programlama ve Problem Çözme",
        item: "https://yetkin.ai/academy/python-temel",
      },
    ]);
  });

  it("yasal derinlik sayfası BreadcrumbList giyer; script kaçışı kapanır", () => {
    const slug = readSrc("app/(public)/legal/[slug]/page.tsx");
    expect(slug).toContain("legalSectionBreadcrumbs");
    expect(slug).toContain("breadcrumbListJsonLd");
    expect(readSrc("components/seo/json-ld.tsx")).toContain("application/ld+json");
    expect(readSrc("components/seo/json-ld.tsx")).toContain("serializeJsonLd");

    const crumbs = legalSectionBreadcrumbs({
      slug: "gizlilik",
      title: "Gizlilik Politikası ve KVKK Aydınlatma Metni",
    });
    expect(crumbs.map((row) => row.path)).toEqual(["/", "/legal", "/legal/gizlilik"]);
    expect(crumbs[1]?.name).toBe(LEGAL_PAGE_TITLE);
    expect(serializeJsonLd({ name: "</script><p>x" })).toBe(
      '{"name":"\\u003c/script>\\u003cp>x"}',
    );
    const document = jsonLdDocument([breadcrumbListJsonLd(crumbs)]);
    expect(document["@graph"][0]?.["@type"]).toBe("BreadcrumbList");
  });

  it("kurs CourseInstance ve yapay zeka sertifikası mührü taşır", () => {
    const course = courseJsonLd({
      slug: "01_office_ai",
      title: "Ofis",
      description: "Ofis yapay zekâ.",
      imagePath: academyCourseCoverPath("01_office_ai") ?? DEFAULT_OG_IMAGE,
      datePublished: "2026-09-11T00:00:00.000Z",
    });
    expect(course.educationalCredentialAwarded).toBe("Yapay zeka sertifikası");
    expect(course.hasCourseInstance).toMatchObject({
      "@type": "CourseInstance",
      courseMode: "Online",
    });
    const org = siteGraphJsonLd()["@graph"].find((node) => node["@type"] === "Organization");
    expect(org?.additionalType).toBe("https://schema.org/EducationalOrganization");
  });

  it("FAQPage ve ItemList JSON-LD basar; görünür FAQ ile aynı soruları taşır", () => {
    const home = readSrc("app/(public)/page.tsx");
    const academy = readSrc("app/academy/page.tsx");
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
    expect(PAGE_SEO.academy.title).toBe(ACADEMY_SEN.catalog.title);
    expect(PAGE_SEO.career.title.toLocaleLowerCase("tr")).toContain("kariyer vizesi");
    expect(ACADEMY_SEN.catalog.title.toLocaleLowerCase("tr")).toContain("yapay zeka eğitimi");
    expect(ACADEMY_SEN.catalog.title.toLocaleLowerCase("tr")).toContain("online kurs");
    expect(CAREER_SEN.title.toLocaleLowerCase("tr")).toBe("kariyer vizesi");
    expect(PUBLIC_SEN.home.cinemaKicker.toLocaleLowerCase("tr")).toContain("yapay zeka eğitimi");
    expect(readSrc("app/(public)/page.tsx")).toContain("<h2");
    expect(readSrc("app/(public)/page.tsx")).toContain("home-cinema-heading");
    expect(readSrc("app/(public)/page.tsx")).toContain("home-rooms-heading");
    expect(readSrc("components/academy/course-list.tsx")).toContain("copy.boardTitle");
    expect(PAGE_SEO.academy.image).toBe(DEFAULT_OG_IMAGE);
    expect(PAGE_SEO.career.image).toBe(DEFAULT_OG_IMAGE);
    expect(pageMetadata(PAGE_SEO.academy).openGraph).toMatchObject({
      title: PAGE_SEO.academy.title,
      description: PAGE_SEO.academy.description,
    });
    expect(pageMetadata(PAGE_SEO.career).openGraph).toMatchObject({
      title: PAGE_SEO.career.title,
      description: PAGE_SEO.career.description,
    });

    const homeText = haystack([
      PUBLIC_SEN.home.title,
      PUBLIC_SEN.home.description,
      PUBLIC_SEN.home.cinemaKicker,
      PUBLIC_SEN.home.cinemaHint,
      PUBLIC_SEN.home.hero.title,
      PUBLIC_SEN.home.hero.body,
      PAGE_SEO.home.title,
      PAGE_SEO.home.description,
      ...HOME_LANDING_FAQ.flatMap((row) => [row.question, row.answer]),
    ]);
    const academyText = haystack([
      ACADEMY_SEN.catalog.title,
      ACADEMY_SEN.catalog.description,
      ACADEMY_SEN.catalog.boardTitle,
      PAGE_SEO.academy.title,
      PAGE_SEO.academy.description,
      ...ACADEMY_LANDING_FAQ.flatMap((row) => [row.question, row.answer]),
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
    for (const keyword of SEM_LANDING_KEYWORDS) {
      expect(homeText, `home ← ${keyword}`).toContain(keyword);
      const onAcademy = academyText.includes(keyword);
      const onCareer = careerText.includes(keyword);
      expect(onAcademy || onCareer, `academy|career ← ${keyword}`).toBe(true);
    }
  });

  it("Purchase/Register dönüşüm kancası birinci taraftır; gtag yüklenmez", () => {
    expect(SEM_CONVERSION_NAMES).toEqual({
      purchase: "purchase",
      register: "sign_up",
      form: "generate_lead",
    });
    expect(SEM_CONVERSION_EVENT).toBe("yetkin:conversion");
    expect(readSrc("components/academy/purchase-button.tsx")).toContain('emitSemConversion("purchase"');
    expect(readSrc("components/auth/register-form.tsx")).toContain('emitSemConversion("register")');
    expect(readSrc("app/api/academy/courses/[id]/purchase/route.ts")).toContain('event: "sem.conversion"');
    expect(readSrc("app/api/(kernel)/auth/register/route.ts")).toContain('event: "sem.conversion"');
    expect(readSrc("lib/kernel/sem/conversion.ts")).not.toContain("gtag.js");
    expect(readSrc("lib/kernel/sem/conversion.ts")).not.toContain("googletagmanager");
    expect(readSrc("lib/kernel/security/edge-guard.ts")).not.toContain("google-analytics");
    expect(readSrc("lib/kernel/security/edge-guard.ts")).not.toContain("googletagmanager");
  });
});
