import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { commerceLicenseActive } from "@/lib/commerce/subscription";

export type CommerceCancelResult =
  | { ok: true; cancelAtPeriodEnd: true; periodEnd: string | null }
  | { ok: false; status: 404 | 409; error: string };

/** Hizmet dönem sonuna kadar sürer. Yenileme çekimi durur. */
export async function cancelCommerceSubscriptionAtPeriodEnd(
  userId: string,
  storeId: string,
  now = new Date(),
): Promise<CommerceCancelResult> {
  const prisma = getPrisma();
  const row = await prisma.commerceSubscription.findUnique({ where: { storeId } });
  if (!row || row.ownerUserId !== userId) {
    return { ok: false, status: 404, error: "Abonelik bulunamadı." };
  }
  if (!commerceLicenseActive(row, now)) {
    return { ok: false, status: 409, error: "İptal edilecek açık dönem yok." };
  }
  await prisma.commerceSubscription.update({
    where: { storeId },
    data: { cancelAtPeriodEnd: true },
  });
  const periodEnd = row.currentPeriodEnd ?? row.trialEndsAt ?? row.expiresAt;
  return {
    ok: true,
    cancelAtPeriodEnd: true,
    periodEnd: periodEnd ? periodEnd.toISOString() : null,
  };
}
