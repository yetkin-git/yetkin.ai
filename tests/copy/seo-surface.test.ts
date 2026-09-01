import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { academyCourseCoverPath } from "@/lib/academy/course-cover";
import { ACADEMY_GROWTH_SKU_SLUGS } from "@/lib/academy/pilot-sku";
import { publishedCoursesFromSeed } from "@/lib/academy/published-catalog";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import {
  AUTH_ROBOTS,
  CANONICAL_SITE_ORIGIN,
  OG_LOCALE,
  PAGE_SEO,
  PRODUCT_ROOM_PATHS,
  TITLE_TEMPLATE,
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
