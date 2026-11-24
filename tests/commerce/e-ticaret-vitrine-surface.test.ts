import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PAGE_SEO, isRobotsDisallowedPath } from "@/lib/copy/seo";
import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";
import { isProtectedCitizenPath } from "@/lib/kernel/security/edge-guard";

const ROOT = process.cwd();

function read(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("E-Ticaret kamu vitrini (/e-ticaret) ve kokpit ayrımı", () => {
  const page = read("app/(public)/e-ticaret/page.tsx");

  it("vitrin kamu yoludur: korumasız, indekslenir ve kendi SEO girdisini taşır", () => {
    expect(PAGE_SEO.eTicaret.path).toBe("/e-ticaret");
    expect(PAGE_SEO.eTicaret.title).toBe("E-Ticaret — stok, kanal ve kâr beyni");
    expect(isProtectedCitizenPath("/e-ticaret")).toBe(false);
    expect(isRobotsDisallowedPath("/e-ticaret")).toBe(false);
    expect(page).toContain("pageMetadata(PAGE_SEO.eTicaret)");
    expect(page).toContain('export const dynamic = "force-dynamic"');
  });

  it("kayıt ve giriş CTA'ları kokpite next parametresiyle gider", () => {
    expect(page).toContain('const PANEL_PATH = "/panel/e-ticaret"');
    expect(page).toContain("buildCitizenRegisterHref(PANEL_PATH)");
    expect(page).toContain("buildCitizenLoginHref(PANEL_PATH)");
    expect(page).toContain("TRIAL_COPY.cta");
    expect(isProtectedCitizenPath("/panel/e-ticaret")).toBe(true);
  });

  it("deneme tutarı ve yenileme metni tek SSOT'tan okunur; tutar sabit yazılmaz", () => {
    expect(page).toContain("TRIAL_COPY");
    expect(page).toContain("renewalLabel");
    expect(page).toContain("RENEWAL_FALLBACK");
    expect(page).not.toMatch(/\b1(,00)? TL\b/u);
    expect(page).not.toMatch(/1\.490/u);
  });

  it("pazaryeri kapsamı Trendyol ve Hepsiburada; vitrinde Amazon ve N11 geçmez", () => {
    expect(page).toContain("Trendyol ve Hepsiburada");
    expect(page).not.toMatch(/Amazon|N11/u);
    expect(read("lib/pricing/public-vitrine.ts")).not.toMatch(/Amazon|N11/u);
    expect(read("app/llms.txt/route.ts")).not.toMatch(/Amazon|N11/u);
  });

  it("dört kâr motoru canlı özellik olarak sunulur; 'henüz canlı değil' iddiası yoktur", () => {
    expect(page).toContain("Dört kâr ve büyüme motoru");
    expect(page).toContain("Kâr korumalı indirim");
    expect(page).toContain("Barem kırıcı paketler");
    expect(page).toContain("Günlük kâr özeti");
    expect(page).toContain("Ne satılır? radarı");
    expect(page).not.toContain("Henüz canlı değil");
  });

  it("sen aksı: vitrin metni siz kalıbı taşımaz", () => {
    // JSX özniteliklerini (`size="lg"`, `href="…"`) ayıkla; yalnız kullanıcıya giden metin taranır.
    const visibleCopy = page.replace(/\b[a-zA-Z]+="[^"]*"/gu, "");
    expect(visibleCopy).not.toMatch(/\b(siz|sizin|sizi|size|hesabınız|yapabilirsiniz)\b/iu);
  });

  it("kokpit ve mağaza odası kendi hata sınırı kopyasını taşır", () => {
    const cockpit = read("app/(kernel)/panel/e-ticaret/error.tsx");
    const store = read("app/(kernel)/magazam/error.tsx");
    expect(cockpit).toContain("PUBLIC_SEN.error.rooms.eticaret");
    expect(cockpit).toContain('eyebrow="E-Ticaret"');
    expect(cockpit).toContain('backHref="/dashboard"');
    expect(store).toContain("PUBLIC_SEN.error.rooms.magazam");
    expect(store).toContain('eyebrow="Mağazam"');
    expect(store).toContain('backHref="/panel/e-ticaret"');
    expect(PUBLIC_SEN.error.rooms.eticaret).toContain("E-Ticaret");
    expect(PUBLIC_SEN.error.rooms.magazam).toContain("Mağaza");
  });
});
