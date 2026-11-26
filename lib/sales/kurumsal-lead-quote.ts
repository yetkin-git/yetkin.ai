import "server-only";

import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";
import type { KurumsalOfferPackageKey } from "@/lib/sales/kurumsal-offer-packages";
import { KURUMSAL_SCREENING_MODULE, KURUMSAL_SCREENING_UNIT } from "@/lib/sales/kurumsal-screening";

/** Paket anahtarı → katalog (module, unit). Ön talep paketlerinde satır yoksa null. */
const PACKAGE_CATALOG: Record<KurumsalOfferPackageKey, { moduleKey: string; unitKey: string } | null> = {
  "team-seat": { moduleKey: "academy", unitKey: "team-seat" },
  agency: { moduleKey: "commerce", unitKey: "agency" },
  "job-screening-pack": { moduleKey: KURUMSAL_SCREENING_MODULE, unitKey: KURUMSAL_SCREENING_UNIT },
  "iso-auditor": null,
  "company-brain": null,
};

/** Talep anındaki katalog tutarı anlık görüntüsü (D-03). Katalog yoksa null. */
export async function snapshotKurumsalOfferQuotedAmountMinor(
  packageKey: KurumsalOfferPackageKey,
): Promise<number | null> {
  const target = PACKAGE_CATALOG[packageKey];
  if (!target) {
    return null;
  }
  try {
    const entry = await createPrismaPriceCatalogStore().findActiveEntry(target.moduleKey, target.unitKey);
    if (!entry || !entry.isActive || entry.currencyCode !== "TRY" || entry.amountMinor <= 0) {
      return null;
    }
    return entry.amountMinor;
  } catch {
    return null;
  }
}
