import { csvCell } from "@/lib/tezgah/pazaryeri/csv";
import {
  PAZARYERI_DIGER,
  PAZARYERI_LEAD,
  PAZARYERI_MARKETS,
  PAZARYERI_MAX_PRODUCTS,
  PAZARYERI_TAIL,
  PAZARYERI_TAXONOMY_COLUMN,
  type PazaryeriId,
} from "@/lib/tezgah/pazaryeri/copy";
import { parseStockQty, parseTlToMinor } from "@/lib/tezgah/pazaryeri/parse";

const RESERVED = new Set<string>([
  ...PAZARYERI_LEAD,
  PAZARYERI_TAXONOMY_COLUMN,
  ...PAZARYERI_TAIL,
  PAZARYERI_DIGER,
]);

export function sealCommerceCsvCell(value: string): string {
  return csvCell(value);
}

function readPriceMinor(cell: string): number | null {
  const parsed = parseTlToMinor(cell);
  return parsed === undefined ? null : parsed;
}

function readOnHand(cell: string): number {
  const parsed = parseStockQty(cell);
  if (parsed == null || parsed === undefined) {
    return 0;
  }
  return parsed;
}

export function catalogTableToDraftImport(input: {
  market: string;
  columns: readonly string[];
  rows: readonly (readonly string[])[];
}):
  | {
      ok: true;
      body: {
        mode: "draft";
        market: PazaryeriId;
        rows: Array<{
          title: string;
          description: string;
          category: string;
          attributes: Array<{ column: string; value: string }>;
          other: string;
          sku: null;
          barcode: null;
          amountMinor: number | null;
          onHandQty: number;
          safetyBuffer: 0;
        }>;
      };
    }
  | { ok: false; error: string } {
  const market = PAZARYERI_MARKETS.find((item) => item.id === input.market);
  if (!market) {
    return { ok: false, error: "Pazaryeri seçilmelidir." };
  }
  if (input.rows.length < 1 || input.rows.length > PAZARYERI_MAX_PRODUCTS) {
    return { ok: false, error: `Aktarma 1 ile ${PAZARYERI_MAX_PRODUCTS} satır alır.` };
  }
  const index = new Map(input.columns.map((column, columnIndex) => [column, columnIndex]));
  for (const column of PAZARYERI_LEAD) {
    if (!index.has(column)) {
      return { ok: false, error: "Katalog sütunları eksik." };
    }
  }
  const marketIndex = index.get("Pazaryeri");
  const titleIndex = index.get("Urun Adi");
  const descriptionIndex = index.get("Aciklama");
  const categoryIndex = index.get("Kategori");
  const taxonomyIndex = index.get(PAZARYERI_TAXONOMY_COLUMN);
  const otherIndex = index.get(PAZARYERI_DIGER);
  const priceIndex = index.get("Fiyat");
  const stockIndex = index.get("Stok");
  if (marketIndex == null || titleIndex == null || descriptionIndex == null || categoryIndex == null) {
    return { ok: false, error: "Katalog sütunları eksik." };
  }
  const attributeColumns = input.columns.filter((column) => !RESERVED.has(column));
  const rows = [];
  for (const row of input.rows) {
    if (row[marketIndex] !== market.label) {
      return { ok: false, error: "Pazaryeri sütunu seçilen pazarla örtüşmüyor." };
    }
    const title = (row[titleIndex] ?? "").trim();
    const description = (row[descriptionIndex] ?? "").trim();
    const userCategory = (row[categoryIndex] ?? "").trim();
    const taxonomyPath =
      taxonomyIndex == null ? "" : (row[taxonomyIndex] ?? "").trim();
    const category = (taxonomyPath || userCategory).slice(0, 80);
    if (!title || !description || !category) {
      return { ok: false, error: "Başlık, açıklama ve kategori zorunludur." };
    }
    const attributes = attributeColumns.flatMap((column) => {
      const value = (row[index.get(column) ?? -1] ?? "").trim();
      return value ? [{ column, value }] : [];
    });
    const amountMinor =
      priceIndex == null ? null : readPriceMinor((row[priceIndex] ?? "").trim());
    const onHandQty =
      stockIndex == null ? 0 : readOnHand((row[stockIndex] ?? "").trim());
    rows.push({
      title,
      description,
      category,
      attributes,
      other: otherIndex == null ? "" : (row[otherIndex] ?? "").trim(),
      sku: null,
      barcode: null,
      amountMinor,
      onHandQty,
      safetyBuffer: 0 as const,
    });
  }
  return { ok: true, body: { mode: "draft", market: market.id, rows } };
}
