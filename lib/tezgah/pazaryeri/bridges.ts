import type { Route } from "next";
import { studioSceneFromMarket } from "@/lib/tezgah/pro/options";

/** Pazaryeri → görsel stüdyo. Pazaryeri seçimi ve ilk ürün adı ön-dolgulu. */
export function pazaryeriStudioPhotoHandoffHref(input: {
  market: string;
  productName: string;
  features?: string;
}): Route {
  const productName = input.productName.trim().slice(0, 80) || "Ürün";
  const features = (
    input.features?.trim() || `${productName} için pazaryeri vitrin görseli.`
  ).slice(0, 400);
  const scene = studioSceneFromMarket(input.market.trim());
  const params = new URLSearchParams({
    tool: "studio-photo",
    productName,
    features,
    scene,
    galleryCount: "4",
  });
  return `/tezgah?${params.toString()}` as Route;
}

/** Pazaryeri → reklam paketi. Marka/kategori ve öne çıkan ürünler ön-dolgulu. */
export function pazaryeriReklamHandoffHref(input: {
  brandOrMarket: string;
  category: string;
  productTitles: readonly string[];
}): Route {
  const businessName = input.brandOrMarket.trim().slice(0, 80) || "Katalog";
  const category = input.category.trim().slice(0, 80);
  const titles = input.productTitles
    .map((title) => title.trim())
    .filter((title) => title.length > 0)
    .slice(0, 5);
  const offerParts = [
    category ? `Kategori: ${category}.` : "",
    titles.length > 0 ? `Öne çıkan ürünler: ${titles.join(", ")}.` : `${businessName} pazaryeri kataloğu.`,
  ].filter((part) => part.length > 0);
  const params = new URLSearchParams({
    tool: "reklam",
    businessName,
    sector: "eticaret",
    place: "Türkiye",
    offer: offerParts.join(" ").slice(0, 400),
  });
  return `/tezgah?${params.toString()}` as Route;
}
