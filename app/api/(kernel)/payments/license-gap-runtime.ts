import "server-only";

import { loadAcademyLicenseSeats } from "@/lib/academy/license-gap-read";
import { loadCommerceLicenseSeats } from "@/lib/commerce/license-gap-read";
import { getPrisma } from "@/lib/kernel/db";
import { loadJuniorLicenseSeats } from "@/lib/junior/license-gap-read";
import {
  ACADEMY_LICENSE_PURPOSE_PREFIX,
  CAREER_PUBLICATION_PURPOSE,
  COMMERCE_LICENSE_PURPOSE,
  JUNIOR_LICENSE_PURPOSE,
  type CareerPublicationSeat,
  type LicenseGapPorts,
  type LicenseGapSnapshot,
} from "@/lib/kernel/payments/license-gap";
import { createPrismaPaymentAnomalyStore } from "@/lib/kernel/payments/prisma-anomaly-store";

/**
 * CLEARED lisans niyeti + açık koltuk + SUCCEEDED iade. CREDIT yazmaz.
 *
 * Faz 3 / §4.3: kariyer yayın siparişi de taranır. Misafir siparişleri
 * (`userId` null) burada **listelenmez**: sahipsiz CLEARED satırın lisans
 * yokluğu alarm değil, beklenen durumdur (defter ve lisans `/claim` anında yazılır).
 */
export async function loadLicenseGapSnapshot(): Promise<LicenseGapSnapshot> {
  const prisma = getPrisma();
  const [orders, academySeats, juniorSeats, commerceSeats, careerSeals, refunds] =
    await Promise.all([
      prisma.paymentOrder.findMany({
        where: {
          status: "CLEARED",
          userId: { not: null },
          OR: [
            { purpose: { startsWith: ACADEMY_LICENSE_PURPOSE_PREFIX } },
            { purpose: JUNIOR_LICENSE_PURPOSE },
            { purpose: COMMERCE_LICENSE_PURPOSE },
            { purpose: CAREER_PUBLICATION_PURPOSE },
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
      loadCommerceLicenseSeats(),
      // Yayını açan sipariş kimliği. Mühür satırı bu merchantOid'i taşır.
      prisma.yetkinCvSeal.findMany({
        where: { sealedPublication: true, publicationPaidMerchantOid: { not: null } },
        select: { publicationPaidMerchantOid: true },
      }),
      prisma.walletCardRefund.findMany({
        where: { status: "SUCCEEDED", merchantOid: { not: null } },
        select: { merchantOid: true },
      }),
    ]);
  const careerPublicationSeats: CareerPublicationSeat[] = careerSeals.flatMap((row) =>
    row.publicationPaidMerchantOid ? [{ merchantOid: row.publicationPaidMerchantOid }] : [],
  );
  return {
    // `userId: { not: null }` filtresi tip düzeyinde daraltmıyor; misafir satırı
    // gelirse kariyer/koltuk eşleşmesi zaten düşer ve alarm üretmez.
    orders: orders.flatMap((row) =>
      row.userId ? [{ ...row, userId: row.userId }] : [],
    ),
    academySeats,
    juniorSeats,
    commerceSeats,
    careerPublicationSeats,
    refundedMerchantOids: refunds.flatMap((row) => (row.merchantOid ? [row.merchantOid] : [])),
  };
}

export function createLicenseGapPorts(): LicenseGapPorts {
  return {
    loadSnapshot: loadLicenseGapSnapshot,
    anomalies: createPrismaPaymentAnomalyStore(),
  };
}
