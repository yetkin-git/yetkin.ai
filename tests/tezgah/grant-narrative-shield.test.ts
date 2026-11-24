import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import { readGrantDossierNarrative, readGrantNarrative } from "@/lib/tezgah/grant/narrative";

const YEAR = "2026 yılında depo kendi satış kanalına bağlanır.";
const LONG = "İşletme ürünü bozulmadan kendi kanalına ulaştırır ve talep ölçümü ayrıca yazılır.";

function narrative(purpose: string, market = LONG, risk = LONG): string {
  return JSON.stringify({ purpose, market, risk });
}

describe("YetkinHibe halüsinasyon kalkanı", () => {
  it("yüzde altmış ve iki yüz bin lira reddedilir; 2026 yılında kalır", () => {
    expect(readGrantNarrative(narrative(YEAR, YEAR, YEAR))).toEqual({
      purpose: YEAR,
      market: YEAR,
      risk: YEAR,
    });
    expect(readGrantNarrative(narrative("yüzde altmış oranında bu satır destek iddiası taşır."))).toBeNull();
    expect(readGrantNarrative(narrative(LONG, "iki yüz bin lira bu satırda geçmez ve yazılmaz.", LONG))).toBeNull();
    expect(readGrantNarrative(narrative("Yüzde 60 oranla desteklenir ve bu cümle yeterince uzundur."))).toBeNull();
  });

  it("dosya anlatısında da yazılı tutar düşer", () => {
    const body = {
      purpose: YEAR,
      market: YEAR,
      risk: YEAR,
      summary: YEAR,
      budgetRationale: "iki yüz bin lira gerekçesi bu bölümde duramaz.",
      competencyNote: YEAR,
      commercialization: YEAR,
    };
    expect(readGrantDossierNarrative(JSON.stringify(body))).toBeNull();
    expect(
      readGrantDossierNarrative(
        JSON.stringify({
          ...body,
          budgetRationale: YEAR,
        }),
      ),
    ).not.toBeNull();
  });

  it("hibe üretimi AI_TOKEN_SOURCES.GRANT kullanır", () => {
    expect(AI_TOKEN_SOURCES.GRANT).toBe("grant");
    const engine = readFileSync(join(process.cwd(), "lib", "tezgah", "grant", "engine.ts"), "utf8");
    expect(engine).toContain("source: AI_TOKEN_SOURCES.GRANT");
    expect(engine).not.toContain("source: AI_TOKEN_SOURCES.TEZGAH");
  });
});
