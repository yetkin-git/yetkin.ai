import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import type { CommerceLicenseSeat } from "@/lib/kernel/payments/license-gap";

/** Commerce koltuğu. Sipariş numarası `appliedMerchantOids` içindedir. Yazma yok. */
export async function loadCommerceLicenseSeats(): Promise<CommerceLicenseSeat[]> {
  const rows = await getPrisma().commerceSubscription.findMany({
    select: {
      ownerUserId: true,
      status: true,
      appliedMerchantOids: true,
    },
  });
  return rows.map((row) => ({
    ownerUserId: row.ownerUserId,
    status: row.status,
    appliedMerchantOids: row.appliedMerchantOids,
  }));
}
