import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("PayTR mutabakat mühür zinciri yüzeyi", () => {
  it("verify:paytr-reconciliation-seals nightly kovasında, web-security'den sonra surface'ten önce çalışır", () => {
    const pkg = JSON.parse(readSrc("package.json")) as { scripts: Record<string, string> };
    const prebuild = pkg.scripts["verify:prebuild"] ?? "";
    const nightly = pkg.scripts["verify:nightly"] ?? "";
    expect(pkg.scripts["verify:paytr-reconciliation-seals"]).toContain(
      "tsx scripts/verify-paytr-reconciliation-seals.ts",
    );
    expect(pkg.scripts["verify:paytr-reconciliation-seals"]).toContain(
      "tests/kernel/paytr-webhook-security.test.ts",
    );
    expect(pkg.scripts["verify:paytr-reconciliation-seals"]).toContain(
      "tests/kernel/ledger-reconciliation.test.ts",
    );
    expect(prebuild).not.toContain("verify:paytr-reconciliation-seals");
    expect(nightly).toContain("verify:paytr-reconciliation-seals");
    const webAt = nightly.indexOf("verify:web-security-seals");
    const paytrAt = nightly.indexOf("verify:paytr-reconciliation-seals");
    const surfaceAt = nightly.indexOf("test:surface");
    expect(webAt).toBeGreaterThan(-1);
    expect(paytrAt).toBeGreaterThan(webAt);
    expect(surfaceAt).toBeGreaterThan(paytrAt);
  });

  it("webhook mismatch sessiz ACK etmez; settle anomali yazar", () => {
    const route = readSrc("app/api/(kernel)/payments/webhooks/paytr/route.ts");
    expect(route).toContain("settlePaytrWebhookSuccess");
    expect(route).not.toContain("paytr.webhook.skipped");
    const settle = readSrc("lib/kernel/payments/paytr/webhook-settle.ts");
    expect(settle).toContain("recordPaymentAnomaly");
    expect(settle).toContain("creditApplied: false");
    expect(readSrc("lib/kernel/payments/paytr/webhook.ts")).toContain(
      "isPaytrWebhookIpAllowlistRequired",
    );
  });
});
