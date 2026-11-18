import "server-only";

import { loadOwnerLicense } from "@/lib/commerce/cockpit-load";
import { readCommerceMonthlyAmount } from "@/lib/commerce/paytr-license-bridge";
import { pickPoolStore } from "@/lib/commerce/os-rules";
import type { EcommerceLicenseBand } from "@/lib/commerce/os-types";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { formatMinorCompact } from "@/lib/kernel/money/format";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";

/** Kokpit şeridi. Katalog tutarını ve havuz mağazasının lisans fazını okur; yazmaz. */
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
  if (!pool) {
    return { active: false, gate: true, priceLabel, activateHref };
  }
  const license = await loadOwnerLicense(userId, pool.id);
  if (license.kind !== "ok") {
    return { active: false, gate: false, priceLabel, activateHref };
  }
  const active = license.value.phase === "open";
  return { active, gate: !active, priceLabel, activateHref };
}
