import { refundUnlicensedAcademyCreditForOrder } from "@/lib/academy/license-insufficient-refund";
import { fulfillAcademyLicenseFromClearedOrder, parseAcademyLicenseSlug } from "@/lib/academy/paytr-license-bridge";
import { createPrismaAcademyPorts } from "@/lib/academy/runtime";
import { registerAcademyLicenseHook } from "@/lib/kernel/payments/academy-license-hook";
import { logEvent } from "@/lib/kernel/observability/log";

/** PayTR CLEARED → akademi SETTLED. Düz cüzdan yüklemesi erken döner. K1: kapı burada yeniden sorulmaz. */
export function registerPaytrAcademyLicenseHook(): void {
  registerAcademyLicenseHook(async (order) => {
    if (!parseAcademyLicenseSlug(order.purpose)) {
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
    if (result.reason !== "insufficient") {
      return;
    }
    try {
      await refundUnlicensedAcademyCreditForOrder(order);
    } catch (error) {
      logEvent({
        level: "error",
        event: "academy.license.unlicensed_credit",
        userId: order.userId,
        merchantOid: order.merchantOid,
        orderId: order.id,
        amountMinor: order.amountMinor,
        purpose: order.purpose,
        reason: "refund_threw",
        applied: false,
        errorName: error instanceof Error ? error.name : "unknown",
      });
    }
  });
}
