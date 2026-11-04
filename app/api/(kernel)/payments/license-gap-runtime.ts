import "server-only";

import { loadAcademyLicenseSeats } from "@/lib/academy/license-gap-read";
import { getPrisma } from "@/lib/kernel/db";
import { loadJuniorLicenseSeats } from "@/lib/junior/license-gap-read";
import {
  ACADEMY_LICENSE_PURPOSE_PREFIX,
  JUNIOR_LICENSE_PURPOSE,
  type LicenseGapPorts,
  type LicenseGapSnapshot,
} from "@/lib/kernel/payments/license-gap";
import { createPrismaPaymentAnomalyStore } from "@/lib/kernel/payments/prisma-anomaly-store";

/** CLEARED lisans niyeti + açık koltuk + SUCCEEDED iade. CREDIT yazmaz. */
export async function loadLicenseGapSnapshot(): Promise<LicenseGapSnapshot> {
  const prisma = getPrisma();
  const [orders, academySeats, juniorSeats, refunds] = await Promise.all([
    prisma.paymentOrder.findMany({
      where: {
        status: "CLEARED",
        OR: [
          { purpose: { startsWith: ACADEMY_LICENSE_PURPOSE_PREFIX } },
          { purpose: JUNIOR_LICENSE_PURPOSE },
        ],
      },
      select: {
        id: true,
        userId: true,
        merchantOid: true,
        purpose: true,
        amountMinor: true,
      },
    }),
    loadAcademyLicenseSeats(),
    loadJuniorLicenseSeats(),
    prisma.walletCardRefund.findMany({
      where: { status: "SUCCEEDED", merchantOid: { not: null } },
      select: { merchantOid: true },
    }),
  ]);
  return {
    orders,
    academySeats,
    juniorSeats,
    refundedMerchantOids: refunds.flatMap((row) => (row.merchantOid ? [row.merchantOid] : [])),
  };
}

export function createLicenseGapPorts(): LicenseGapPorts {
  return {
    loadSnapshot: loadLicenseGapSnapshot,
    anomalies: createPrismaPaymentAnomalyStore(),
  };
}
