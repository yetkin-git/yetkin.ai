import type { Route } from "next";
import type { DukkanSectorId } from "@/lib/tezgah/dukkan/copy";

/** Reklam → dijital dükkan. İşletme adı ve teklif özeti ön-dolgulu. */
export function reklamDukkanHandoffHref(input: {
  businessName: string;
  sector: DukkanSectorId;
  place: string;
  offer: string;
}): Route {
  const businessName = input.businessName.trim().slice(0, 80) || "İşletme";
  const services = (input.offer.trim() || `${businessName} kampanya teklifi.`).slice(0, 400);
  const params = new URLSearchParams({
    tool: "dukkan",
    businessName,
    sector: input.sector,
    place: input.place.trim().slice(0, 80) || "Türkiye",
    services,
  });
  return `/tezgah?${params.toString()}` as Route;
}

/** Reklam → görsel stüdyo. Görsel brief özeti ön-dolgulu. */
export function reklamStudioPhotoHandoffHref(input: {
  businessName: string;
  creativeBrief: string;
}): Route {
  const productName = input.businessName.trim().slice(0, 80) || "Ürün";
  const features = (input.creativeBrief.trim() || `${productName} reklam görseli.`).slice(0, 400);
  const params = new URLSearchParams({
    tool: "studio-photo",
    productName,
    features,
    scene: "ad-square",
    galleryCount: "4",
  });
  return `/tezgah?${params.toString()}` as Route;
}
