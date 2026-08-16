import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("PayTR valör tarama yüzeyi", () => {
  it("PENDING/PAID aday seçer; dispatched gönderilen sayıya eşittir", () => {
    const source = readSrc("lib/kernel/jobs/inngest.ts");
    expect(source).toContain("paytrClearingScan");
    expect(source).toContain("step.sendEvent");
    expect(source).toContain("dispatch-paytr-clearing-events");
    expect(source).toContain("INNGEST_EVENTS.PAYTR_CLEARING_REQUESTED");
    expect(source).toContain("merchantOid");
    expect(source).toContain("status: { in: [\"PENDING\", \"PAID\"] }");
    expect(source).toContain("selectPaytrClearingCandidates");
    expect(source).toContain("paytrClearingScanResult");
    expect(source).not.toMatch(/return pending\.length/);
  });

  it("tekil handler PSP reconcile eder; kör clearSuccessfulPaymentOrder yazmaz", () => {
    const inngest = readSrc("lib/kernel/jobs/inngest.ts");
    const scanFn = inngest.slice(
      inngest.indexOf("paytrClearingScan"),
      inngest.indexOf("paytrClearingSingle"),
    );
    const singleFn = inngest.slice(
      inngest.indexOf("paytrClearingSingle"),
      inngest.indexOf("escrowTimeoutScan"),
    );
    expect(scanFn).not.toContain("clearSuccessfulPaymentOrder");
    expect(singleFn).toContain("reconcilePaytrPaymentOrder");
    expect(singleFn).not.toContain("clearSuccessfulPaymentOrder");
    const reconcile = readSrc("lib/kernel/payments/paytr/reconcile.ts");
    expect(reconcile).toContain("queryPaytrOrderStatus");
    expect(reconcile).toContain("markFailed");
    expect(reconcile).toContain("amount_mismatch");
    expect(reconcile).toContain("pending_timeout");
  });
});
