import "server-only";

import { loadOwnerLicense } from "@/lib/commerce/cockpit-load";
import {
  commerceLicenseActivateHref,
  commercePlanOpenAmounts,
  commercePlanTitle,
  formatCommercePlanPriceRibbon,
  normalizeCommercePlan,
  pickPoolStore,
  type CommercePlanUnitAmounts,
} from "@/lib/commerce/os-rules";
import type { EcommerceLicenseBand } from "@/lib/commerce/os-types";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";

async function readCommercePlanAmounts(): Promise<CommercePlanUnitAmounts> {
  const open = commercePlanOpenAmounts();
  try {
    const catalog = createPrismaPriceCatalogStore();
    const [starter, growth, scale] = await Promise.all([
      catalog.findActiveEntry("commerce", "starter"),
      catalog.findActiveEntry("commerce", "growth"),
      catalog.findActiveEntry("commerce", "scale"),
    ]);
    return {
      starter:
        starter?.isActive && starter.amountMinor > 0 ? starter.amountMinor : open.starter,
      growth: growth?.isActive && growth.amountMinor > 0 ? growth.amountMinor : open.growth,
      scale: scale?.isActive && scale.amountMinor > 0 ? scale.amountMinor : open.scale,
    };
  } catch {
    return open;
  }
}

/**
 * Kokpit şeridi. Üç kademeli katalog tutarını, havuz mağazasının lisans fazını ve
 * deneme durumunu okur; yazmaz. Eski `commerce / monthly` (₺1.490) satırı kullanılmaz.
 * `TRIALING` satırda şerit "Lisans açık" demez, kalan günü basar.
 */
export async function readEcommerceLicenseBand(
  userId: string,
  stores: readonly { id: string; name: string; planCode?: string | null }[],
): Promise<EcommerceLicenseBand> {
  const pool = pickPoolStore(stores);
  const activateHref = commerceLicenseActivateHref(pool?.id ?? null);
  const amounts = await readCommercePlanAmounts();
  const priceLabel = formatCommercePlanPriceRibbon(amounts);
  const activePlanTitle = pool ? commercePlanTitle(normalizeCommercePlan(pool.planCode)) : null;
  const emptyTrial = { active: false, daysLeft: null };
  if (!pool) {
    return {
      active: false,
      gate: true,
      priceLabel,
      activePlanTitle: null,
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
      activePlanTitle,
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
    activePlanTitle,
    activateHref,
    trial: { active: trialing, daysLeft: license.value.trialDaysLeft },
    trialEligible: license.value.trialEligible,
    trialBlockedReason: license.value.trialBlockedReason,
  };
}
