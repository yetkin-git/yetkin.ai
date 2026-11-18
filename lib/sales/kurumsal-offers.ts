import "server-only";

import { PUBLIC_PREORDER_LABEL, type PriceHonesty } from "@/lib/pricing/showcase-price";

/**
 * PayTR kasası bağlı olmayan kurumsal ön talep.
 * Tutar basılmaz. Etiket `/fiyatlandirma` ile aynı sabittir.
 */
export type KurumsalOfferQuote = {
  honesty: Extract<PriceHonesty, "planned">;
  label: typeof PUBLIC_PREORDER_LABEL;
};

export type KurumsalOfferPrices = {
  teamSeat: KurumsalOfferQuote;
  agency: KurumsalOfferQuote;
  yetkinCv: KurumsalOfferQuote;
  jobScreening: KurumsalOfferQuote;
};

function plannedOffer(): KurumsalOfferQuote {
  return { honesty: "planned", label: PUBLIC_PREORDER_LABEL };
}

/** Ekip rozeti, ajans lisansı, YetkinCV ve aday eleme: kasa yok, ön talep. */
export async function loadKurumsalOfferPrices(): Promise<KurumsalOfferPrices> {
  const quote = plannedOffer();
  return {
    teamSeat: quote,
    agency: quote,
    yetkinCv: quote,
    jobScreening: quote,
  };
}
