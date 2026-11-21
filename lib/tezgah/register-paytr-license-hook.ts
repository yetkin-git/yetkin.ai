import { registerTezgahLicenseHook } from "@/lib/kernel/payments/tezgah-license-hook";
import { logEvent } from "@/lib/kernel/observability/log";
import { classifyPaymentOrderPurpose } from "@/lib/kernel/payments/order-purpose";
import { fulfillTezgahOrder, TEZGAH_CREDIT_ORDER_PURPOSE, TEZGAH_PRO_ORDER_PURPOSE } from "@/lib/tezgah/paid-lane";

/** PayTR CLEARED → Tezgâh Pro süresi veya kredi hakkı. Pro bedeli aynı anda cüzdandan düşer. */
export function registerPaytrTezgahLicenseHook(): void {
  registerTezgahLicenseHook(async (order) => {
    const kind = classifyPaymentOrderPurpose(order.purpose);
    if (
      order.purpose !== TEZGAH_PRO_ORDER_PURPOSE &&
      order.purpose !== TEZGAH_CREDIT_ORDER_PURPOSE &&
      kind !== "TEZGAH_PRO" &&
      kind !== "TEZGAH_CREDIT"
    ) {
      return;
    }
    const result = await fulfillTezgahOrder({
      userId: order.userId,
      merchantOid: order.merchantOid,
      purpose: order.purpose ?? "",
      amountMinor: order.amountMinor,
      currencyCode: order.currencyCode,
      status: order.status,
    });
    logEvent({
      level: "info",
      event: "tezgah.license.hook",
      userId: order.userId,
      merchantOid: order.merchantOid,
      orderId: order.id,
      purpose: order.purpose,
      applied: result.applied,
      reason: result.reason,
    });
  });
}
