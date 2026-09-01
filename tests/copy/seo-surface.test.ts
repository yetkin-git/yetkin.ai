import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import {
  AUTH_ROBOTS,
  CANONICAL_SITE_ORIGIN,
  OG_LOCALE,
  PAGE_SEO,
  TITLE_TEMPLATE,
} from "@/lib/copy/seo";
import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
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
