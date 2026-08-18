import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PAYTR_FORBIDDEN_CALLBACK_PATHS,
  PAYTR_WEBHOOK_PATH,
  assertPaytrCallbackRouteIntegrity,
  assertPaytrMerchantBrowserReturnDoesNotCredit,
  evaluatePaytrCallbackRouteIntegrity,
  inspectPaytrCallbackAppRoutes,
  isForbiddenPaytrCallbackPath,
  isPaytrCanonicalWebhookPath,
  isPaytrMerchantBrowserReturnPath,
} from "@/lib/kernel/payments/paytr/callback-guard";

const ROOT = process.cwd();

describe("PayTR callback bütünlüğü", () => {
  it("yalnız kanonik Bildirim URL geçerlidir; ikinci ağız yasaktır", () => {
    expect(PAYTR_WEBHOOK_PATH).toBe("/api/payments/webhooks/paytr");
    expect(isPaytrCanonicalWebhookPath("https://rail.example/api/payments/webhooks/paytr")).toBe(
      true,
    );
    expect(isPaytrCanonicalWebhookPath("/api/payments/webhooks/paytr")).toBe(true);
    expect(isForbiddenPaytrCallbackPath("/api/paytr/callback")).toBe(true);
    expect(PAYTR_FORBIDDEN_CALLBACK_PATHS).toContain("/api/paytr/callback");
    expect(isPaytrCanonicalWebhookPath("/api/paytr/callback")).toBe(false);
  });

  it("tarayıcı /cuzdan dönüşü CREDIT yazmaz", () => {
    expect(isPaytrMerchantBrowserReturnPath("https://rail.example/cuzdan")).toBe(true);
    expect(() => assertPaytrMerchantBrowserReturnDoesNotCredit("/cuzdan")).not.toThrow();
    expect(() =>
      assertPaytrMerchantBrowserReturnDoesNotCredit("/api/payments/webhooks/paytr"),
    ).toThrow(/CREDIT yazmaz/);
    expect(() => assertPaytrMerchantBrowserReturnDoesNotCredit("/api/paytr/callback")).toThrow(
      /CREDIT yazmaz/,
    );
  });

  it("uygulama ağacında kanonik route durur; ikinci ağız dosyası yoktur", () => {
    const inventory = inspectPaytrCallbackAppRoutes((relative) =>
      existsSync(join(ROOT, relative)),
    );
    expect(evaluatePaytrCallbackRouteIntegrity(inventory)).toEqual({ ok: true });
    expect(() => assertPaytrCallbackRouteIntegrity(inventory)).not.toThrow();
    expect(
      evaluatePaytrCallbackRouteIntegrity({
        canonicalRouteExists: false,
        forbiddenExistingPaths: ["app/api/paytr/callback/route.ts"],
      }).ok,
    ).toBe(false);
  });
});
