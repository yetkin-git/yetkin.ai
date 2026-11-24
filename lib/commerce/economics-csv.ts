/**
 * Birim maliyet ve kanal fiyatı CSV'si.
 * Tutarlar kuruş sütunundadır; ayrıştırma float kullanmaz.
 */

import { PRICE_CHANNELS, isPriceChannel, isRepriceStrategy, type PriceChannel, type RepriceStrategy } from "@/lib/commerce/repricer";

export const ECONOMICS_CSV_HEADER = [
  "sku",
  "ad",
  "stok",
  "maliyet_kurus",
  "kdv_bps",
  "maliyet_kdv_dahil",
  "desi_gram",
  "kanal",
  "baz_fiyat_kurus",
  "aktif_fiyat_kurus",
  "min_marj_bps",
  "manuel_taban_kurus",
  "strateji",
  "adim_kurus",
  "otomatik",
] as const;

export type EconomicsCsvRow = {
  sku: string;
  title: string;
  stockQty: number;
  costMinor: number | null;
  vatBps: number | null;
  costIncludesVat: boolean;
  desiGrams: number | null;
  channel: PriceChannel | null;
  basePriceMinor: number | null;
  activePriceMinor: number | null;
  minMarginBps: number | null;
  manualFloorMinor: number | null;
  strategy: RepriceStrategy | null;
  stepMinor: number | null;
  autoApply: boolean;
};

const MAX_ROWS = 5_000;

function csvCell(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  if (/[",\n\r]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

function parseIntCell(value: string): number | null {
  const text = value.trim();
  if (!text) {
    return null;
  }
  if (!/^\d{1,10}$/.test(text)) {
    return null;
  }
  const parsed = Number(text);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index] ?? "";
    if (quoted) {
      if (char === '"') {
        if (line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        current += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
      continue;
    }
    if (char === ",") {
      cells.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current);
  return cells;
}

export function renderEconomicsCsv(rows: readonly EconomicsCsvRow[]): string {
  const lines = [ECONOMICS_CSV_HEADER.join(",")];
  for (const row of rows) {
    const cells = [
      row.sku,
      row.title,
      String(row.stockQty),
      row.costMinor == null ? "" : String(row.costMinor),
      row.vatBps == null ? "" : String(row.vatBps),
      row.costIncludesVat ? "evet" : "hayir",
      row.desiGrams == null ? "" : String(row.desiGrams),
      row.channel ?? "",
      row.basePriceMinor == null ? "" : String(row.basePriceMinor),
      row.activePriceMinor == null ? "" : String(row.activePriceMinor),
      row.minMarginBps == null ? "" : String(row.minMarginBps),
      row.manualFloorMinor == null ? "" : String(row.manualFloorMinor),
      row.strategy ?? "",
      row.stepMinor == null ? "" : String(row.stepMinor),
      row.autoApply ? "evet" : "hayir",
    ];
    lines.push(cells.map(csvCell).join(","));
  }
  return `${lines.join("\n")}\n`;
}

export function parseEconomicsCsv(text: string): { ok: true; rows: EconomicsCsvRow[] } | { ok: false; error: string } {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    return { ok: false, error: "CSV başlık ve en az bir satır ister." };
  }
  const header = splitCsvLine(lines[0] ?? "").map((cell) => cell.trim());
  if (header.join(",") !== ECONOMICS_CSV_HEADER.join(",")) {
    return { ok: false, error: "CSV başlığı beklenen sütunlarla eşleşmiyor." };
  }
  if (lines.length - 1 > MAX_ROWS) {
    return { ok: false, error: "CSV en fazla 5000 satır olabilir." };
  }
  const rows: EconomicsCsvRow[] = [];
  for (let index = 1; index < lines.length; index += 1) {
    const cells = splitCsvLine(lines[index] ?? "");
    if (cells.length !== ECONOMICS_CSV_HEADER.length) {
      return { ok: false, error: `Satır ${index + 1} sütun sayısı hatalı.` };
    }
    const sku = (cells[0] ?? "").trim();
    if (!sku || sku.length > 64) {
      return { ok: false, error: `Satır ${index + 1} SKU geçersiz.` };
    }
    const channelRaw = (cells[7] ?? "").trim();
    const channel = channelRaw ? (isPriceChannel(channelRaw) ? channelRaw : null) : null;
    if (channelRaw && !channel) {
      return { ok: false, error: `Satır ${index + 1} kanal geçersiz.` };
    }
    const strategyRaw = (cells[12] ?? "").trim();
    const strategy = strategyRaw ? (isRepriceStrategy(strategyRaw) ? strategyRaw : null) : null;
    if (strategyRaw && !strategy) {
      return { ok: false, error: `Satır ${index + 1} strateji geçersiz.` };
    }
    const vatFlag = (cells[5] ?? "").trim().toLowerCase();
    const autoFlag = (cells[14] ?? "").trim().toLowerCase();
    rows.push({
      sku,
      title: (cells[1] ?? "").trim().slice(0, 200),
      stockQty: parseIntCell(cells[2] ?? "") ?? 0,
      costMinor: parseIntCell(cells[3] ?? ""),
      vatBps: parseIntCell(cells[4] ?? ""),
      costIncludesVat: vatFlag === "evet" || vatFlag === "1" || vatFlag === "true",
      desiGrams: parseIntCell(cells[6] ?? ""),
      channel,
      basePriceMinor: parseIntCell(cells[8] ?? ""),
      activePriceMinor: parseIntCell(cells[9] ?? ""),
      minMarginBps: parseIntCell(cells[10] ?? ""),
      manualFloorMinor: parseIntCell(cells[11] ?? ""),
      strategy,
      stepMinor: parseIntCell(cells[13] ?? ""),
      autoApply: autoFlag === "evet" || autoFlag === "1" || autoFlag === "true",
    });
  }
  return { ok: true, rows };
}

export { PRICE_CHANNELS };
