import "server-only";

import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { formatMinorCompact } from "@/lib/kernel/money/format";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";
import { PUBLIC_PREORDER_LABEL, type PriceHonesty } from "@/lib/pricing/showcase-price";
import { KURUMSAL_SCREENING_MODULE, KURUMSAL_SCREENING_UNIT } from "@/lib/sales/kurumsal-screening";

/**
 * Kurumsal yüzey fiyatları.
 * Tutar **kod sabiti değildir**: yalnız aktif `PriceCatalogEntry.amountMinor` satırıdır.
 *
 * - `jobScreening`: katalog satırı aktifse `live` ve gerçek tutar basılır; kasa
 *   `POST /api/kurumsal/satin-al` bu satırı tahsil eder. Satır yoksa/pasifse
 *   `planned` + ön talep etiketi (uydurma fiyat basılmaz).
 * - `teamSeat`, `agency`, `yetkinCv`: PayTR kasası bağlı değildir, ön talep kalır.
 */
export type KurumsalOfferQuote = {
  honesty: PriceHonesty;
  amountMinor: number | null;
  label: string;
};

export type KurumsalOfferPrices = {
  teamSeat: KurumsalOfferQuote;
  agency: KurumsalOfferQuote;
  yetkinCv: KurumsalOfferQuote;
  jobScreening: KurumsalOfferQuote;
};

function plannedOffer(): KurumsalOfferQuote {
  return { honesty: "planned", amountMinor: null, label: PUBLIC_PREORDER_LABEL };
}

async function liveOffer(moduleKey: string, unitKey: string): Promise<KurumsalOfferQuote> {
  try {
    const entry = await createPrismaPriceCatalogStore().findActiveEntry(moduleKey, unitKey);
    if (!entry || !entry.isActive || entry.currencyCode !== "TRY" || entry.amountMinor <= 0) {
      return plannedOffer();
    }
    const amountMinor = toAmountMinor(entry.amountMinor);
    return {
      honesty: "live",
      amountMinor,
      label: formatMinorCompact(amountMinor, SETTLEMENT_CURRENCY),
    };
  } catch {
    // Katalog okunamazsa fiyat uydurulmaz.
    return plannedOffer();
  }
}

/** Ekip rozeti, ajans lisansı ve YetkinCV: kasa yok, ön talep. Aday eleme: katalog varsa canlı. */
export async function loadKurumsalOfferPrices(): Promise<KurumsalOfferPrices> {
  const quote = plannedOffer();
  const jobScreening = await liveOffer(KURUMSAL_SCREENING_MODULE, KURUMSAL_SCREENING_UNIT);
  return {
    teamSeat: quote,
    agency: quote,
    yetkinCv: quote,
    jobScreening,
  };
}
