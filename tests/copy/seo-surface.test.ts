import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { academyCourseCoverPath } from "@/lib/academy/course-cover";
import { ACADEMY_CATALOG_SUMMARIES } from "@/lib/academy/catalog-summaries";
import { ACADEMY_GROWTH_SKU_SLUGS } from "@/lib/academy/pilot-sku";
import { publishedCoursesFromSeed } from "@/lib/academy/published-catalog";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { LEGAL_ENTITY, LEGAL_PAGE_TITLE, LEGAL_WHATSAPP_HREF } from "@/lib/copy/legal-launch";
import { academyVerifyShareMetadata } from "@/lib/academy/certificate-share";
import { curriculumSyllabusForCourseSlug } from "@/lib/academy/curriculum-syllabus";
import {
  OFFICE_AI_COURSE_TEACHES,
  OFFICE_AI_SYLLABUS_LESSONS,
  ORGANIZATION_ID,
  ORGANIZATION_LOGO_PATH,
  ORGANIZATION_SAME_AS,
  WEBSITE_ID,
  academyCourseBreadcrumbs,
  breadcrumbListJsonLd,
  courseJsonLd,
  educationalOccupationalProgramJsonLd,
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
  OFFICE_AI_LESSON_TEASERS,
  OFFICE_AI_SEO,
  PAGE_SEO,
  PRODUCT_ROOM_PATHS,
  ROBOTS_ALLOW_COURSE_PATHS,
  ROBOTS_DISALLOW_AUTH_REDIRECTS,
  ROBOTS_DISALLOW_PATHS,
  SITEMAP_STATIC_PATHS,
  isRobotsDisallowedPath,
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
  OFFICE_AI_COURSE_FAQ,
  OFFICE_AI_FAQ_HEADING,
  OFFICE_AI_SEAL_PROOF,
  OFFICE_AI_SEAL_PROOF_SHORT,
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
    expect(readSrc("app/career/page.tsx")).toContain("AUTH_ROBOTS");
    const careerMeta = pageMetadata({ ...PAGE_SEO.career, robots: AUTH_ROBOTS });
    expect(careerMeta.robots).toEqual(AUTH_ROBOTS);
    expect(careerMeta.alternates).toMatchObject({ canonical: "https://yetkin.ai/career" });
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
    expect(config).toContain('destination: "https://yetkin.ai/academy/:slug"');
    expect(config).toContain("statusCode: 301");
    const alias = readSrc("app/academy/courses/[slug]/page.tsx");
    expect(alias).toContain("permanentRedirect");
    expect(alias).not.toContain("AcademyCoursePage");
    expect(alias).not.toContain("baseGenerateMetadata");
    expect(config).toContain('source: "/verify/:hash"');
    expect(config).toContain('destination: "https://yetkin.ai/academy/dogrula/:hash"');
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
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://yetkin-ai.vercel.app");
    const { default: sitemap } = await import("@/app/sitemap");
    const entries = sitemap();
    const byPath = new Map(entries.map((entry) => [sitemapPathname(entry.url), entry]));

    expect(PRODUCT_ROOM_PATHS).toEqual(["/academy", "/career"]);
    for (const path of ["/", "/academy", "/academy/dogrula", "/vize", "/legal", "/iletisim", "/hakkimizda"]) {
      expect(byPath.has(path), path).toBe(true);
    }
    expect(byPath.has("/career")).toBe(false);

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
    expect(sitemapRoutePolicy("/career").priority).toBe(0.9);
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
    // SEO Tedavi (P1) — sabit mühür yok; üretim anı dinamik basılır.
    expect(readSrc("app/sitemap.ts")).not.toContain('new Date("2026-09-05")');
    for (const entry of entries) {
      expect(entry.lastModified, entry.url).toBeInstanceOf(Date);
      const loc = new URL(entry.url);
      expect(loc.origin, entry.url).toBe("https://yetkin.ai");
      expect(isRobotsDisallowedPath(loc.pathname), entry.url).toBe(false);
    }
    vi.unstubAllEnvs();
  });

  it("robots allow listesi sitemap statik yollarıyla aynı SSOT'tur; sığınaklar disallow", async () => {
    const { default: robots } = await import("@/app/robots");
    const rules = robots().rules;
    const rule = Array.isArray(rules) ? rules[0] : rules;
    expect(SITEMAP_STATIC_PATHS).toEqual(["/", "/academy", "/academy/dogrula", "/vize"]);
    expect(SITEMAP_STATIC_PATHS).not.toContain("/career");
    expect(rule?.allow).toEqual(expect.arrayContaining([...SITEMAP_STATIC_PATHS, "/legal"]));
    expect(rule?.allow).toEqual(expect.arrayContaining(["/academy", "/vize"]));
    expect(rule?.allow ?? []).not.toContain("/career");
    expect(rule?.disallow).toEqual(expect.arrayContaining([...ROBOTS_DISALLOW_PATHS]));
    expect(rule?.disallow).toEqual(expect.arrayContaining([...ROBOTS_DISALLOW_AUTH_REDIRECTS]));
    expect(isRobotsDisallowedPath("/career")).toBe(true);
    expect(isRobotsDisallowedPath("/academy/01_office_ai/oyna")).toBe(true);
    expect(isRobotsDisallowedPath("/academy/01_office_ai")).toBe(false);
    expect(isRobotsDisallowedPath("/profil")).toBe(true);
    expect(isRobotsDisallowedPath("/profile")).toBe(true);
    expect(rule?.disallow).toEqual(
      expect.arrayContaining(["/dashboard", "/freelancer", "/login", "/api/"]),
    );
    // SEO Tedavi (P1) — duvar arkası oynatıcı crawl edilmez.
    expect(ROBOTS_DISALLOW_PATHS).toContain("/academy/*/oyna");
    expect(ROBOTS_DISALLOW_PATHS).toContain("/academy/*/cikis-paketi");
    expect(rule?.disallow).toEqual(expect.arrayContaining(["/academy/*/oyna"]));
    expect(rule?.disallow).toEqual(expect.arrayContaining(["/academy/*/cikis-paketi"]));
    expect(ROBOTS_ALLOW_COURSE_PATHS).toEqual(["/academy/01_office_ai"]);
    expect(rule?.allow).toEqual(expect.arrayContaining(["/academy/01_office_ai"]));
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
    expect(serializeJsonLd({ email: "destek@yetkin.ai" })).toBe(
      '{"email":"destek\\u0040yetkin.ai"}',
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
    // SEO Tedavi (P0) — tip'li belge düğümü + tohum fiyatlı offers + müfredat.
    expect(course.educationalCredentialAwarded).toMatchObject({
      "@type": "EducationalOccupationalCredential",
      name: "yetkin.ai Ofis Yapay Zekâ Sertifikası",
      credentialCategory: "certificate",
      recognizedBy: { "@id": ORGANIZATION_ID },
    });
    expect(course.hasCourseInstance).toMatchObject({
      "@type": "CourseInstance",
      courseMode: "Online",
      offers: {
        "@type": "Offer",
        price: "890",
        priceCurrency: "TRY",
        availability: "https://schema.org/InStock",
        url: "https://yetkin.ai/academy/01_office_ai",
      },
    });
    expect(course.teaches).toEqual([...OFFICE_AI_COURSE_TEACHES]);
    expect(course.teaches).toEqual(
      expect.arrayContaining([
        "Excel veri temizliği",
        "KVKK maskeleme",
        "Yönetim özeti",
        "Sunum hazırlama",
      ]),
    );
    expect(course.keywords).toEqual([...OFFICE_AI_SEO.keywords]);
    const parts = course.hasPart as Array<{ name: string }>;
    expect(parts).toHaveLength(8);
    expect(parts.map((part) => part.name)).toEqual(
      OFFICE_AI_SYLLABUS_LESSONS.map((lesson) => lesson.name),
    );
    const sections = course.syllabusSections as Array<{
      name: string;
      hasPart: Array<{ name: string }>;
    }>;
    expect(sections.map((section) => section.name)).toEqual([
      "Tablo ve güvenlik",
      "Karar ve slayt",
      "Kutu ve belge",
      "Haftalık sistem",
    ]);
    expect(sections.flatMap((section) => section.hasPart.map((part) => part.name))).toEqual(
      parts.map((part) => part.name),
    );
    const org = siteGraphJsonLd()["@graph"].find((node) => node["@type"] === "Organization");
    expect(org?.additionalType).toBe("https://schema.org/EducationalOrganization");
  });

  it("Course lessons/duration ile timeRequired ve ders süreleri basar", () => {
    const course = courseJsonLd({
      slug: "01_office_ai",
      title: "Ofis",
      description: "Ofis yapay zekâ.",
      imagePath: DEFAULT_OG_IMAGE,
      datePublished: "2026-09-11T00:00:00.000Z",
      priceMinor: 89_000,
      priceCurrency: "TRY",
      lessons: [
        { name: "Ders A", durationMin: 60 },
        { name: "Ders B", durationMin: 30 },
      ],
    });
    expect(course.timeRequired).toBe("PT1H30M");
    const sections = course.syllabusSections as Array<{
      hasPart: Array<{ timeRequired?: string }>;
    }>;
    expect(sections[0]?.hasPart[0]?.timeRequired).toBe("PT1H");
    expect(sections[0]?.hasPart[1]?.timeRequired).toBe("PT30M");
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
    // SEO Tedavi (P0) — ilk 5 küresel; kuyruk amiral antreye özeldir.
    const GLOBAL_SEM_KEYWORDS = SEM_LANDING_KEYWORDS.slice(0, 5);
    const OFFICE_AI_SEM_KEYWORDS = SEM_LANDING_KEYWORDS.slice(5);
    expect(OFFICE_AI_SEM_KEYWORDS).toEqual([
      "excel yapay zeka eğitimi",
      "ofiste chatgpt",
      "word yapay zeka",
      "yapay zeka sertifikasi",
      "iş hayatında yapay zekâ",
      "excel'de temiz veri",
      "gmail'de yerleşik gemini",
      "word ataş ile belge analizi",
      "kvkk maskeleme",
      "haftalık cuma rutini",
    ]);
    for (const keyword of GLOBAL_SEM_KEYWORDS) {
      expect(homeText, `home ← ${keyword}`).toContain(keyword);
      const onAcademy = academyText.includes(keyword);
      const onCareer = careerText.includes(keyword);
      expect(onAcademy || onCareer, `academy|career ← ${keyword}`).toBe(true);
    }
    const officeAiText = haystack([
      OFFICE_AI_SEO.title,
      OFFICE_AI_SEO.description,
      OFFICE_AI_SEO.h1,
      ...OFFICE_AI_SEO.keywords,
      OFFICE_AI_FAQ_HEADING,
      ...OFFICE_AI_COURSE_FAQ.flatMap((row) => [row.question, row.answer]),
      ...Object.values(OFFICE_AI_LESSON_TEASERS),
      readSrc("lib/academy/catalog-summaries.ts"),
      readSrc("components/academy/office-ai-guide-preview.tsx"),
      readSrc("app/academy/[slug]/page.tsx"),
    ]);
    for (const keyword of OFFICE_AI_SEM_KEYWORDS) {
      expect(officeAiText, `office_ai antre ← ${keyword}`).toContain(keyword);
    }
    expect(officeAiText).not.toContain("excel gemini");
    expect(officeAiText).not.toContain("office ai eğitimi");
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

describe("SEO Tedavi — 01_office_ai amiral operasyonu", () => {
  it("amiral title/description/H1 niyet dilindedir; final title 65 karakteri aşmaz", () => {
    expect(OFFICE_AI_SEO.slug).toBe("01_office_ai");
    expect(OFFICE_AI_SEO.path).toBe("/academy/01_office_ai");
    expect(OFFICE_AI_SEO.title).toBe("Excel Yapay Zekâ Eğitimi: Ofiste ChatGPT + Sertifika");
    expect(OFFICE_AI_SEO.description).toBe(
      `Excel Copilot ve Ataş Yöntemi, A1 Düzeni ve Temiz Veri ve yönetim özetine dönüştürme. Gmail'de yerleşik Gemini. ${OFFICE_AI_SEAL_PROOF_SHORT}`,
    );
    expect(OFFICE_AI_SEO.h1).toBe("İş Hayatında Yapay Zekâ: Excel'den E-Postaya 9 Ders");
    expect(OFFICE_AI_SEO.keywords).toEqual(
      expect.arrayContaining([
        "İş Hayatında Yapay Zekâ",
        "Excel'de Temiz Veri",
        "Gmail'de Yerleşik Gemini",
        "Word Belgesi İnceleme",
        "KVKK Maskeleme",
        "Haftalık Cuma Rutini",
      ]),
    );
    expect(OFFICE_AI_SEO.description).toMatch(/Excel Copilot ve Ataş Yöntemi/u);
    expect(OFFICE_AI_SEO.description).toMatch(/A1 Düzeni ve Temiz Veri/u);
    expect(OFFICE_AI_SEO.description).toMatch(/yönetim özetine dönüştürme/u);
    expect(OFFICE_AI_SEO.description).toMatch(/Gmail'de yerleşik Gemini/u);
    expect(OFFICE_AI_SEO.description).not.toMatch(/Excel Gemini/u);
    expect(OFFICE_AI_SEO.description).not.toMatch(/Office AI/u);
    const finalTitle = TITLE_TEMPLATE.replace("%s", OFFICE_AI_SEO.title);
    expect(finalTitle).toBe(`${OFFICE_AI_SEO.title} · ${YETKIN_BRAND}`);
    expect(OFFICE_AI_SEO.title.length).toBeLessThanOrEqual(55);
    expect(finalTitle.length).toBeLessThanOrEqual(65);
    expect(OFFICE_AI_SEO.description.length).toBeLessThanOrEqual(180);
    expect(OFFICE_AI_SEO.h1).not.toBe(OFFICE_AI_SEO.title);

    const page = readSrc("app/academy/[slug]/page.tsx");
    expect(page).toContain("OFFICE_AI_SEO");
    expect(page).toContain("OFFICE_AI_SEO.title");
    expect(page).toContain("OFFICE_AI_SEO.description");
    expect(page).toContain("OFFICE_AI_SEO.h1");
    expect(page).toContain("OFFICE_AI_SEO.keywords");
    expect(page).toContain("educationalOccupationalProgramJsonLd");
    // Sicil başlığı korunur: breadcrumb + JSON-LD `name` hâlâ course.title.
    expect(page).toContain("label={board.course.title}");
    expect(page).toContain("title: board.course.title");
  });

  it("kursa özel SSS görünür HTML ile FAQPage JSON-LD'de birebir aynı metni taşır", () => {
    expect(OFFICE_AI_COURSE_FAQ).toHaveLength(5);
    expect(OFFICE_AI_COURSE_FAQ.map((row) => row.question)).toEqual([
      "Excel yapay zeka eğitimi sertifika veriyor mu?",
      "ChatGPT ofis kullanımı için ön koşul var mı?",
      "KVKK'ya uygun mu? Verilerim güvende mi?",
      "Sınav barajı ve süresi nedir?",
      "Excel veya Word'e harici yapay zekâ eklentisi (Add-in) kurmayı öğretiyor musunuz?",
    ]);
    const page = readSrc("app/academy/[slug]/page.tsx");
    expect(page).toContain("OFFICE_AI_COURSE_FAQ");
    expect(page).toContain("faqPageJsonLd");
    expect(page).toContain("LandingFaq");
    expect(page).toContain("OFFICE_AI_FAQ_HEADING");
    expect(page).toContain("faqPageJsonLd(OFFICE_AI_COURSE_FAQ)");
    expect(page).toContain("items={OFFICE_AI_COURSE_FAQ}");

    const faq = faqPageJsonLd(OFFICE_AI_COURSE_FAQ);
    const entities = faq.mainEntity as Array<{
      name: string;
      acceptedAnswer: { text: string };
    }>;
    expect(entities).toHaveLength(5);
    entities.forEach((entity, index) => {
      expect(entity["@type"]).toBe("Question");
      expect(entity.name).toBe(OFFICE_AI_COURSE_FAQ[index]?.question);
      expect(entity.acceptedAnswer.text).toBe(OFFICE_AI_COURSE_FAQ[index]?.answer);
    });
  });

  it("rehber bloğu SSR'dir, 1000+ kelimedir ve duvarı delmez", () => {
    const page = readSrc("app/academy/[slug]/page.tsx");
    expect(page).toContain("OfficeAiGuidePreview");
    expect(page).toContain("<OfficeAiGuidePreview />");
    const guide = readSrc("components/academy/office-ai-guide-preview.tsx");
    expect(guide).not.toContain("use client");
    expect(guide).not.toContain("useState");
    expect(guide).not.toContain("useEffect");
    for (const h2 of [
      "Excel yapay zeka eğitimi",
      "Ofiste ChatGPT kullanımı",
      "Word yapay zeka",
      "70+ baraj nasıl geçilir?",
    ]) {
      expect(guide, h2).toContain(h2);
    }
    const text = [
      guide
        .replace(/\/\*\*[\s\S]*?\*\//, "")
        .replace(/\{" "\}/g, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(/&[a-z]+;/g, " "),
      OFFICE_AI_SEAL_PROOF,
    ].join(" ");
    const words = text.split(/\s+/u).filter(Boolean);
    expect(words.length).toBeGreaterThanOrEqual(1000);
    expect(guide).toContain("OFFICE_AI_SEAL_PROOF");
    expect(guide).not.toMatch(/A1 eşiği/u);
    expect(guide).toMatch(/A1 kuralı/u);
    expect(guide).not.toMatch(/KVKK-safe/u);
    expect(OFFICE_AI_COURSE_FAQ[2]?.answer).toMatch(/hukuki danışmanlık yerine geçmez/u);
    expect(OFFICE_AI_COURSE_FAQ[2]?.answer).not.toMatch(/KVKK-safe/u);
    // Duvar beyanı: tam gövde/ses/sınav kapalı kalır.
    expect(guide).toContain("satın alma sonrasında açılır");
  });

  it("şema müfredat yedeği lesson-index SSOT'u ile birebir örtüşür", () => {
    const syllabus = curriculumSyllabusForCourseSlug("01_office_ai");
    expect(syllabus.lessonCount).toBe(8);
    expect(syllabus.lessons.map((lesson) => lesson.title)).toEqual(
      OFFICE_AI_SYLLABUS_LESSONS.map((lesson) => lesson.name),
    );
    expect(OFFICE_AI_COURSE_TEACHES).toHaveLength(9);
    expect(Object.keys(OFFICE_AI_LESSON_TEASERS)).toEqual(
      syllabus.lessons.map((lesson) => lesson.key),
    );
    expect(OFFICE_AI_LESSON_TEASERS["01_office_ai-1"]).toMatch(/Excel Copilot ve Ataş Yöntemi/u);
    expect(OFFICE_AI_LESSON_TEASERS["01_office_ai-1"]).toMatch(/A1 Düzeni ve Temiz Veri/u);
    expect(OFFICE_AI_LESSON_TEASERS["01_office_ai-2"]).toMatch(/Yönetim özetine dönüştürme/u);
    expect(OFFICE_AI_LESSON_TEASERS["01_office_ai-1"]).toMatch(/Copilot/u);
    expect(OFFICE_AI_LESSON_TEASERS["01_office_ai-k1"]).toMatch(/KVKK maskeleme/u);
    expect(OFFICE_AI_LESSON_TEASERS["01_office_ai-g1"]).toMatch(/Gmail'de yerleşik Gemini/u);
    expect(OFFICE_AI_LESSON_TEASERS["01_office_ai-w1"]).toMatch(/Word belgesi inceleme/u);
    expect(OFFICE_AI_LESSON_TEASERS["01_office_ai-w1"]).toMatch(/Word ataş ile belge analizi/u);
    expect(OFFICE_AI_LESSON_TEASERS["01_office_ai-6"]).toMatch(/Haftalık Cuma rutini/u);
    expect(readSrc("components/academy/curriculum-outline.tsx")).toContain(
      "OFFICE_AI_LESSON_TEASERS",
    );
  });

  it("T-01 kamu kopyası Excel Gemini / Office AI taşımaz; mühürlü kapıları taşır", () => {
    const publicCopy = [
      OFFICE_AI_SEO.title,
      OFFICE_AI_SEO.description,
      OFFICE_AI_SEO.h1,
      ...OFFICE_AI_SEO.keywords,
      OFFICE_AI_FAQ_HEADING,
      ...OFFICE_AI_COURSE_FAQ.flatMap((row) => [row.question, row.answer]),
      ...Object.values(OFFICE_AI_LESSON_TEASERS),
      ACADEMY_CATALOG_SUMMARIES["01_office_ai"],
    ].join("\n");
    expect(publicCopy).not.toMatch(/Excel Gemini/iu);
    expect(publicCopy).not.toMatch(/Office AI/iu);
    expect(publicCopy).toMatch(/Excel Copilot ve Ataş Yöntemi/u);
    expect(publicCopy).toMatch(/A1 Düzeni ve Temiz Veri/u);
    expect(publicCopy).toMatch(/yönetim özetine dönüştürme/u);
    expect(publicCopy).toMatch(/Copilot/u);
    expect(publicCopy).toMatch(/Gmail'de yerleşik Gemini/u);
    expect(publicCopy).toMatch(/Word belgesi inceleme/u);
    expect(publicCopy).toMatch(/KVKK maskeleme/u);
    expect(publicCopy).toMatch(/haftalık Cuma rutini/iu);
  });

  it("T-02 kamu kopyası mührü izleme + baraj olarak tanımlar; sunucu dosya kontrolü vaat etmez", () => {
    expect(OFFICE_AI_SEAL_PROOF).toMatch(/8 dersin eksiksiz izlenmesi/u);
    expect(OFFICE_AI_SEAL_PROOF).toMatch(/baraj sınavında %70/u);
    expect(OFFICE_AI_SEAL_PROOF).toMatch(/sunucuda dosya kontrolü yapılmaz/u);
    expect(OFFICE_AI_SEAL_PROOF_SHORT).toBe(
      "Mühür: 8 ders + 10 soru / 70. Sunucuda dosya kontrolü yok.",
    );
    expect(OFFICE_AI_SEO.description).toContain(OFFICE_AI_SEAL_PROOF_SHORT);
    expect(OFFICE_AI_SEO.description.length).toBeLessThanOrEqual(180);
    expect(ACADEMY_CATALOG_SUMMARIES["01_office_ai"]).toContain(OFFICE_AI_SEAL_PROOF_SHORT);
    expect(OFFICE_AI_COURSE_FAQ[0]?.answer).toContain(OFFICE_AI_SEAL_PROOF);
    expect(OFFICE_AI_COURSE_FAQ[3]?.answer).toMatch(/sunucuda kontrol etmez/u);
    expect(readSrc("components/academy/office-ai-guide-preview.tsx")).toContain(
      "OFFICE_AI_SEAL_PROOF",
    );

    const publicCopy = [
      OFFICE_AI_SEO.title,
      OFFICE_AI_SEO.description,
      OFFICE_AI_SEO.h1,
      ...OFFICE_AI_SEO.keywords,
      OFFICE_AI_FAQ_HEADING,
      ...OFFICE_AI_COURSE_FAQ.flatMap((row) => [row.question, row.answer]),
      ...Object.values(OFFICE_AI_LESSON_TEASERS),
      ACADEMY_CATALOG_SUMMARIES["01_office_ai"],
      OFFICE_AI_SEAL_PROOF,
    ].join("\n");
    expect(publicCopy).not.toMatch(/iş kanıtı/iu);
    expect(publicCopy).not.toMatch(/sunucuda dosya kontrolü yapılır/iu);
    expect(publicCopy).not.toMatch(/dosya(?:sı|sını)? sunucuda (?:doğrulanır|kontrol edilir)/iu);
    expect(publicCopy).toMatch(/sunucuda dosya kontrolü yapılmaz/u);
    expect(publicCopy).toMatch(/Sunucuda dosya kontrolü yok/u);
  });

  it("EducationalOccupationalProgram JSON-LD Course düğümüne bağlanır", () => {
    const program = educationalOccupationalProgramJsonLd({
      slug: "01_office_ai",
      name: "İş Hayatında ve Ofiste Yapay Zekâ",
      description: OFFICE_AI_SEO.description,
      imagePath: academyCourseCoverPath("01_office_ai") ?? DEFAULT_OG_IMAGE,
      durationMin: 84,
      priceMinor: 89_000,
      priceCurrency: "TRY",
    });
    expect(program).toMatchObject({
      "@type": "EducationalOccupationalProgram",
      "@id": "https://yetkin.ai/academy/01_office_ai#program",
      url: "https://yetkin.ai/academy/01_office_ai",
      educationalProgramMode: "online",
      occupationalCategory: "Ofis çalışanı",
      timeToComplete: "PT1H24M",
      hasCourse: { "@id": "https://yetkin.ai/academy/01_office_ai#course" },
      offers: {
        "@type": "Offer",
        category: "Paid",
        price: "890",
        priceCurrency: "TRY",
      },
    });
    expect(program.educationalCredentialAwarded).toMatchObject({
      "@type": "EducationalOccupationalCredential",
      name: "yetkin.ai Ofis Yapay Zekâ Sertifikası",
    });
    const officeMeta = pageMetadata({
      title: OFFICE_AI_SEO.title,
      description: OFFICE_AI_SEO.description,
      path: OFFICE_AI_SEO.path,
      keywords: OFFICE_AI_SEO.keywords,
    });
    expect(officeMeta.keywords).toEqual([...OFFICE_AI_SEO.keywords]);
  });

  it("sertifika sicil sayfası noindex+follow; oynatıcı noindex giyer", () => {
    const meta = academyVerifyShareMetadata({
      hash: "b".repeat(64),
      title: "Ofis · Sertifika doğrula",
      description: "SHA-256 sicil bütünlük kaydı.",
    });
    expect(meta.robots).toEqual({ index: false, follow: true });
    const player = readSrc("app/academy/[slug]/oyna/page.tsx");
    expect(player).toContain("index: false");
    expect(player).toContain("export const metadata");
    const exitKit = readSrc("app/academy/[slug]/cikis-paketi/page.tsx");
    expect(exitKit).toContain("index: false");
    expect(exitKit).toContain("OfficeAiExitKit");
    expect(exitKit).toContain("requirePageSession");
  });
});
