import { beforeEach, describe, expect, it } from "vitest";
import type { InvokeLlmInput, LlmGatewayResult } from "@/lib/kernel/ai/types";
import { TEZGAH_FAIL_MESSAGE, TEZGAH_GUEST_QUOTA_MESSAGE } from "@/lib/tezgah/catalog";
import { resetTezgahQuotaForTests } from "@/lib/tezgah/quota";
import { buildPazaryeriTable, clipPazaryeriTitle } from "@/lib/tezgah/pazaryeri/csv";
import {
  PAZARYERI_FILENAME,
  PAZARYERI_MARKETS,
  PAZARYERI_MAX_PRODUCTS,
} from "@/lib/tezgah/pazaryeri/copy";
import { generatePazaryeriCatalog, PAZARYERI_MAX_OUTPUT_TOKENS, PAZARYERI_MODEL_ROLE } from "@/lib/tezgah/pazaryeri/engine";
import { parsePazaryeriProducts } from "@/lib/tezgah/pazaryeri/parse";
import { pazaryeriSystemPrompt } from "@/lib/tezgah/pazaryeri/prompts";
import { generateReklamPackage } from "@/lib/tezgah/reklam/engine";
import type { ReklamGenerateRequest } from "@/lib/tezgah/reklam/schema";

const NOW = new Date("2026-11-14T12:00:00+03:00");

const PRODUCTS = [
  "Pamuklu battaniye",
  "Kategori: Anne ve bebek",
  "Renk: Ekru",
  "Koku: vanilya",
  "Fiyat: 1499",
  "Barkod: 8690000000001",
  "",
  "Bebek tulumu",
  "Kategori: Anne ve bebek",
  "Beden: 0-3 ay",
  "Renk: =1+1",
].join("\n");

function okText(text: string): LlmGatewayResult {
  return {
    text,
    model: "gemini-3.5-flash-lite",
    provider: "gemini",
    usage: { promptTokens: 20, completionTokens: 40, totalTokens: 60 },
  };
}

function modelCopy(firstTitle: string, secondTitle = "Bebek tulumu"): string {
  return [
    "## 1",
    `Başlık: ${firstTitle}`,
    "- Yıkanır ve gün boyu yumuşak durur",
    "- 1499 TL bugün",
    "## 2",
    `Başlık: ${secondTitle}`,
    "- Rahat kesim ve gün boyu giyilir",
  ].join("\n");
}

function block(name: string): string {
  return `${name}\nKategori: Gıda\nRenk: Beyaz`;
}

function csvLines(csv: string): string[] {
  expect(csv.startsWith("\uFEFF")).toBe(true);
  return csv.slice(1).split("\n");
}

describe("pazaryeri katalog fabrikası", () => {
  beforeEach(() => {
    resetTezgahQuotaForTests();
  });

  it("blok tavanını, özellik aktarımını ve formül kaçışını kod basar", () => {
    expect(PAZARYERI_MARKETS.map((market) => [market.id, market.titleCap])).toEqual([
      ["trendyol", 100],
      ["hepsiburada", 150],
      ["amazon", 200],
    ]);
    expect(clipPazaryeriTitle("Pamuklu bebek battaniyesi", 10)).toBe("Pamuklu");
    expect(clipPazaryeriTitle("kısa başlık", 100)).toBe("kısa başlık");
    expect(clipPazaryeriTitle("A".repeat(120), 100)).toBeNull();

    const maxed = Array.from({ length: PAZARYERI_MAX_PRODUCTS }, (_, index) => block(`Ürün ${index + 1}`)).join(
      "\n\n",
    );
    const overflow = `${maxed}\n\n${block("Ürün fazla")}`;
    expect(parsePazaryeriProducts(maxed)?.length).toBe(25);
    expect(parsePazaryeriProducts(overflow)).toBeNull();
    expect(parsePazaryeriProducts(`${"A".repeat(81)}\nKategori: Gıda`)).toBeNull();
    const fat = ["Ekmek", "Kategori: Gıda", ...Array.from({ length: 6 }, (_, index) => `Not${index}: ${"a".repeat(80)}`)].join(
      "\n",
    );
    expect(fat.length).toBeGreaterThan(500);
    expect(parsePazaryeriProducts(fat)).toBeNull();
    expect(parsePazaryeriProducts("Yalnız ad")).toBeNull();

    const parsed = parsePazaryeriProducts(PRODUCTS);
    expect(parsed).not.toBeNull();
    if (!parsed) {
      return;
    }
    expect(parsed[0]?.fields).toEqual([{ column: "Renk", value: "Ekru" }]);
    expect(parsed[0]?.other).toBe("Koku: vanilya");
    expect(parsed[0]?.priceMinor).toBe(149_900);
    expect(parsed[0]?.stockQty).toBeNull();
    expect(parsed[1]?.fields).toEqual([
      { column: "Beden", value: "0-3 ay" },
      { column: "Renk", value: "=1+1" },
    ]);
    expect(JSON.stringify(parsed)).not.toContain("8690000000001");

    const duplicate = parsePazaryeriProducts("Ürün\nKategori: Gıda\nRenk: Beyaz\nRenk: Siyah");
    expect(duplicate?.[0]?.fields).toEqual([{ column: "Renk", value: "Beyaz" }]);
    expect(duplicate?.[0]?.other).toBe("Renk: Siyah");

    const escaped = buildPazaryeriTable({
      marketLabel: "Trendyol",
      rows: [
        {
          title: "=CMD",
          description: "yumuşak, yıkanır",
          category: "-gizli",
          taxonomyPath: "Ev & Yaşam > Mutfak Gereçleri",
          fields: [{ column: "Renk", value: "@SUM" }],
          other: "\t=1",
          priceMinor: null,
          stockQty: null,
        },
        {
          title: "+yol",
          description: '5" tabak',
          category: "Mutfak",
          taxonomyPath: "",
          fields: [],
          other: "",
          priceMinor: 12_500,
          stockQty: 3,
        },
      ],
    });
    const lines = csvLines(escaped.csv);
    expect(lines[1]).toContain("'=CMD");
    expect(lines[1]).toContain('"yumuşak, yıkanır"');
    expect(lines[1]).toContain("'-gizli");
    expect(lines[1]).toContain("'@SUM");
    expect(lines[1]).toContain("'\t=1");
    expect(lines[2]).toContain("'+yol");
    expect(lines[2]).toContain('"5"" tabak"');
    expect(lines[0]?.endsWith("Barkod,Fiyat,Stok")).toBe(true);
    expect(lines[1]?.endsWith(",,,")).toBe(true);
    expect(lines[2]?.endsWith(",,125,3")).toBe(true);
  });

  it("satır sayısı blok sayısıyla örtüşür; kullanıcı fiyatı dolar, barkod boş kalır", async () => {
    const seen: InvokeLlmInput[] = [];
    const result = await generatePazaryeriCatalog(
      { actorId: "guest:pazaryeri-engine", guest: true, request: { market: "trendyol", products: PRODUCTS } },
      {
        now: () => NOW,
        invoke: async (input) => {
          seen.push(input);
          return okText(modelCopy("Pamuklu bebek battaniyesi"));
        },
      },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.filename).toBe(PAZARYERI_FILENAME);
    expect(result.remaining).toBe(2);
    expect(result.rows).toHaveLength(2);
    expect(result.columns).toEqual([
      "Pazaryeri",
      "Urun Adi",
      "Aciklama",
      "Kategori",
      "Pazaryeri Kategori",
      "Renk",
      "Beden",
      "Diger",
      "Barkod",
      "Fiyat",
      "Stok",
    ]);
    const lines = csvLines(result.csv);
    expect(lines).toHaveLength(4);
    expect(lines.at(-1)).toContain("https://yetkin.ai/tezgah");
    expect(result.rows[0]?.[4]).toContain("Anne");
    expect(result.csv).toContain("1499");
    expect(result.csv).not.toContain("8690000000001");
    expect(result.rows[0]?.slice(-3)).toEqual(["", "1499", ""]);
    expect(result.rows[1]?.slice(-3)).toEqual(["", "", ""]);
    expect(seen[0]?.role).toBe(PAZARYERI_MODEL_ROLE);
    expect(seen[0]?.temperature).toBe(0.2);
    expect(seen[0]?.maxOutputTokens).toBe(PAZARYERI_MAX_OUTPUT_TOKENS);
    expect(seen[0]?.billing).toMatchObject({ source: "tezgah", recordUsage: true, userId: null });
    expect(seen[0]?.system).toBe(pazaryeriSystemPrompt(2, 100));
    expect(seen[0]?.system).not.toMatch(/resmi/i);
    expect(seen[0]?.user).not.toContain("8690000000001");
    expect(seen[0]?.user).toContain("Renk: Ekru");

    for (let extra = 0; extra < 2; extra += 1) {
      const mid = await generatePazaryeriCatalog(
        { actorId: "guest:pazaryeri-engine", guest: true, request: { market: "trendyol", products: PRODUCTS } },
        { now: () => NOW, invoke: async () => okText(modelCopy("Pamuklu bebek battaniyesi")) },
      );
      expect(mid.ok).toBe(true);
    }
    const blocked = await generatePazaryeriCatalog(
      { actorId: "guest:pazaryeri-engine", guest: true, request: { market: "trendyol", products: PRODUCTS } },
      { now: () => NOW, invoke: async () => okText(modelCopy("Pamuklu bebek battaniyesi")) },
    );
    expect(blocked).toMatchObject({ ok: false, status: 429, error: TEZGAH_GUEST_QUOTA_MESSAGE, remaining: 0 });
  });

  it("taşan tek kelime, eksik satır ve tavan üstü ürün hakkı ya geri yazar ya da hiç düşürmez", async () => {
    const one = "Ekmek\nKategori: Gıda\nRenk: Beyaz";
    const longWord = await generatePazaryeriCatalog(
      { actorId: "guest:pazaryeri-word", guest: true, request: { market: "trendyol", products: one } },
      { now: () => NOW, invoke: async () => okText(["## 1", `Başlık: ${"A".repeat(150)}`, "- Taze çıkar"].join("\n")) },
    );
    expect(longWord).toMatchObject({ ok: false, status: 503, error: TEZGAH_FAIL_MESSAGE, remaining: 3 });

    const clipped = await generatePazaryeriCatalog(
      { actorId: "guest:pazaryeri-clip", guest: true, request: { market: "hepsiburada", products: one } },
      {
        now: () => NOW,
        invoke: async (input) => {
          expect(input.system).toContain("150");
          expect(input.system).not.toMatch(/resmi/i);
          return okText(["## 1", `Başlık: ${Array.from({ length: 20 }, () => "pamuklu").join(" ")}`, "- Taze çıkar"].join("\n"));
        },
      },
    );
    expect(clipped.ok).toBe(true);
    if (!clipped.ok) {
      return;
    }
    const title = clipped.rows[0]?.[1] ?? "";
    expect([...title].length).toBeLessThanOrEqual(150);
    expect(title.startsWith("pamuklu")).toBe(true);
    expect(title.endsWith("pamuklu")).toBe(true);

    const mismatch = await generatePazaryeriCatalog(
      { actorId: "guest:pazaryeri-mismatch", guest: true, request: { market: "amazon", products: PRODUCTS } },
      { now: () => NOW, invoke: async () => okText(["## 1", "Başlık: Tek satır", "- Yumuşak durur"].join("\n")) },
    );
    expect(mismatch).toMatchObject({ ok: false, status: 503, error: TEZGAH_FAIL_MESSAGE, remaining: 3 });

    let calls = 0;
    const tooMany = await generatePazaryeriCatalog(
      {
        actorId: "guest:pazaryeri-overflow",
        guest: true,
        request: {
          market: "trendyol",
          products: Array.from({ length: PAZARYERI_MAX_PRODUCTS + 1 }, (_, index) => block(`Ürün ${index + 1}`)).join(
            "\n\n",
          ),
        },
      },
      {
        now: () => NOW,
        invoke: async () => {
          calls += 1;
          return okText("yok");
        },
      },
    );
    expect(calls).toBe(0);
    expect(tooMany).toMatchObject({ ok: false, status: 400, remaining: 3, limit: 3 });
  });

  it("reklam ile aynı günlük hak havuzunu kullanır", async () => {
    const actorId = "guest:faz3-shared";
    const reklam: ReklamGenerateRequest = {
      businessName: "Karaoğlu Fırın",
      sector: "restoran",
      place: "Kadıköy",
      aim: "call",
      offer: "İkinci poğaça bedava",
    };
    const reklamMatrix = [
      "## Varyant A — Sorun & Çözüm",
      "### Google başlıklar",
      "- Sabah taze çıkar",
      "- İkinci poğaça",
      "- Mahalle fırını",
      "### Google açıklamalar",
      "- Kadıköy'de taze ekmek ve poğaça.",
      "- İkinci poğaça bedava, hemen arayın.",
      "### Meta başlık",
      "Kadıköy fırını",
      "### Meta metin",
      "Taze ekmek ve poğaça için dükkana bekleriz.",
      "### Anahtar kelimeler",
      "- kadıköy fırın",
      "- taze ekmek",
      "- poğaça",
      "### Negatif anahtar kelimeler",
      "- ucuz fırın",
      "- toptan un",
      "### Görsel brif",
      "Kadraj: tezgah üstü ekmek",
      "Görsel üstü yazı: Taze çıktı",
      "Gösterilmeyecek: fiyat etiketi",
      "## Varyant B — Güven & Uzmanlık",
      "### Google başlıklar",
      "- Mahalle ustası",
      "- Günlük taze un",
      "- Kadıköy fırını",
      "### Google açıklamalar",
      "- Yerel fırından taze ekmek.",
      "- İkinci poğaça bedava kampanyası.",
      "### Meta başlık",
      "Güvenilir fırın",
      "### Meta metin",
      "Mahallede yıllardır aynı kalite.",
      "### Anahtar kelimeler",
      "- kadıköy fırın",
      "- taze ekmek",
      "- poğaça",
      "### Negatif anahtar kelimeler",
      "- ucuz fırın",
      "- toptan un",
      "### Görsel brif",
      "Kadraj: tezgah üstü ekmek",
      "Görsel üstü yazı: Taze çıktı",
      "Gösterilmeyecek: fiyat etiketi",
      "## Varyant C — Net Teklif & Hızlı Aksiyon",
      "### Google başlıklar",
      "- Bugün yazın",
      "- İkinci poğaça",
      "- Hemen arayın",
      "### Google açıklamalar",
      "- İkinci poğaça bedava. Hemen arayın.",
      "- Kadıköy tezgahına bugün uğrayın.",
      "### Meta başlık",
      "Hemen arayın",
      "### Meta metin",
      "İkinci poğaça bedava için hemen arayın.",
      "### Anahtar kelimeler",
      "- kadıköy fırın",
      "- taze ekmek",
      "- poğaça",
      "### Negatif anahtar kelimeler",
      "- ucuz fırın",
      "- toptan un",
      "### Görsel brif",
      "Kadraj: tezgah üstü ekmek",
      "Görsel üstü yazı: Taze çıktı",
      "Gösterilmeyecek: fiyat etiketi",
    ].join("\n");
    const opened = await generateReklamPackage(
      { actorId, guest: true, request: reklam },
      {
        now: () => NOW,
        invoke: async () => okText(reklamMatrix),
      },
    );
    expect(opened.ok).toBe(true);
    for (let extra = 0; extra < 2; extra += 1) {
      const mid = await generateReklamPackage(
        { actorId, guest: true, request: reklam },
        {
          now: () => NOW,
          invoke: async () => okText(reklamMatrix),
        },
      );
      expect(mid.ok).toBe(true);
    }

    let calls = 0;
    const next = await generatePazaryeriCatalog(
      { actorId, guest: true, request: { market: "trendyol", products: PRODUCTS } },
      {
        now: () => NOW,
        invoke: async () => {
          calls += 1;
          return okText(modelCopy("Pamuklu bebek battaniyesi"));
        },
      },
    );
    expect(calls).toBe(0);
    expect(next).toMatchObject({ ok: false, status: 429, error: TEZGAH_GUEST_QUOTA_MESSAGE, remaining: 0 });
  });
});
