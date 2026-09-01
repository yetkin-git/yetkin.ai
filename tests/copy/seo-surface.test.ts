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
  SITE_SEARCH_URL_TEMPLATE,
  WEBSITE_ID,
  academyCourseBreadcrumbs,
  breadcrumbListJsonLd,
  courseJsonLd,
  jsonLdDocument,
  legalSectionBreadcrumbs,
  serializeJsonLd,
  siteGraphJsonLd,
} from "@/lib/copy/json-ld";
import {
  AUTH_ROBOTS,
  CANONICAL_SITE_ORIGIN,
  OG_LOCALE,
  PAGE_SEO,
  PRODUCT_ROOM_PATHS,
  TITLE_TEMPLATE,
  canonicalUrl,
  pageMetadata,
  sitemapRoutePolicy,
} from "@/lib/copy/seo";
import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";

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

  it("ana sayfa, kariyer ve freelancer özgün title/description taşır", () => {
    expect(PAGE_SEO.home.title).toBe(PUBLIC_SEN.home.title);
    expect(PAGE_SEO.career.title).not.toBe(PAGE_SEO.home.title);
    expect(PAGE_SEO.freelancer.title).not.toBe(PAGE_SEO.home.title);
    expect(PAGE_SEO.career.title).not.toBe(PAGE_SEO.freelancer.title);
    expect(PAGE_SEO.home.description).not.toBe(PAGE_SEO.career.description);
    expect(PAGE_SEO.home.description).not.toBe(PAGE_SEO.freelancer.description);
    expect(PAGE_SEO.career.description).not.toBe(PAGE_SEO.freelancer.description);
    expect(readSrc("app/(public)/page.tsx")).toContain("PAGE_SEO.home");
    expect(readSrc("app/career/page.tsx")).toContain("PAGE_SEO.career");
    expect(readSrc("app/freelancer/page.tsx")).toContain("PAGE_SEO.freelancer");
  });

  it("kamuya açık ana sayfalar Open Graph tr_TR ve Twitter Card giyer", () => {
    const helper = readSrc("lib/copy/seo.ts");
    expect(helper).toContain("openGraph");
    expect(helper).toContain("locale: OG_LOCALE");
    expect(helper).toContain('card: "summary_large_image"');
    expect(helper).toContain("url: path");
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
      image: academyCourseCoverPath("python-temel"),
    });
    expect(meta.openGraph).toMatchObject({
      images: [{ url: academyCourseCoverPath("python-temel"), alt: "Python Temel · Akademi" }],
    });
    expect(meta.twitter).toMatchObject({
      images: [academyCourseCoverPath("python-temel")],
    });
  });

  it("yayınlanmış her vitrin SKU’sunun kapak posteri diskte durur", () => {
    for (const slug of ACADEMY_GROWTH_SKU_SLUGS) {
      const cover = academyCourseCoverPath(slug);
      expect(cover, slug).toMatch(/^\/media\/academy\/micro\/.+\.poster\.svg$/);
      expect(existsSync(join(ROOT, "public", cover.slice(1))), cover).toBe(true);
    }
  });

  it("sitemap ürün odaları, iletişim/yasal ve yayın kurslarını doğru öncelikle basar", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    const { default: sitemap } = await import("@/app/sitemap");
    const entries = sitemap();
    const byPath = new Map(entries.map((entry) => [sitemapPathname(entry.url), entry]));

    expect(PRODUCT_ROOM_PATHS).toEqual(["/academy", "/career", "/freelancer"]);
    for (const path of ["/", ...PRODUCT_ROOM_PATHS, "/academy/dogrula", "/legal", "/iletisim"]) {
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
      expect(entry?.images?.[0]).toBe(`https://yetkin.ai${academyCourseCoverPath(row.slug)}`);
    }

    expect(byPath.get("/")?.priority).toBe(1);
    expect(byPath.get("/academy")?.priority).toBe(1);
    expect(byPath.get("/career")?.priority).toBe(0.9);
    expect(byPath.get("/freelancer")?.priority).toBe(0.9);
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
});

describe("Aşama 3 SEO — JSON-LD yapısal veri", () => {
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
    expect(site?.potentialAction).toMatchObject({
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: SITE_SEARCH_URL_TEMPLATE,
      },
      "query-input": "required name=search_term_string",
    });
    expect(SITE_SEARCH_URL_TEMPLATE).toBe(
      "https://yetkin.ai/academy?q={search_term_string}",
    );
  });

  it("kurs sayfası Course ve BreadcrumbList giyer", () => {
    const page = readSrc("app/academy/[slug]/page.tsx");
    expect(page).toContain("courseJsonLd");
    expect(page).toContain("breadcrumbListJsonLd");
    expect(page).toContain("academyCourseBreadcrumbs");
    expect(page).toContain("academyCourseCoverPath");
    expect(page).toContain("board.course.createdAt");

    const cover = academyCourseCoverPath("python-temel");
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
});
