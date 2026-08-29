import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PAYTR_CANONICAL_WEBHOOK_APP_ROUTE,
  PAYTR_FORBIDDEN_CALLBACK_APP_ROUTES,
  PAYTR_WEBHOOK_PATH,
  assertPaytrCallbackRouteIntegrity,
  inspectPaytrCallbackAppRoutes,
} from "@/lib/kernel/payments/paytr/callback-guard";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("PayTR canlı callback yüzeyi", () => {
  it("kanonik Bildirim URL durur; /api/paytr/callback ikinci ağız yoktur", () => {
    const inventory = inspectPaytrCallbackAppRoutes((relative) =>
      existsSync(join(ROOT, relative)),
    );
    expect(inventory.canonicalRouteExists).toBe(true);
    expect(inventory.forbiddenExistingPaths).toEqual([]);
    expect(() => assertPaytrCallbackRouteIntegrity(inventory)).not.toThrow();
    expect(existsSync(join(ROOT, PAYTR_CANONICAL_WEBHOOK_APP_ROUTE))).toBe(true);
    for (const banned of PAYTR_FORBIDDEN_CALLBACK_APP_ROUTES) {
      expect(existsSync(join(ROOT, banned)), banned).toBe(false);
    }

    const route = readSrc(PAYTR_CANONICAL_WEBHOOK_APP_ROUTE);
    expect(route).toContain("export const auth = \"webhook\"");
    expect(route).toContain("verifyWebhook");
    expect(route).toContain("settlePaytrWebhookSuccess");
    expect(route).toContain("settlePaytrWebhookFailure");
    expect(route).toContain("PAYTR_WEBHOOK_PATH");
    expect(readSrc("lib/kernel/payments/paytr/checkout.ts")).toContain(
      `export const PAYTR_WEBHOOK_PATH = "${PAYTR_WEBHOOK_PATH}"`,
    );

    const topUp = readSrc("app/api/(kernel)/wallet/top-up/route.ts");
    expect(topUp).toContain("merchantOkUrl: `${origin}/cuzdan`");
    expect(topUp).toContain("merchantFailUrl: `${origin}/cuzdan`");
    expect(topUp).not.toContain("merchantOkUrl: `${origin}/api/payments/webhooks/paytr`");
  });

  it("mock checkout canlı webhook/clearing grafına girmez", () => {
    const mock = readSrc("lib/kernel/payments/paytr/mock-checkout.ts");
    expect(mock).toContain("CREDIT yazmaz");
    expect(mock).toContain("tryPaytrDevOnlyMockCheckout");
    expect(readSrc("lib/kernel/payments/paytr/webhook.ts")).not.toContain("mock-checkout");
    expect(readSrc("lib/kernel/payments/paytr/adapter.ts")).not.toContain("mock-checkout");
    expect(readSrc("lib/kernel/payments/clearing.ts")).not.toContain("mock-checkout");
    expect(readSrc("lib/kernel/payments/paytr/reconcile.ts")).not.toContain("mock-checkout");
    expect(readSrc("lib/kernel/payments/paytr/webhook-settle.ts")).not.toContain("mock-checkout");
    expect(readSrc(PAYTR_CANONICAL_WEBHOOK_APP_ROUTE)).not.toContain("mock-checkout");
    expect(readSrc("lib/kernel/payments/paytr/checkout.ts")).toContain("tryPaytrDevOnlyMockCheckout");
    expect(readSrc("lib/kernel/payments/paytr/checkout.ts")).toContain("assertPaytrProductionSafety");
    const webhookRoute = readSrc(PAYTR_CANONICAL_WEBHOOK_APP_ROUTE);
    expect(webhookRoute).toContain("paytr.webhook.clearing_deferred");
    expect(webhookRoute).toContain("amountMinor: verified.amountMinor");
    expect(webhookRoute).toContain("paytr.webhook.defer_unacked");
    expect(webhookRoute).toContain("canSendInngestEvents");
    expect(webhookRoute).toContain("inngest_unconfigured");
    expect(webhookRoute).toContain("inngest_event_key_unconfigured");
  });
});
