import type { Route } from "next";

/** Mini SaaS → dijital dükkan vitrini. Başlık ve özellik özeti ön-dolgulu. */
export function saasBuilderDukkanHandoffHref(input: {
  title: string;
  feature: string;
  detail?: string;
}): Route {
  const title = input.title.trim().slice(0, 80) || "Mini SaaS bileşeni";
  const feature = input.feature.trim().slice(0, 200) || title;
  const services = [
    title.slice(0, 80),
    feature.slice(0, 80),
    (input.detail?.trim() || "Gömülebilir bileşen").slice(0, 80),
  ]
    .filter((line, index, all) => line.length >= 2 && all.indexOf(line) === index)
    .slice(0, 5)
    .join("\n");
  const params = new URLSearchParams({
    tool: "dukkan",
    businessName: title.slice(0, 80),
    sector: "eticaret",
    place: "Türkiye",
    services,
  });
  return `/tezgah?${params.toString()}` as Route;
}

/** Mini SaaS → e-ticaret mağaza kokpiti. */
export const SAAS_BUILDER_ECOMMERCE_HREF = "/panel/e-ticaret" as const;
