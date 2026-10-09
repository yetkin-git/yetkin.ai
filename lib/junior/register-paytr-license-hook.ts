import { createPrismaJuniorStore } from "@/lib/junior/load";
import { fulfillJuniorLicenseFromClearedOrder, isJuniorLicenseOrder } from "@/lib/junior/paytr-license-bridge";
import { registerJuniorLicenseHook } from "@/lib/kernel/payments/junior-license-hook";
import { logEvent } from "@/lib/kernel/observability/log";

/** PayTR CLEARED → Junior yıllık paket. Düz cüzdan yüklemesi erken döner. */
export function registerPaytrJuniorLicenseHook(): void {
  registerJuniorLicenseHook(async (order) => {
    if (!isJuniorLicenseOrder(order.purpose)) {
      return;
    }
    const result = await fulfillJuniorLicenseFromClearedOrder(createPrismaJuniorStore(), order);
    logEvent({
      level: "info",
      event: "junior.license.hook",
      userId: order.userId,
      merchantOid: order.merchantOid,
      orderId: order.id,
      purpose: order.purpose,
      applied: result.applied,
      reason: result.reason,
    });
  });
}
