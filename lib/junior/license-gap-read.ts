import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import type { JuniorLicenseSeat } from "@/lib/kernel/payments/license-gap";

/** Junior paket koltuğu. Sipariş numarası `appliedMerchantOids` içindedir. Yazma yok. */
export async function loadJuniorLicenseSeats(): Promise<JuniorLicenseSeat[]> {
  const rows = await getPrisma().juniorSubscription.findMany({
    select: {
      userId: true,
      status: true,
      appliedMerchantOids: true,
    },
  });
  return rows.map((row) => ({
    userId: row.userId,
    status: row.status,
    appliedMerchantOids: row.appliedMerchantOids,
  }));
}
