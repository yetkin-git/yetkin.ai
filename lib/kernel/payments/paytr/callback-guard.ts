/**
 * PayTR iFrame / canlı checkout callback yüzeyi.
 * Kanonik Bildirim URL tek ağızdır. İkinci ağız ve tarayıcı dönüşü CREDIT yazmaz.
 */

import { PAYTR_WEBHOOK_PATH } from "@/lib/kernel/payments/paytr/checkout";

export { PAYTR_WEBHOOK_PATH };

export const PAYTR_FORBIDDEN_CALLBACK_PATHS = [
  "/api/paytr/callback",
  "/api/paytr/webhook",
  "/api/callback/paytr",
  "/paytr/callback",
] as const;

export const PAYTR_CANONICAL_WEBHOOK_APP_ROUTE =
  "app/api/(kernel)/payments/webhooks/paytr/route.ts";

export const PAYTR_FORBIDDEN_CALLBACK_APP_ROUTES = [
  "app/api/paytr/callback/route.ts",
  "app/api/paytr/webhook/route.ts",
  "app/api/(kernel)/paytr/callback/route.ts",
  "app/api/callback/paytr/route.ts",
] as const;

export const PAYTR_MERCHANT_BROWSER_RETURN_PATH = "/cuzdan";

export type PaytrCallbackRouteInventory = {
  canonicalRouteExists: boolean;
  forbiddenExistingPaths: readonly string[];
};

export type PaytrCallbackIntegrity =
  | { ok: true }
  | { ok: false; reasons: readonly string[] };

function pathnameOf(value: string): string {
  const trimmed = value.trim();
  try {
    if (/^https?:\/\//i.test(trimmed)) {
      return new URL(trimmed).pathname.replace(/\/+$/, "") || "/";
    }
  } catch {
    return trimmed.split("?")[0] ?? trimmed;
  }
  const path = (trimmed.split("?")[0] ?? trimmed).replace(/\/+$/, "") || "/";
  return path.startsWith("/") ? path : `/${path}`;
}

export function isPaytrCanonicalWebhookPath(pathnameOrUrl: string): boolean {
  return pathnameOf(pathnameOrUrl) === PAYTR_WEBHOOK_PATH;
}

export function isForbiddenPaytrCallbackPath(pathnameOrUrl: string): boolean {
  const path = pathnameOf(pathnameOrUrl);
  return (PAYTR_FORBIDDEN_CALLBACK_PATHS as readonly string[]).includes(path);
}

export function isPaytrMerchantBrowserReturnPath(pathnameOrUrl: string): boolean {
  return pathnameOf(pathnameOrUrl) === PAYTR_MERCHANT_BROWSER_RETURN_PATH;
}

export function inspectPaytrCallbackAppRoutes(
  exists: (relativePath: string) => boolean,
): PaytrCallbackRouteInventory {
  return {
    canonicalRouteExists: exists(PAYTR_CANONICAL_WEBHOOK_APP_ROUTE),
    forbiddenExistingPaths: PAYTR_FORBIDDEN_CALLBACK_APP_ROUTES.filter((file) => exists(file)),
  };
}

export function evaluatePaytrCallbackRouteIntegrity(
  inventory: PaytrCallbackRouteInventory,
): PaytrCallbackIntegrity {
  const reasons: string[] = [];
  if (!inventory.canonicalRouteExists) {
    reasons.push(`Kanonik PayTR Bildirim URL yok: ${PAYTR_WEBHOOK_PATH}`);
  }
  if (inventory.forbiddenExistingPaths.length > 0) {
    reasons.push(`İkinci PayTR ağız yasak: ${inventory.forbiddenExistingPaths.join(", ")}`);
  }
  return reasons.length === 0 ? { ok: true } : { ok: false, reasons };
}

export function assertPaytrCallbackRouteIntegrity(inventory: PaytrCallbackRouteInventory): void {
  const result = evaluatePaytrCallbackRouteIntegrity(inventory);
  if (!result.ok) {
    throw new Error(result.reasons.join(" "));
  }
}

export function assertPaytrMerchantBrowserReturnDoesNotCredit(pathnameOrUrl: string): void {
  if (
    isPaytrCanonicalWebhookPath(pathnameOrUrl) ||
    isForbiddenPaytrCallbackPath(pathnameOrUrl)
  ) {
    throw new Error(
      "merchant_ok_url / merchant_fail_url CREDIT yazmaz; Bildirim URL ayrıdır.",
    );
  }
}
