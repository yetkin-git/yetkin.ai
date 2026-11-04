import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PAYTR_FORBIDDEN_CALLBACK_PATHS,
  PAYTR_PANEL_WEBHOOK_PATH,
  PAYTR_WEBHOOK_PATH,
  assertPaytrCallbackRouteIntegrity,
  assertPaytrMerchantBrowserReturnDoesNotCredit,
  evaluatePaytrCallbackRouteIntegrity,
  inspectPaytrCallbackAppRoutes,
  isForbiddenPaytrCallbackPath,
  isPaytrCanonicalWebhookPath,
  isPaytrMerchantBrowserReturnPath,
  isPaytrNotificationPath,
  isPaytrPanelWebhookPath,
  paytrUnverifiedNotificationStatus,
} from "@/lib/kernel/payments/paytr/callback-guard";

const ROOT = process.cwd();

describe("PayTR callback bütünlüğü", () => {
  it("kanonik handler ve panel alias aynı Bildirim URL ailesidir; üçüncü ağız yasaktır", () => {
    expect(PAYTR_WEBHOOK_PATH).toBe("/api/payments/webhooks/paytr");
    expect(PAYTR_PANEL_WEBHOOK_PATH).toBe("/api/paytr/callback");
    expect(isPaytrCanonicalWebhookPath("https://rail.example/api/payments/webhooks/paytr")).toBe(
      true,
    );
    expect(isPaytrCanonicalWebhookPath("/api/payments/webhooks/paytr")).toBe(true);
    expect(isPaytrPanelWebhookPath("https://yetkin.ai/api/paytr/callback")).toBe(true);
    expect(paytrUnverifiedNotificationStatus("invalid_signature")).toBe(403);
    expect(paytrUnverifiedNotificationStatus("missing_credentials")).toBe(400);
    expect(paytrUnverifiedNotificationStatus("production_safety")).toBe(403);
    expect(paytrUnverifiedNotificationStatus("invalid_payload")).toBe(400);
    expect(isPaytrNotificationPath("/api/paytr/callback")).toBe(true);
    expect(isPaytrCanonicalWebhookPath("/api/paytr/callback")).toBe(false);
    expect(isForbiddenPaytrCallbackPath("/api/paytr/callback")).toBe(false);
    expect(PAYTR_FORBIDDEN_CALLBACK_PATHS).not.toContain("/api/paytr/callback");
    expect(PAYTR_FORBIDDEN_CALLBACK_PATHS).toContain("/api/paytr/webhook");
    expect(isForbiddenPaytrCallbackPath("/api/paytr/webhook")).toBe(true);
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

  it("uygulama ağacında kanonik + panel alias durur; bağımsız ikinci ağız yoktur", () => {
    const inventory = inspectPaytrCallbackAppRoutes((relative) =>
      existsSync(join(ROOT, relative)),
    );
    expect(evaluatePaytrCallbackRouteIntegrity(inventory)).toEqual({ ok: true });
    expect(() => assertPaytrCallbackRouteIntegrity(inventory)).not.toThrow();
    expect(
      evaluatePaytrCallbackRouteIntegrity({
        canonicalRouteExists: false,
        aliasRouteExists: true,
        forbiddenExistingPaths: ["app/api/paytr/webhook/route.ts"],
      }).ok,
    ).toBe(false);
    expect(
      evaluatePaytrCallbackRouteIntegrity({
        canonicalRouteExists: true,
        aliasRouteExists: false,
        forbiddenExistingPaths: [],
      }).ok,
    ).toBe(false);
  });
});
