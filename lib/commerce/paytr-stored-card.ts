import { createHmac } from "node:crypto";
import { getPaytrCheckoutCredentials } from "@/lib/kernel/payments/paytr/checkout";
import { toPositiveAmountMinor } from "@/lib/kernel/money/amount-minor";

const PAYTR_DIRECT_URL = "https://www.paytr.com/odeme";

export type StoredCardChargeInput = {
  merchantOid: string;
  email: string;
  userIp: string;
  amountMinor: number;
  utoken: string;
  ctoken: string;
};

/**
 * Kayıtlı kart (CAPI) hash'i iFrame hash'inden ayrıdır.
 * merchant_id + user_ip + merchant_oid + email + payment_amount + payment_type
 * + installment_count + currency + test_mode + non_3d + merchant_salt
 */
export function buildPaytrStoredCardToken(input: {
  merchantId: string;
  userIp: string;
  merchantOid: string;
  email: string;
  paymentAmount: string;
  testMode: string;
  merchantKey: string;
  merchantSalt: string;
}): string {
  const hashStr =
    `${input.merchantId}${input.userIp}${input.merchantOid}${input.email}${input.paymentAmount}` +
    `card0TL${input.testMode}1${input.merchantSalt}`;
  return createHmac("sha256", input.merchantKey).update(hashStr).digest("base64");
}

/** Token yoksa veya PayTR kimliği yoksa çekim yapılmaz. */
export async function chargeStoredPaytrCard(
  input: StoredCardChargeInput,
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: boolean }> {
  if (!input.utoken.trim() || !input.ctoken.trim()) {
    return { ok: false };
  }
  const credentials = getPaytrCheckoutCredentials();
  if (!credentials) {
    return { ok: false };
  }
  const paymentAmount = String(toPositiveAmountMinor(input.amountMinor));
  const testMode = credentials.testMode ? "1" : "0";
  const paytrToken = buildPaytrStoredCardToken({
    merchantId: credentials.merchantId,
    userIp: input.userIp,
    merchantOid: input.merchantOid,
    email: input.email,
    paymentAmount,
    testMode,
    merchantKey: credentials.merchantKey,
    merchantSalt: credentials.merchantSalt,
  });
  const body = new URLSearchParams({
    merchant_id: credentials.merchantId,
    user_ip: input.userIp,
    merchant_oid: input.merchantOid,
    email: input.email,
    payment_amount: paymentAmount,
    payment_type: "card",
    installment_count: "0",
    currency: "TL",
    test_mode: testMode,
    non_3d: "1",
    utoken: input.utoken,
    ctoken: input.ctoken,
    paytr_token: paytrToken,
  });
  try {
    const response = await fetchImpl(PAYTR_DIRECT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const payload = (await response.json()) as { status?: string };
    return { ok: response.ok && payload.status === "success" };
  } catch {
    return { ok: false };
  }
}
