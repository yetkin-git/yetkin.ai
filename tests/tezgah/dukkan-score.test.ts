import { describe, expect, it } from "vitest";
import { DUKKAN_CTA_LABEL, DUKKAN_SECTORS, DUKKAN_TONES } from "@/lib/tezgah/dukkan/copy";
import { renderDukkanHtml } from "@/lib/tezgah/dukkan/render";
import { readDukkanDraft, type DukkanDraft, type DukkanGenerateRequest } from "@/lib/tezgah/dukkan/schema";
import { parseHomepageHtml } from "@/lib/tezgah/tetkik/parse-html";
import { scoreHomepageHtml } from "@/lib/tezgah/tetkik/score";

const BASE: DukkanGenerateRequest = {
  businessName: "Karaoğlu Fırın",
  sector: "restoran",
  place: "Kadıköy",
  whatsapp: "0532 111 22 33",
  services: "Taze ekmek\nPoğaça\nSimit",
  tone: "sicak",
};

function draft(overrides: Partial<DukkanGenerateRequest> = {}): DukkanDraft {
  const read = readDukkanDraft({ ...BASE, ...overrides });
  if (!read) {
    throw new Error("örnek dükkan okunamadı");
  }
  return read;
}

function scoreOf(html: string) {
  return scoreHomepageHtml(html, {
    https: true,
    ttfbMs: 1,
    htmlBytes: new TextEncoder().encode(html).length,
  });
}

describe("sektörel dijital dükkan öz-skoru", () => {
  it("altı sektörde ve beş tonda 100 puan basar", () => {
    for (const sector of DUKKAN_SECTORS) {
      const html = renderDukkanHtml(draft({ sector: sector.id }));
      const scored = scoreOf(html);
      const failed = scored.checks.filter((check) => !check.passed).map((check) => check.id);
      expect(failed, sector.id).toEqual([]);
      expect(scored.score, sector.id).toBe(100);
      expect(html).toContain(DUKKAN_CTA_LABEL[sector.cta]);
      expect(html).toContain("https://wa.me/905321112233");
      expect(html).toContain("tel:+905321112233");
      expect(html).toContain('action="https://api.whatsapp.com/send"');
      expect(html).not.toMatch(/<img\b/i);
      expect(html).not.toMatch(/fonts\.google|cdn\.tailwind|<script/i);
    }
    for (const tone of DUKKAN_TONES) {
      const html = renderDukkanHtml(draft({ tone: tone.id }));
      expect(scoreOf(html).score, tone.id).toBe(100);
      expect(html).toContain(tone.paper);
    }
  });

  it("başlık ve açıklama penceresi kısa, uzun ve güvenli adla da 100 kalır", () => {
    const cases: Partial<DukkanGenerateRequest>[] = [
      { businessName: "Ab", place: "Kk" },
      {
        businessName: "A".repeat(80),
        place: "B".repeat(80),
        services: ["Ekmek cesidi", "Pogaca", "Simit", "Acma", "C"].map((line) => line.padEnd(80, "x")).join("\n"),
        tone: "gece",
        sector: "magaza",
      },
      { businessName: "A & B Fırın", place: "Kadıköy, İstanbul", sector: "emlak", tone: "net" },
    ];
    for (const sample of cases) {
      const html = renderDukkanHtml(draft(sample));
      const parsed = parseHomepageHtml(html);
      expect(parsed.title.length, sample.businessName).toBeGreaterThanOrEqual(10);
      expect(parsed.title.length, sample.businessName).toBeLessThanOrEqual(60);
      expect(parsed.metaDescription.length, sample.businessName).toBeGreaterThanOrEqual(50);
      expect(parsed.metaDescription.length, sample.businessName).toBeLessThanOrEqual(160);
      expect(parsed.headingLevels[0]).toBe(1);
      expect(parsed.headingLevels.filter((level) => level === 1)).toHaveLength(1);
      expect(parsed.headingLevels.slice(1).every((level) => level === 2)).toBe(true);
      expect(parsed.whatsapp).toBe(true);
      expect(parsed.phone).toBe(true);
      expect(parsed.form).toBe(true);
      expect(parsed.cta).toBe(true);
      expect(parsed.images).toEqual([]);
      expect(scoreOf(html).score).toBe(100);
    }
    const ampersand = renderDukkanHtml(draft({ businessName: "A & B Fırın" }));
    expect(ampersand).toContain("A &amp; B");
    expect(ampersand).not.toContain("A & B");
  });

  it("klinik kopyası randevu ve saatle sınırlıdır", () => {
    const html = renderDukkanHtml(draft({ sector: "klinik", tone: "sakin" })).toLocaleLowerCase("tr-TR");
    expect(html).not.toMatch(/tedavi|ilaç|ameliyat|ağrı|iyileş|teşhis|reçete/);
    expect(html).toContain("randevu");
  });
});
