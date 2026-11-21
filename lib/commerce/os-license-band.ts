import "server-only";

import { loadOwnerLicense } from "@/lib/commerce/cockpit-load";
import { readCommerceMonthlyAmount } from "@/lib/commerce/paytr-license-bridge";
import { pickPoolStore } from "@/lib/commerce/os-rules";
import type { EcommerceLicenseBand } from "@/lib/commerce/os-types";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { formatMinorCompact } from "@/lib/kernel/money/format";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";

/**
 * Kokpit şeridi. Katalog tutarını, havuz mağazasının lisans fazını ve deneme durumunu
 * okur; yazmaz. `TRIALING` satırda şerit "Lisans açık" demez, kalan günü basar.
 */
export async function readEcommerceLicenseBand(
  userId: string,
  stores: readonly { id: string; name: string }[],
): Promise<EcommerceLicenseBand> {
  const pool = pickPoolStore(stores);
  const activateHref = pool ? `/magazam/${pool.id}/lisans` : "/magazam/yeni";
  let priceLabel: string | null = null;
  try {
    const amountMinor = await readCommerceMonthlyAmount(createPrismaPriceCatalogStore());
    if (amountMinor != null) {
      priceLabel = `${formatMinorCompact(amountMinor, SETTLEMENT_CURRENCY)} / Ay`;
    }
  } catch {
    priceLabel = null;
  }
  const emptyTrial = { active: false, daysLeft: null };
  if (!pool) {
    return {
      active: false,
      gate: true,
      priceLabel,
      activateHref,
      trial: emptyTrial,
      trialEligible: false,
      trialBlockedReason: "no_key",
    };
  }
  const license = await loadOwnerLicense(userId, pool.id);
  if (license.kind !== "ok") {
    return {
      active: false,
      gate: false,
      priceLabel,
      activateHref,
      trial: emptyTrial,
      trialEligible: false,
      trialBlockedReason: "unknown",
    };
  }
  const active = license.value.phase === "open";
  const trialing = license.value.status === "TRIALING" && active;
  return {
    active,
    gate: !active,
    priceLabel,
    activateHref,
    trial: { active: trialing, daysLeft: license.value.trialDaysLeft },
    trialEligible: license.value.trialEligible,
    trialBlockedReason: license.value.trialBlockedReason,
  };
}
