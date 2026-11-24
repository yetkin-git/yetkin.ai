import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";
import {
  KURUMSAL_SCREENING_MODULE,
  KURUMSAL_SCREENING_UNIT,
} from "@/lib/sales/kurumsal-screening";

/** CLEARED sipariş niyeti — katalog birimiyle birebir. */
export const KURUMSAL_SCREENING_ORDER_PURPOSE = "kurumsal-license:job-screening-pack" as const;
export const KURUMSAL_SCREENING_PURCHASE_PATH = "/kurumsal#kurumsal-teklif" as const;

export type KurumsalScreeningEntitlement =
  | { ok: true; merchantOid: string }
  | { ok: false; reason: "catalog-inactive" | "license-missing"; purchasePath: string };

/**
 * İlan açma kapısı: aktif katalog satırı + CLEARED sipariş.
 * Satın alma tek başına aday puanı basmaz; yalnız ilan hakkını açar.
 */
export async function assertKurumsalScreeningEntitlement(
  ownerUserId: string,
): Promise<KurumsalScreeningEntitlement> {
  const entry = await createPrismaPriceCatalogStore().findActiveEntry(
    KURUMSAL_SCREENING_MODULE,
    KURUMSAL_SCREENING_UNIT,
  );
  if (!entry || !entry.isActive || entry.currencyCode !== "TRY" || entry.amountMinor <= 0) {
    return {
      ok: false,
      reason: "catalog-inactive",
      purchasePath: KURUMSAL_SCREENING_PURCHASE_PATH,
    };
  }
  const order = await getPrisma().paymentOrder.findFirst({
    where: {
      userId: ownerUserId,
      status: "CLEARED",
      OR: [
        { purpose: KURUMSAL_SCREENING_ORDER_PURPOSE },
        { purpose: { contains: KURUMSAL_SCREENING_UNIT } },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: { merchantOid: true },
  });
  if (!order) {
    return {
      ok: false,
      reason: "license-missing",
      purchasePath: KURUMSAL_SCREENING_PURCHASE_PATH,
    };
  }
  return { ok: true, merchantOid: order.merchantOid };
}
