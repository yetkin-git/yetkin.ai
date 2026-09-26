import { fulfillAcademyLicenseFromClearedOrder, readAcademyLicenseSlug } from "@/lib/academy/paytr-license-bridge";
import { createPrismaAcademyPorts } from "@/lib/academy/runtime";
import { registerAcademyLicenseHook } from "@/lib/kernel/payments/academy-license-hook";
import { logEvent } from "@/lib/kernel/observability/log";

/** PayTR CLEARED → akademi SETTLED. Düz cüzdan yüklemesi erken döner. */
export function registerPaytrAcademyLicenseHook(): void {
  registerAcademyLicenseHook(async (order) => {
    if (!readAcademyLicenseSlug(order.purpose)) {
      return;
    }
    const result = await fulfillAcademyLicenseFromClearedOrder(createPrismaAcademyPorts(), order);
    logEvent({
      level: result.reason === "insufficient" || result.reason === "closed" ? "warn" : "info",
      event: "academy.license.hook",
      userId: order.userId,
      merchantOid: order.merchantOid,
      orderId: order.id,
      amountMinor: order.amountMinor,
      purpose: order.purpose,
      applied: result.applied,
      reason: result.reason,
    });
  });
}
