/**
 * Yerel lab mock iFrame token. CREDIT yazmaz.
 * Webhook, clearing ve reconcile bu dosyayı import etmez.
 * Üretimde tryPaytrDevOnlyMockCheckout her zaman null döner.
 */

export const PAYTR_MOCK_TOKEN_PREFIX = "mock-" as const;
export const PAYTR_MOCK_NO_CREDIT_CLAIM = "CREDIT yazmaz" as const;

export type PaytrDevOnlyMockCheckout = {
  token: string;
  merchantOid: string;
  sandboxMode: true;
  mockCheckout: true;
};

export function isPaytrMockCheckoutAllowed(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return env.PAYTR_ALLOW_MOCK_CHECKOUT?.trim().toLowerCase() === "true";
}

export function buildPaytrMockCheckoutToken(merchantOid: string): string {
  return `${PAYTR_MOCK_TOKEN_PREFIX}${merchantOid.slice(0, 32)}`;
}

export function tryPaytrDevOnlyMockCheckout(
  merchantOid: string,
  env: Record<string, string | undefined> = process.env,
): PaytrDevOnlyMockCheckout | null {
  if (env.NODE_ENV === "production") {
    return null;
  }
  if (!isPaytrMockCheckoutAllowed(env)) {
    return null;
  }
  return {
    token: buildPaytrMockCheckoutToken(merchantOid),
    merchantOid,
    sandboxMode: true,
    mockCheckout: true,
  };
}
