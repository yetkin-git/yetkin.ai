import type { Route } from "next";
import type { StudioSceneId } from "@/lib/tezgah/pro/options";

/** Görsel stüdyo → pazaryeri kataloğu. Ürün adı ve sahneye göre market ön-dolgulu. */
export function studioPhotoPazaryeriHandoffHref(input: {
  productName: string;
  scene: StudioSceneId;
  features?: string;
}): Route {
  const productName = input.productName.trim().slice(0, 80) || "Ürün";
  const features = (input.features?.trim() || `${productName} stüdyo görseli.`).slice(0, 400);
  const market =
    input.scene === "amazon-white" ? "amazon" : input.scene === "trendyol-white" ? "trendyol" : "trendyol";
  const products = features.includes(productName) ? features : `${productName} | ${features}`;
  const params = new URLSearchParams({
    tool: "pazaryeri",
    market,
    products: products.slice(0, 400),
  });
  return `/tezgah?${params.toString()}` as Route;
}

/** Görsel stüdyo → reklam paketi. Ürün adı ve görsel konsepti ön-dolgulu. */
export function studioPhotoReklamHandoffHref(input: {
  productName: string;
  sceneLabel: string;
  features?: string;
}): Route {
  const productName = input.productName.trim().slice(0, 80) || "Ürün";
  const features = (input.features?.trim() || `${productName} ürün görseli.`).slice(0, 200);
  const offer = `Görsel konsept: ${input.sceneLabel}. ${features}`.slice(0, 400);
  const params = new URLSearchParams({
    tool: "reklam",
    businessName: productName,
    sector: "eticaret",
    place: "Türkiye",
    offer,
  });
  return `/tezgah?${params.toString()}` as Route;
}
