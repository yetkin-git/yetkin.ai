import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { catalogTableToDraftImport } from "@/lib/commerce/pazaryeri-bridge";
import { PAZARYERI_IMPORT_MAX_ROWS } from "@/lib/commerce/validate";
import { resetTezgahQuotaForTests } from "@/lib/tezgah/quota";
import {
  pazaryeriReklamHandoffHref,
  pazaryeriStudioPhotoHandoffHref,
} from "@/lib/tezgah/pazaryeri/bridges";
import { PAZARYERI_MAX_PRODUCTS, PAZARYERI_TAXONOMY_COLUMN } from "@/lib/tezgah/pazaryeri/copy";
import { buildPazaryeriTable, csvCell } from "@/lib/tezgah/pazaryeri/csv";
import {
  buildPazaryeriDocx,
  buildPazaryeriDocxFromCsv,
  buildPazaryeriPdf,
  buildPazaryeriPdfFromCsv,
  parsePazaryeriCsvTable,
} from "@/lib/tezgah/pazaryeri/document";
import { generatePazaryeriCatalog } from "@/lib/tezgah/pazaryeri/engine";
import { parsePazaryeriProducts, parseTlToMinor } from "@/lib/tezgah/pazaryeri/parse";
import { matchPazaryeriTaxonomy } from "@/lib/tezgah/pazaryeri/taxonomy";

const NOW = new Date("2026-11-14T12:00:00+03:00");

function readSrc(rel: string): string {
  return readFileSync(join(process.cwd(), rel), "utf8");
}

function okText(text: string) {
  return {
    text,
    model: "gemini-3.5-flash-lite",
    provider: "gemini" as const,
    usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
  };
}

function numberedCopy(count: number): string {
  return Array.from({ length: count }, (_, index) =>
    ["## " + String(index + 1), `Başlık: Ürün başlık ${index + 1}`, "- Dayanıklı ve günlük kullanım"].join("\n"),
  ).join("\n");
}

describe("pazaryeri istasyonu — 25 ürün, taksonomi, teslimat, köprü", () => {
  beforeEach(() => {
    resetTezgahQuotaForTests();
  });

  it("25 ürüne kadar toplu katalog üretir; kullanıcı fiyat/stok korunur, uydurma fiyat engellenir", async () => {
    expect(PAZARYERI_MAX_PRODUCTS).toBe(25);
    expect(PAZARYERI_IMPORT_MAX_ROWS).toBe(25);

    const pipe = [
      "Pamuklu battaniye | SoftHome | 1499 | 12",
      "Kategori: Anne ve bebek",
      "Renk: Ekru",
    ].join("\n");
    const parsedPipe = parsePazaryeriProducts(pipe);
    expect(parsedPipe?.[0]?.priceMinor).toBe(149_900);
    expect(parsedPipe?.[0]?.stockQty).toBe(12);
    expect(parsedPipe?.[0]?.brand).toBe("SoftHome");
    expect(parseTlToMinor("1.299,50")).toBe(129_950);

    const bulk = Array.from({ length: 25 }, (_, index) =>
      [`Ürün ${index + 1} | Marka${index + 1} | ${100 + index} | ${index + 1}`, "Kategori: Mutfak", "Renk: Beyaz"].join(
        "\n",
      ),
    ).join("\n\n");
    const bulkParsed = parsePazaryeriProducts(bulk);
    expect(bulkParsed).toHaveLength(25);
    expect(bulkParsed?.[0]?.priceMinor).toBe(10_000);
    expect(bulkParsed?.[24]?.stockQty).toBe(25);

    const result = await generatePazaryeriCatalog(
      { actorId: "guest:pazaryeri-station-bulk", guest: true, request: { market: "trendyol", products: bulk } },
      {
        now: () => NOW,
        invoke: async () => okText(numberedCopy(25)),
      },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.rows).toHaveLength(25);
    expect(result.rows[0]?.slice(-3)).toEqual(["", "100", "1"]);
    expect(result.rows[24]?.slice(-3)).toEqual(["", "124", "25"]);

    const invented = await generatePazaryeriCatalog(
      {
        actorId: "guest:pazaryeri-station-invent",
        guest: true,
        request: {
          market: "trendyol",
          products: "Kupa\nKategori: Mutfak\nRenk: Beyaz",
        },
      },
      {
        now: () => NOW,
        invoke: async () =>
          okText(["## 1", "Başlık: Seramik kupa", "- 999 TL özel fiyat", "- Günlük kullanım"].join("\n")),
      },
    );
    expect(invented.ok).toBe(true);
    if (!invented.ok) {
      return;
    }
    expect(invented.csv).not.toContain("999");
    expect(invented.rows[0]?.[2]).not.toMatch(/999/);
    expect(invented.rows[0]?.slice(-3)).toEqual(["", "", ""]);
  });

  it("taksonomi kategori yolunu pazaryerine göre eşler", () => {
    const trendyol = matchPazaryeriTaxonomy({
      market: "trendyol",
      category: "Anne ve bebek",
      productName: "Pamuklu battaniye",
    });
    expect(trendyol.matched).toBe(true);
    expect(trendyol.path).toContain("Anne");

    const hb = matchPazaryeriTaxonomy({
      market: "hepsiburada",
      category: "Mutfak",
      productName: "Seramik kupa",
    });
    expect(hb.matched).toBe(true);
    expect(hb.path.toLocaleLowerCase("tr-TR")).toContain("mutfak");

    const miss = matchPazaryeriTaxonomy({
      market: "amazon",
      category: "xyzzy",
      productName: "qqqq",
    });
    expect(miss.matched).toBe(false);
    expect(miss.path).toBe("");
  });

  it("CSV formül enjeksiyonu + UTF-8 BOM + DOCX/PDF çıktısı mühürlüdür", () => {
    expect(csvCell("=1+1")).toBe("'=1+1");
    expect(csvCell("+CMD")).toBe("'+CMD");
    expect(csvCell("-gizli")).toBe("'-gizli");
    expect(csvCell("@SUM")).toBe("'@SUM");
    expect(csvCell("\t=1")).toBe("'\t=1");

    const table = buildPazaryeriTable({
      marketLabel: "Trendyol",
      rows: [
        {
          title: "=HACK",
          description: "yumuşak, güvenli",
          category: "Mutfak",
          taxonomyPath: "Ev & Yaşam > Mutfak Gereçleri",
          fields: [{ column: "Renk", value: "@RED" }],
          other: "",
          priceMinor: 25_000,
          stockQty: 4,
        },
      ],
    });
    expect(table.csv.startsWith("\uFEFF")).toBe(true);
    expect(table.csv).toContain("'=HACK");
    expect(table.csv).toContain("'@RED");
    expect(table.columns).toContain(PAZARYERI_TAXONOMY_COLUMN);
    expect(table.rows[0]?.slice(-3)).toEqual(["", "250", "4"]);

    const docx = buildPazaryeriDocx(table);
    const pdf = buildPazaryeriPdf(table);
    expect(docx.byteLength).toBeGreaterThan(40);
    expect(pdf.byteLength).toBeGreaterThan(40);
    expect(new TextDecoder().decode(pdf.slice(0, 5))).toBe("%PDF-");

    const fromCsv = parsePazaryeriCsvTable(table.csv);
    expect(fromCsv?.columns).toEqual(table.columns);
    expect(buildPazaryeriDocxFromCsv(table.csv).byteLength).toBeGreaterThan(40);
    expect(buildPazaryeriPdfFromCsv(table.csv).byteLength).toBeGreaterThan(40);

    const preview = readSrc("components/tezgah/pazaryeri-preview.tsx");
    expect(preview).toContain("Word (.docx) İndir");
    expect(preview).toContain("PDF İndir");
    expect(preview).toContain("data-pazaryeri-docx");
    expect(preview).toContain("data-pazaryeri-pdf");

    const portfolio = readSrc("components/tezgah/output-portfolio.tsx");
    expect(portfolio).toContain("data-pazaryeri-archive-csv");
    expect(portfolio).toContain("data-pazaryeri-archive-docx");
    expect(portfolio).toContain("data-pazaryeri-archive-pdf");
    expect(portfolio).toContain("PAZARYERI_FILENAME");
  });

  it("e-ticaret havuzu 25 satır aktarır; studio-photo ve reklam köprüleri ön-dolguludur", () => {
    const columns = [
      "Pazaryeri",
      "Urun Adi",
      "Aciklama",
      "Kategori",
      PAZARYERI_TAXONOMY_COLUMN,
      "Marka",
      "Barkod",
      "Fiyat",
      "Stok",
    ];
    const rows = Array.from({ length: 25 }, (_, index) => [
      "Trendyol",
      `Ürün ${index + 1}`,
      "Açıklama metni",
      "Mutfak",
      "Ev & Yaşam > Mutfak Gereçleri",
      "MarkaX",
      "",
      String(100 + index),
      String(index + 1),
    ]);
    const draft = catalogTableToDraftImport({ market: "trendyol", columns, rows });
    expect(draft.ok).toBe(true);
    if (!draft.ok) {
      return;
    }
    expect(draft.body.rows).toHaveLength(25);
    expect(draft.body.rows[0]?.amountMinor).toBe(10_000);
    expect(draft.body.rows[0]?.onHandQty).toBe(1);
    expect(draft.body.rows[0]?.category).toBe("Ev & Yaşam > Mutfak Gereçleri");
    expect(draft.body.rows[24]?.amountMinor).toBe(12_400);
    expect(draft.body.rows[24]?.onHandQty).toBe(25);

    const overflow = catalogTableToDraftImport({
      market: "trendyol",
      columns,
      rows: [...rows, rows[0]!],
    });
    expect(overflow.ok).toBe(false);

    const studio = pazaryeriStudioPhotoHandoffHref({
      market: "trendyol",
      productName: "Pamuklu battaniye",
      features: "Anne ve bebek · SoftHome",
    });
    expect(String(studio)).toContain("tool=studio-photo");
    expect(String(studio)).toContain("scene=trendyol-white");
    expect(String(studio)).toContain("productName=");

    const reklam = pazaryeriReklamHandoffHref({
      brandOrMarket: "SoftHome",
      category: "Anne ve bebek",
      productTitles: ["Pamuklu battaniye", "Bebek tulumu"],
    });
    expect(String(reklam)).toContain("tool=reklam");
    expect(String(reklam)).toContain("sector=eticaret");
    expect(String(reklam)).toContain("businessName=SoftHome");
    const reklamOffer = new URL(String(reklam), "https://yetkin.ai").searchParams.get("offer") ?? "";
    expect(reklamOffer).toContain("Öne çıkan ürünler");

    const preview = readSrc("components/tezgah/pazaryeri-preview.tsx");
    expect(preview).toContain("Bu Ürünler İçin Görsel Hazırla (studio-photo)");
    expect(preview).toContain("Bu Katalog İçin Reklam Paketi Oluştur");
    expect(preview).toContain("data-pazaryeri-studio-handoff");
    expect(preview).toContain("data-pazaryeri-reklam-handoff");

    const bridge = readSrc("lib/commerce/pazaryeri-bridge.ts");
    expect(bridge).toContain("PAZARYERI_MAX_PRODUCTS");
    expect(bridge).toContain("amountMinor");
    expect(bridge).toContain("onHandQty");
  });
});
