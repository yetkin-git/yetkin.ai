import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("PayTR valör tarama yüzeyi", () => {
  it("port unconfigured iken no-op: DB findMany'ye inilmez; dürüst log", () => {
    const source = readSrc("lib/kernel/jobs/inngest.ts");
    const scanFn = source.slice(
      source.indexOf("paytrClearingScan"),
      source.indexOf("paytrClearingSingle"),
    );
    expect(scanFn).toContain("shouldNoOpPaytrClearingScan");
    expect(scanFn).toContain("paytrClearingScanNoOpResult");
    expect(scanFn).toContain("paytr.clearing.scan.noop");
    expect(scanFn.indexOf("shouldNoOpPaytrClearingScan")).toBeLessThan(
      scanFn.indexOf("paymentOrder.findMany"),
    );
    expect(scanFn.indexOf("paytr.clearing.scan.noop")).toBeLessThan(
      scanFn.indexOf("paymentOrder.findMany"),
    );
    const helpers = readSrc("lib/kernel/jobs/paytr-clearing-scan.ts");
    expect(helpers).toContain("isPaymentsPortConfigured");
    expect(helpers).toContain("shouldNoOpPaytrClearingScan");
    expect(helpers).toContain("payments_port_unconfigured");
  });

  it("PENDING/PAID aday seçer; dispatched gönderilen sayıya eşittir", () => {
    const source = readSrc("lib/kernel/jobs/inngest.ts");
    expect(source).toContain("paytrClearingScan");
    expect(source).toContain("step.sendEvent");
    expect(source).toContain("dispatch-paytr-clearing-events");
    expect(source).toContain("INNGEST_EVENTS.PAYTR_CLEARING_REQUESTED");
    expect(source).toContain("merchantOid");
    expect(source).toContain("status: { in: [\"PENDING\", \"PAID\"] }");
    expect(source).toContain("paytrFailedRecoveryAfter");
    expect(source).toContain('status: "FAILED"');
    expect(source).toContain("selectPaytrClearingCandidates");
    expect(source).toContain("paytrClearingScanResult");
    expect(source).not.toMatch(/return pending\.length/);
  });

  it("tekil handler PSP reconcile eder; kör clearSuccessfulPaymentOrder yazmaz; port kapalıysa no-op", () => {
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
    expect(singleFn).toContain("shouldNoOpPaytrClearingScan");
    expect(singleFn).toContain("paytr.clearing.single.noop");
    expect(singleFn.indexOf("shouldNoOpPaytrClearingScan")).toBeLessThan(
      singleFn.indexOf("reconcilePaytrPaymentOrder"),
    );
    const reconcile = readSrc("lib/kernel/payments/paytr/reconcile.ts");
    expect(reconcile).toContain("queryPaytrOrderStatus");
    expect(reconcile).toContain("markFailed");
    expect(reconcile).toContain("amount_mismatch");
    expect(reconcile).toContain("pending_timeout");
    expect(reconcile).toContain("late_paid_recovery");
  });

  it("valör girişleri lisans kancasını reconcile çağrısından önce kaydeder", () => {
    const cron = readSrc("app/api/(kernel)/cron/paytr-reconcile/route.ts");
    expect(cron.indexOf("registerPaytrValorLicenseHooks()")).toBeGreaterThan(-1);
    expect(cron.indexOf("registerPaytrValorLicenseHooks()")).toBeLessThan(
      cron.indexOf("reconcilePaytrPaymentOrder("),
    );
    const cli = readSrc("scripts/ops-reconcile-paytr-pending.ts");
    expect(cli.indexOf("registerPaytrValorLicenseHooks()")).toBeGreaterThan(-1);
    expect(cli.indexOf("registerPaytrValorLicenseHooks()")).toBeLessThan(
      cli.indexOf("reconcilePaytrPaymentOrder("),
    );
    expect(readSrc("app/api/(kernel)/payments/webhooks/paytr/route.ts")).toContain(
      "registerPaytrValorLicenseHooks()",
    );
    expect(readSrc("app/api/(kernel)/jobs/inngest/route.ts")).toContain(
      "registerPaytrValorLicenseHooks()",
    );
    const helper = readSrc("app/api/(kernel)/payments/register-paytr-valor-hooks.ts");
    expect(helper.indexOf("registerPaytrAcademyLicenseHook()")).toBeLessThan(
      helper.indexOf("registerPaytrJuniorLicenseHook()"),
    );
    const vercel = readSrc("vercel.json");
    expect(vercel).toContain('"/api/cron/paytr-reconcile"');
    expect(vercel).toContain('"0 3 * * *"');
    const pkg = JSON.parse(readSrc("package.json")) as { scripts: Record<string, string> };
    expect(pkg.scripts["ops:reconcile-paytr-pending"]).toContain("--conditions=react-server");
    const mismatch = readSrc("lib/kernel/payments/paytr/webhook.ts");
    const logFn = mismatch.slice(mismatch.indexOf("export function logPaytrWebhookHmacMismatch"));
    expect(logFn).not.toContain("calculatedHash");
    expect(logFn).not.toContain("hashesEqual");
  });
});
