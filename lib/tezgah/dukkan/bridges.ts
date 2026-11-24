import type { Route } from "next";
import type { DukkanSectorId } from "@/lib/tezgah/dukkan/copy";

/** Dükkan → reklam masası. İşletme adı ve hizmet özeti ön-dolgulu. */
export function dukkanReklamHandoffHref(input: {
  businessName: string;
  sector: DukkanSectorId;
  place: string;
  services: readonly string[];
}): Route {
  const businessName = input.businessName.trim().slice(0, 80) || "İşletme";
  const offer = (
    input.services.length > 0
      ? `Dijital dükkan hizmetleri: ${input.services.join(", ")}.`
      : `${businessName} dijital dükkan vitrini.`
  ).slice(0, 400);
  const params = new URLSearchParams({
    tool: "reklam",
    businessName,
    sector: input.sector,
    place: input.place.trim().slice(0, 80) || "Türkiye",
    offer,
  });
  return `/tezgah?${params.toString()}` as Route;
}

/** Dükkan → e-ticaret işletim sistemi. */
export const DUKKAN_ECOMMERCE_HREF = "/panel/e-ticaret" as const;
