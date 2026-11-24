import { TEZGAH_DELIVERY_SIGNATURE } from "@/lib/tezgah/delivery-signature";
import type { ReklamPackage } from "@/lib/tezgah/reklam/types";

const FORMULA_START = /^[=+\-@\t]/;

/**
 * CSV hücre kaçışı. `=`, `+`, `-`, `@` veya sekme ile başlayan değere kesme işareti eklenir.
 * UTF-8 BOM satır birleştirmede eklenir.
 */
export function reklamCsvCell(value: string): string {
  let cell = value.replace(/\r\n/g, " ").replace(/[\r\n]/g, " ");
  if (FORMULA_START.test(cell)) {
    cell = `'${cell}`;
  }
  if (/[",]/.test(cell)) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

function toCsv(columns: readonly string[], rows: readonly (readonly string[])[]): string {
  const lines = [columns, ...rows].map((cells) => cells.map((cell) => reklamCsvCell(cell)).join(","));
  return `\uFEFF${lines.join("\n")}\n# ${TEZGAH_DELIVERY_SIGNATURE}`;
}

export const REKLAM_GOOGLE_CSV_COLUMNS = [
  "Campaign",
  "Ad Group",
  "Headline 1",
  "Headline 2",
  "Headline 3",
  "Description 1",
  "Description 2",
  "Keywords",
] as const;

export const REKLAM_META_CSV_COLUMNS = [
  "Campaign Name",
  "Ad Set Name",
  "Ad Name",
  "Primary Text",
  "Headline",
  "Call To Action",
  "Creative Brief",
] as const;

/** Google Ads Editor uyumlu CSV. Üç varyant = üç satır. */
export function buildGoogleAdsCsv(pack: ReklamPackage): string {
  const rows = pack.variants.map((variant) => [
    pack.businessName,
    variant.heading,
    variant.googleHeadlines[0],
    variant.googleHeadlines[1],
    variant.googleHeadlines[2],
    variant.googleDescriptions[0],
    variant.googleDescriptions[1],
    variant.keywords.join("; "),
  ]);
  return toCsv(REKLAM_GOOGLE_CSV_COLUMNS, rows);
}

/** Meta Ads Manager uyumlu CSV. Creative Brief = kadraj + üst yazı + gizlenecek. */
export function buildMetaAdsCsv(pack: ReklamPackage): string {
  const rows = pack.variants.map((variant) => [
    pack.businessName,
    variant.heading,
    `${variant.heading} · ${pack.aimCta}`,
    variant.metaPrimary,
    variant.metaHeadline,
    pack.aimCta,
    `Kadraj: ${variant.frame} | Görsel üstü yazı: ${variant.overlay} | Gösterilmeyecek: ${variant.hidden}`,
  ]);
  return toCsv(REKLAM_META_CSV_COLUMNS, rows);
}
