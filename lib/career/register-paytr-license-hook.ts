import { registerCareerLicenseHook } from "@/lib/kernel/payments/career-license-hook";
import { logEvent } from "@/lib/kernel/observability/log";
import {
  fulfillYetkinCvPublication,
  YETKINCV_PUBLICATION_ORDER_PURPOSE,
} from "@/lib/career/yetkincv-publication";

/**
 * PayTR CLEARED → YetkinCV kamuya açık yayın mührü.
 *
 * Yalnız `career-license:yetkincv-publication` niyeti işlenir; diğer niyetler erken döner.
 * Sınav, puan, SWOT ve 30/60/90 planı bu kancadan geçmez — onlar zaten ücretsizdir.
 */
export function registerPaytrCareerLicenseHook(): void {
  registerCareerLicenseHook(async (order) => {
    if (order.purpose !== YETKINCV_PUBLICATION_ORDER_PURPOSE) {
      return;
    }
    const result = await fulfillYetkinCvPublication(order);
    logEvent({
      level: result.applied ? "info" : "warn",
      event: "career.license.hook",
      userId: order.userId ?? undefined,
      merchantOid: order.merchantOid,
      orderId: order.id,
      purpose: order.purpose,
      applied: result.applied,
      reason: result.reason,
    });
  });
}
