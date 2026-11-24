import type { Route } from "next";

/** Teknik çizim → kargo desi hesaplayıcı (saas-builder / cargo). */
export function technicalDrawingSaasHandoffHref(input: {
  productName: string;
  widthMm: number;
  heightMm: number;
  depthMm: number;
}): Route {
  const productName = input.productName.trim().slice(0, 80) || "Parça";
  const dims = `${input.widthMm}×${input.heightMm}×${input.depthMm} mm`;
  const detail =
    `${productName} ölçü özeti: ${dims}. Desi = (en×boy×yükseklik cm) / 3000.`.slice(0, 400);
  const params = new URLSearchParams({
    tool: "saas-builder",
    widget: "cargo",
    platform: "html",
    title: `${productName} kargo desi`.slice(0, 80),
    detail,
    feature: "Kargo ve desi hesaplayıcı",
  });
  return `/tezgah?${params.toString()}` as Route;
}

/** Teknik çizim → pazaryeri katalog satırı (ürün adı + ölçü). */
export function technicalDrawingPazaryeriHandoffHref(input: {
  productName: string;
  widthMm: number;
  heightMm: number;
  depthMm: number;
  material?: string;
}): Route {
  const productName = input.productName.trim().slice(0, 80) || "Ürün";
  const material = (input.material?.trim() || "").slice(0, 60);
  const dims = `${input.widthMm}×${input.heightMm}×${input.depthMm} mm`;
  const line = material
    ? `${productName} | Ölçü: ${dims} | ${material}`
    : `${productName} | Ölçü: ${dims}`;
  const params = new URLSearchParams({
    tool: "pazaryeri",
    market: "trendyol",
    products: line.slice(0, 400),
  });
  return `/tezgah?${params.toString()}` as Route;
}
