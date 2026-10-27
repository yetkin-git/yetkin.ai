import { describe, expect, it } from "vitest";
import {
  PAYTR_PENDING_DIAGNOSIS,
  paytrPendingDiagnosisCode,
} from "@/lib/kernel/payments/paytr/reconcile";

describe("PayTR PENDING teşhisi", () => {
  it("takılma nedenini sabit koda çevirir", () => {
    expect(paytrPendingDiagnosisCode("still_pending")).toBe("webhook_pending_within_window");
    expect(paytrPendingDiagnosisCode("pending_timeout")).toBe("webhook_timeout");
    expect(paytrPendingDiagnosisCode("psp_failed")).toBe("psp_declined_or_cancelled");
    expect(paytrPendingDiagnosisCode("amount_mismatch")).toBe("amount_mismatch_no_credit");
    expect(paytrPendingDiagnosisCode("psp_unavailable:missing_credentials")).toBe(
      "psp_status_unavailable",
    );
    expect(paytrPendingDiagnosisCode("not_found")).toBe("order_missing");
    expect(paytrPendingDiagnosisCode("already_cleared")).toBeNull();
    expect(PAYTR_PENDING_DIAGNOSIS.webhook_timeout.length).toBeGreaterThan(10);
  });
});
