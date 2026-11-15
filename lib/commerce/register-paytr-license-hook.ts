import { createPrismaCommerceRepository } from "@/lib/commerce/prisma-repository";
import {
  fulfillCommerceLicenseFromClearedOrder,
  isCommerceLicenseOrder,
} from "@/lib/commerce/paytr-license-bridge";
import { createPrismaCommerceSubscriptionStore } from "@/lib/commerce/subscription-prisma";
import { createPrismaLedgerStore } from "@/lib/kernel/ledger/prisma-store";
import { registerCommerceLicenseHook } from "@/lib/kernel/payments/commerce-license-hook";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";
import { logEvent } from "@/lib/kernel/observability/log";

/** PayTR CLEARED → Commerce aylık lisans ve lisans DEBIT. Düz cüzdan yüklemesi erken döner. */
export function registerPaytrCommerceLicenseHook(): void {
  registerCommerceLicenseHook(async (order) => {
    if (!isCommerceLicenseOrder(order.purpose)) {
      return;
    }
    const result = await fulfillCommerceLicenseFromClearedOrder(
      createPrismaCommerceRepository(),
      createPrismaCommerceSubscriptionStore(),
      createPrismaPriceCatalogStore(),
      order,
      createPrismaLedgerStore(),
    );
    logEvent({
      level: "info",
      event: "commerce.license.hook",
      userId: order.userId,
      merchantOid: order.merchantOid,
      orderId: order.id,
      purpose: order.purpose,
      applied: result.applied,
      reason: result.reason,
    });
  });
}
