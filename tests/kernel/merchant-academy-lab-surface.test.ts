import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { assertPaytrProductionSafety, PaytrProductionSafetyError } from "@/lib/kernel/payments/paytr/checkout";
import { paytrMarketplaceSplitPort } from "@/lib/kernel/payments/marketplace-split";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("Merchant akademi lab yüzeyi", () => {
  it("harness + ops:t3 üretim mock/sandbox bayrağı açmaz; split stub sızmaz", () => {
    const pkg = JSON.parse(readSrc("package.json")) as { scripts: Record<string, string> };
    expect(pkg.scripts["ops:t3-academy-loop"]).toBe("tsx scripts/ops-t3-academy-loop.ts");
    expect(pkg.scripts["ops:ghost-wallet-holds"]).toBe("tsx scripts/ops-ghost-wallet-holds.ts");

    const harness = readSrc("tests/helpers/merchant-academy-lab-journey.ts");
    expect(harness).toContain("wallet-top-up");
    expect(harness).toContain("academy-purchase");
    expect(harness).toContain("paytrMarketplaceSplitPort");
    expect(harness).toContain("not_configured");
    expect(harness).not.toContain("acceptFreelancerBid");
    expect(harness).not.toContain("releaseFreelancerContract");
    expect(harness).not.toContain("createMemoryMarketplaceSplitPort");
    expect(harness).not.toContain("PAYTR_ALLOW_MOCK_CHECKOUT=true");

    const t3 = readSrc("scripts/ops-t3-academy-loop.ts");
    expect(t3).toContain("computePaytrWebhookHash");
    expect(t3).not.toContain("PAYTR_ALLOW_MOCK_CHECKOUT=true");
    expect(t3).not.toContain("LOCAL_MOCK_AUTH");

    expect(readSrc("lib/kernel/payments/marketplace-split.ts")).toContain('reason: "not_configured"');
  });

  it("üretimde sandbox/mock fail-closed; split beginHold/settle not_configured", async () => {
    const prevNode = process.env.NODE_ENV;
    const prevSandbox = process.env.PAYTR_SANDBOX;
    const prevMock = process.env.PAYTR_ALLOW_MOCK_CHECKOUT;
    try {
      process.env.NODE_ENV = "production";
      process.env.PAYTR_SANDBOX = "1";
      expect(() => assertPaytrProductionSafety("merchant-lab-surface")).toThrow(
        PaytrProductionSafetyError,
      );
      process.env.PAYTR_SANDBOX = "";
      process.env.PAYTR_ALLOW_MOCK_CHECKOUT = "true";
      expect(() => assertPaytrProductionSafety("merchant-lab-surface")).toThrow(
        /PAYTR_ALLOW_MOCK_CHECKOUT üretimde yasak/,
      );
    } finally {
      process.env.NODE_ENV = prevNode;
      process.env.PAYTR_SANDBOX = prevSandbox;
      process.env.PAYTR_ALLOW_MOCK_CHECKOUT = prevMock;
    }

    expect(await paytrMarketplaceSplitPort.beginHold({
      buyerUserId: "lab",
      referenceKey: "surface",
      grossMinor: 1000,
      holdBps: 1000,
      currencyCode: "TRY",
    })).toEqual({ ok: false, reason: "not_configured" });
    expect(
      await paytrMarketplaceSplitPort.settle({
        providerId: "split",
        referenceKey: "surface",
        currencyCode: "TRY",
        status: "recorded_pending_psp",
        legs: [],
      }),
    ).toEqual({ ok: false, reason: "not_configured" });
  });
});
