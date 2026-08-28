import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  LEGAL_FOOTER_LINKS,
  LEGAL_HONESTY_BODY,
  LEGAL_LAUNCH_SECTIONS,
  LEGAL_PAGE_TITLE,
  LEGAL_SECTION_IDS,
  LEGAL_SECTION_TITLES,
} from "@/lib/copy/legal-launch";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("lansman hukuk yüzeyi (O13)", () => {
  it("dürüst mükellefiyet kartını korur; dört lansman başlığını taşır", () => {
    expect(LEGAL_HONESTY_BODY).toContain("Canlı vergi mükellefiyeti henüz açık değildir.");
    expect(LEGAL_HONESTY_BODY).toContain("18 yaş altı Junior");
    expect(LEGAL_PAGE_TITLE).toBe("Gizlilik ve yasal çerçeve");
    expect(LEGAL_LAUNCH_SECTIONS).toHaveLength(4);
    expect(LEGAL_LAUNCH_SECTIONS.map((row) => row.title)).toEqual([
      LEGAL_SECTION_TITLES.kvkk,
      LEGAL_SECTION_TITLES.refund,
      LEGAL_SECTION_TITLES.distance,
      LEGAL_SECTION_TITLES.terms,
    ]);
    expect(LEGAL_SECTION_TITLES.kvkk).toBe("KVKK Aydınlatma Metni & Çerez Politikası");
    expect(LEGAL_SECTION_TITLES.refund).toBe("İade ve İptal Koşulları (Emanet / Bakiye Yükleme)");
    expect(LEGAL_SECTION_TITLES.distance).toBe("Mesafeli Hizmet ve Dijital İçerik Sözleşmesi");
    expect(LEGAL_SECTION_TITLES.terms).toBe("Platform Kullanım Şartları & Sorumluluk Sınırları");
    expect(LEGAL_SECTION_IDS.kvkk).toBe("kvkk-cerez");
  });

  it("runbook PayTR bildirim yolunu taşır; sahte VKN yazılmaz", () => {
    const runbook = readFileSync(join(ROOT, ".system_docs", "OPS_RUNBOOK.md"), "utf8");
    expect(runbook).toContain("/api/payments/webhooks/paytr");
    expect(runbook).not.toMatch(/VKN:\s*\d/);
  });

  it("/legal sayfası kopya sicilini basar; sahte VKN/MERSİS yazmaz", () => {
    const page = readSrc("app/(public)/legal/page.tsx");
    const copy = readSrc("lib/copy/legal-launch.ts");
    expect(page).toContain("LEGAL_HONESTY_BODY");
    expect(page).toContain("LEGAL_LAUNCH_SECTIONS");
    expect(page).toContain("LEGAL_PAGE_TITLE");
    expect(copy).toContain("Canlı vergi mükellefiyeti henüz açık değildir.");
    expect(copy).toContain("EscrowHold");
    expect(copy).toContain("amountMinor");
    expect(copy).not.toMatch(/VKN:\s*\d/);
    expect(copy).not.toContain("YAPINET");
    expect(copy).not.toContain("hukuk@yetkin.ai");
  });

  it("bağımsız URL'ler, footer ve robots PayTR vitrine bağlıdır", () => {
    const slug = readSrc("app/(public)/legal/[slug]/page.tsx");
    const footer = readSrc("components/legal/legal-site-footer.tsx");
    const publicLayout = readSrc("app/(public)/layout.tsx");
    const authLayout = readSrc("app/(auth)/layout.tsx");
    const home = readSrc("app/(public)/page.tsx");
    const robots = readSrc("app/robots.ts");
    const sitemap = readSrc("app/sitemap.ts");
    expect(slug).toContain("legalSectionBySlug");
    expect(footer).toContain("LEGAL_FOOTER_LINKS");
    expect(footer).toContain("fixed");
    expect(footer).toContain("bottom-0");
    expect(footer).toContain("link.label");
    expect(publicLayout).toContain("LegalSiteFooter");
    expect(authLayout).toContain("LegalSiteFooter");
    expect(home).not.toContain("/legal/gizlilik");
    expect(home).not.toContain("/legal/mesafeli-satis");
    expect(home).not.toContain("/legal/iade");
    expect(home).not.toContain("legalCta");
    expect(home).not.toContain("Yasal metinler");
    expect(robots).toContain("/legal");
    expect(sitemap).toContain("LEGAL_FOOTER_LINKS");
    expect(LEGAL_FOOTER_LINKS.map((link) => link.href)).toEqual([
      "/legal/gizlilik",
      "/legal/iade",
      "/legal/mesafeli-satis",
      "/legal/kullanim-sartlari",
      "/iletisim",
    ]);
    expect(LEGAL_FOOTER_LINKS.map((link) => link.label)).toEqual([
      "Gizlilik",
      "İade",
      "Mesafeli satış",
      "Kullanım şartları",
      "İletişim",
    ]);
  });
});
