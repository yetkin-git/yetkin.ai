import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { HOME_LANDING_FAQ } from "@/lib/copy/sem-keywords";
import { resolveHomeOfferState } from "@/lib/yetkinhibe/home-offer-state";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("ana sayfa hibe hazırlığı bölümü (V1)", () => {
  it("önizleme yalnız iki oda da kapalıyken açılır; açık oda bölümü gizler", () => {
    expect(resolveHomeOfferState({ yetkinhibeKapali: true, freelancerKapali: true })).toBe("preview");
    expect(resolveHomeOfferState({ yetkinhibeKapali: false, freelancerKapali: true })).toBe("hidden");
    expect(resolveHomeOfferState({ yetkinhibeKapali: true, freelancerKapali: false })).toBe("hidden");
    expect(resolveHomeOfferState({ yetkinhibeKapali: false, freelancerKapali: false })).toBe("hidden");
  });

  it("ölü hibe önizleme bileşeni ve copy ana sayfada yoktur", () => {
    expect(existsSync(join(ROOT, "components/public/home-offer-section.tsx"))).toBe(false);
    const page = readSrc("app/(public)/page.tsx");
    const copy = readSrc("lib/copy/sen-voice/public.ts");
    expect(page).not.toContain("HomeOfferSection");
    expect(page).not.toContain("resolveHomeOfferState");
    expect(page).not.toContain("Hazırlanıyor");
    expect(page).not.toContain("İki yol da henüz");
    expect(copy).not.toContain("offers:");
    expect(copy).not.toContain("Hazırlanıyor");
    expect(page).toContain("home-chain-heading");
    expect(page).toContain("OFF_101_EXEMPTION_PATH");
    expect(page).not.toContain("/freelancer");
    expect(page).not.toContain("/career");
    expect(page).not.toMatch(/4\.900|14\.900/u);
  });

  it("ana sayfa SSS'si siz kalıbı taşımaz (büyük/küçük harf duyarsız tarama)", () => {
    const lower = HOME_LANDING_FAQ.flatMap((row) => [row.question, row.answer])
      .join("\n")
      .toLocaleLowerCase("tr");
    expect(lower).not.toMatch(/(?<!\p{L})siz\p{L}*/u);
    expect(lower).not.toMatch(
      /(?:ınız|iniz|unuz|ünüz|sınız|siniz|sunuz|sünüz|musunuz|mısınız|misiniz|müsünüz)(?!\p{L})/u,
    );
  });

  it("SSS ücretsiz yetkinlik testini kayıt ve barajla anlatır", () => {
    expect(HOME_LANDING_FAQ).toHaveLength(6);
    const row = HOME_LANDING_FAQ.find((item) => item.question === "Ücretsiz yetkinlik testi nasıl işler?");
    expect(row?.answer).toContain("Temel Muafiyet Rozeti");
    expect(row?.answer).not.toContain("Hazırlanıyor");
  });
});
