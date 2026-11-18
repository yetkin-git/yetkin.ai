/**
 * Otonom büyüme kısayolları. Tutar uydurmaz; tezgâh alanını doldurur.
 */

import type { OsGrantLine } from "@/lib/commerce/os-types";

export function isAdEligibleStock(approved: number, critical: number): boolean {
  return critical > 0 && approved >= critical * 3;
}

export function adPackageHref(input: {
  storeName: string;
  title: string;
  sku: string;
  approvedStockQty: number;
}): string {
  const offer = `${input.title}. Onaylı stok ${input.approvedStockQty} adet. SKU ${input.sku.trim() || "yok"}.`;
  const params = new URLSearchParams({
    tool: "reklam",
    businessName: input.storeName.trim().slice(0, 80),
    sector: "magaza",
    aim: "whatsapp",
    offer: offer.slice(0, 500),
  });
  return `/tezgah?${params.toString()}`;
}

export function grantDossierHref(storeName: string): string {
  const params = new URLSearchParams({
    sekme: "proje",
    ad: storeName.trim().slice(0, 80),
    yatirim: "ihracat",
  });
  return `/hibe?${params.toString()}`;
}

export type ExportSupportSummary = {
  productCount: number;
  approvedUnits: number;
  pricedStockLabel: string | null;
  lines: OsGrantLine[];
  note: string;
};

const EXPORT_SOURCE = /kosgeb|ticaret bakanlığı|ticaret bakanligi/i;
const EXPORT_TITLE = /ihracat|e-ihracat/i;

function money(minor: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(minor / 100);
}

export function summarizeExportSupport(input: {
  products: readonly { approvedStockQty: number; priceMinor: number }[];
  lines: readonly OsGrantLine[];
  catalogNote: string | null;
}): ExportSupportSummary {
  let approvedUnits = 0;
  let pricedMinor = 0;
  let pricedCount = 0;
  for (const product of input.products) {
    if (product.approvedStockQty > 0) {
      approvedUnits += product.approvedStockQty;
    }
    if (product.priceMinor > 0 && product.approvedStockQty > 0) {
      pricedMinor += product.priceMinor * product.approvedStockQty;
      pricedCount += 1;
    }
  }
  const lines = input.lines.filter(
    (line) => EXPORT_SOURCE.test(line.source) || EXPORT_TITLE.test(line.title) || EXPORT_TITLE.test(line.source),
  );
  const pricedStockLabel = pricedCount > 0 ? money(pricedMinor) : null;
  const portfolio = `Ürün kartı ${input.products.length}. Onaylı stok ${approvedUnits} adet.`;
  const priced = pricedStockLabel
    ? ` Kart fiyatı yazılı stok tutarı ${pricedStockLabel}. Bu tutar satış cirosu değildir.`
    : "";
  const call =
    lines.length > 0
      ? " KOSGEB ve Ticaret Bakanlığı satırları katalogdandır. Uygunluk kararı kurumundur."
      : " Katalogda açık e-ihracat çağrısı yok. Dosya hazırlayıcı portföyü taşır; uygunluk kararı kurumundur.";
  const down = input.catalogNote ? ` ${input.catalogNote}` : "";
  return {
    productCount: input.products.length,
    approvedUnits,
    pricedStockLabel,
    lines: lines.slice(0, 3),
    note: `${portfolio}${priced}${call}${down}`,
  };
}
