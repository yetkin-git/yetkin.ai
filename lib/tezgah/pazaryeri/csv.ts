import { TEZGAH_DELIVERY_SIGNATURE } from "@/lib/tezgah/delivery-signature";
import {
  PAZARYERI_DIGER,
  PAZARYERI_LEAD,
  PAZARYERI_TAIL,
  PAZARYERI_TAXONOMY_COLUMN,
} from "@/lib/tezgah/pazaryeri/copy";
import { formatPriceTlCell, type PazaryeriField } from "@/lib/tezgah/pazaryeri/parse";

export type PazaryeriCsvInput = {
  title: string;
  description: string;
  category: string;
  taxonomyPath: string;
  fields: readonly PazaryeriField[];
  other: string;
  priceMinor: number | null;
  stockQty: number | null;
};

const FORMULA_START = /^[=+\-@\t]/;

function units(value: string): number {
  return [...value].length;
}

/** Taşan başlık son tam kelimeden kesilir. İlk kelime tavana sığmıyorsa null. */
export function clipPazaryeriTitle(title: string, cap: number): string | null {
  const clean = title.replace(/\s+/g, " ").trim();
  if (!clean || cap < 1) {
    return null;
  }
  if (units(clean) <= cap) {
    return clean;
  }
  const words = clean.split(" ");
  let out = "";
  for (const word of words) {
    const next = out ? `${out} ${word}` : word;
    if (units(next) > cap) {
      break;
    }
    out = next;
  }
  return out || null;
}

export function csvCell(value: string): string {
  let cell = value.replace(/\r\n/g, " ").replace(/[\r\n]/g, " ");
  if (FORMULA_START.test(cell)) {
    cell = `'${cell}`;
  }
  if (/[",]/.test(cell)) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

function dynamicColumns(rows: readonly PazaryeriCsvInput[]): { columns: string[]; diger: boolean } {
  const columns: string[] = [];
  let diger = false;
  for (const row of rows) {
    for (const field of row.fields) {
      if (!columns.includes(field.column)) {
        columns.push(field.column);
      }
    }
    if (row.other.trim()) {
      diger = true;
    }
  }
  return { columns, diger };
}

/**
 * Katalog CSV'si. UTF-8 BOM Türkçe Excel içindir.
 * `=`, `+`, `-`, `@` veya sekme ile başlayan hücreye kesme işareti eklenir.
 * Barkod her zaman boş. Fiyat/stok yalnız kullanıcı girdiyse dolar.
 */
export function buildPazaryeriTable(input: {
  marketLabel: string;
  rows: readonly PazaryeriCsvInput[];
}): { columns: string[]; rows: string[][]; csv: string } {
  const dynamic = dynamicColumns(input.rows);
  const columns = [
    ...PAZARYERI_LEAD,
    PAZARYERI_TAXONOMY_COLUMN,
    ...dynamic.columns,
    ...(dynamic.diger ? [PAZARYERI_DIGER] : []),
    ...PAZARYERI_TAIL,
  ];
  const rows = input.rows.map((row) => {
    const attributes = dynamic.columns.map(
      (column) => row.fields.find((field) => field.column === column)?.value ?? "",
    );
    const priceCell = row.priceMinor == null ? "" : formatPriceTlCell(row.priceMinor);
    const stockCell = row.stockQty == null ? "" : String(row.stockQty);
    const cells = [
      input.marketLabel,
      row.title,
      row.description,
      row.category,
      row.taxonomyPath,
      ...attributes,
      ...(dynamic.diger ? [row.other] : []),
      "",
      priceCell,
      stockCell,
    ];
    return cells;
  });
  const lines = [columns, ...rows].map((cells) => cells.map((cell) => csvCell(cell)).join(","));
  return {
    columns,
    rows,
    csv: `\uFEFF${lines.join("\n")}\n# ${TEZGAH_DELIVERY_SIGNATURE}`,
  };
}
