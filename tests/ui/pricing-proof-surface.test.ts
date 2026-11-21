import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildHomeProofLines,
  HOME_PROOF_MIN_COUNT,
  isPublishableProofCount,
  type HomeSocialProof,
} from "@/lib/pricing/home-social-proof";
import { TALENT_DIRECTORY_K_MIN } from "@/lib/career/k-anonymity";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const ZERO: HomeSocialProof = {
  verifiedSeals: 0,
  publicCards: 0,
  documents: 0,
  verifiedExperts: 0,
};

describe("ana sayfa sosyal kanıt — sahte veri yasağı", () => {
  it("tüm sayaçlar sıfırken hiçbir satır üretmez (boş şerit)", () => {
    expect(buildHomeProofLines(ZERO)).toEqual([]);
    // Veri yoksa bileşen hiçbir şey basmaz.
    const strip = readSrc("components/public/home-social-proof-strip.tsx");
    expect(strip).toContain("lines.length === 0");
    expect(strip).toContain("return null");
    expect(strip).toContain("data-home-social-proof");
  });

  it("eşiğin altındaki sayaç yayımlanmaz; eşik aşılınca satır çıkar", () => {
    expect(HOME_PROOF_MIN_COUNT).toBeGreaterThan(0);
    expect(isPublishableProofCount(0)).toBe(false);
    expect(isPublishableProofCount(1)).toBe(false);
    expect(isPublishableProofCount(HOME_PROOF_MIN_COUNT - 1)).toBe(false);
    expect(isPublishableProofCount(HOME_PROOF_MIN_COUNT)).toBe(true);
    expect(isPublishableProofCount(3.5)).toBe(false);

    const tiny = buildHomeProofLines({ ...ZERO, documents: 1 });
    expect(tiny).toEqual([]);
    const enough = buildHomeProofLines({ ...ZERO, documents: 42 });
    expect(enough).toHaveLength(1);
    expect(enough[0]?.id).toBe("documents");
    // Sayı tr-TR biçiminde basılır; uydurma metin yok.
    expect(enough[0]?.label).toContain("42");
    expect(enough[0]?.label).toContain("belge");
  });

  it("uzman sayacı k-anonimlik eşiği ile ürün tabanının büyüğünü arar", () => {
    const belowK = buildHomeProofLines({ ...ZERO, verifiedExperts: TALENT_DIRECTORY_K_MIN - 1 });
    expect(belowK.some((line) => line.id === "experts")).toBe(false);
    const atThreshold = buildHomeProofLines({
      ...ZERO,
      verifiedExperts: Math.max(TALENT_DIRECTORY_K_MIN, HOME_PROOF_MIN_COUNT),
    });
    expect(atThreshold.some((line) => line.id === "experts")).toBe(true);
  });

  it("binlik ayırıcı tr-TR biçimindedir", () => {
    const lines = buildHomeProofLines({ ...ZERO, verifiedSeals: 1234 });
    expect(lines[0]?.label).toContain("1.234");
  });

  it("sayaçlar DB'den okunur; DB yoksa sıfır döner (uydurma yok)", () => {
    const source = readSrc("lib/pricing/home-social-proof.ts");
    expect(source).toContain('import "server-only"');
    expect(source).toContain("yetkinCvSeal.count");
    expect(source).toContain("tezgahOutput.count");
    expect(source).toContain("DATABASE_URL");
    expect(source).toContain("catch {");
    // Kişisel veri seçilmez; yalnız sayım.
    expect(source).not.toContain("user:");
    expect(source).not.toContain("displayName");
    expect(source).not.toContain("email");
    // Uydurma referans/yorum metni yok.
    for (const fake of ["testimonial", "trustpilot", "logo duvarı"]) {
      expect(source.toLowerCase()).not.toContain(fake);
    }
  });

  it("ana sayfa şeridi gerçek yükleyiciye bağlar", () => {
    const page = readSrc("app/(public)/page.tsx");
    expect(page).toContain("HomeSocialProofStrip");
    expect(page).toContain("loadHomeSocialProof");
    expect(page).toContain("buildHomeProofLines");
  });
});

describe("fiyatlandırma karşılaştırma matrisi", () => {
  it("semantik tablo basar: caption + thead + tbody ve dört özellik satırı", () => {
    const page = readSrc("app/(public)/fiyatlandirma/page.tsx");
    expect(page).toContain("data-pricing-compare");
    expect(page).toContain("<table");
    expect(page).toContain("<caption");
    expect(page).toContain("<thead");
    expect(page).toContain("<tbody");
    expect(page).toContain("scope=\"col\"");
    expect(page).toContain("scope=\"row\"");
    for (const feature of [
      "Günlük Tezgâh Kotası",
      "DOCX / ZIP İndirme",
      "Pazaryeri Entegrasyonu",
      "Hibe Dosyası",
      "YetkinCV Pasaportu",
      "Öncelikli Destek",
    ]) {
      expect(page, feature).toContain(feature);
    }
    // Sütunlar paket kimlikleriyle hizalı.
    for (const column of ["Ücretsiz", "Tezgâh Pro", "E-Ticaret", "Hibe Dosyası", "YetkinCV", "Kurumsal"]) {
      expect(page, column).toContain(column);
    }
  });

  it("kota satırı gerçek misafir limitini koddan okur", () => {
    const page = readSrc("app/(public)/fiyatlandirma/page.tsx");
    expect(page).toContain("TEZGAH_GUEST_DAILY_LIMIT");
    expect(page).toContain("from \"@/lib/tezgah/catalog\"");
  });

  it("fiyat kartında ürün karşılığı olmayan satır kalmadı", () => {
    const vitrine = readSrc("lib/pricing/public-vitrine.ts");
    expect(vitrine).not.toContain("Seviye Testi");
    expect(vitrine).toContain("YetkinCV & Yetkinlik Pasaportu");
  });
});
