import { createHmac } from "node:crypto";
import { toPositiveAmountMinor } from "@/lib/kernel/money/amount-minor";
import { logEvent } from "@/lib/kernel/observability/log";
import {
  isPaytrCheckoutUserComplete,
  normalizeTrMobilePhone,
} from "@/lib/kernel/identity/billing-info";
import {
  isPaytrMockCheckoutAllowed,
  tryPaytrDevOnlyMockCheckout,
} from "@/lib/kernel/payments/paytr/mock-checkout";

export {
  buildPaytrMockCheckoutToken,
  isPaytrMockCheckoutAllowed,
  PAYTR_MOCK_TOKEN_PREFIX,
  tryPaytrDevOnlyMockCheckout,
} from "@/lib/kernel/payments/paytr/mock-checkout";

export const PAYTR_GET_TOKEN_URL = "https://www.paytr.com/odeme/api/get-token";
export const PAYTR_IFRAME_BASE_URL = "https://www.paytr.com/odeme/guvenli";
/** Cüzdan yükleme tek çekim — vade farkı `total_amount` sapmasını kapatır. */
export const PAYTR_IFRAME_NO_INSTALLMENT = "1" as const;
export const PAYTR_IFRAME_MAX_INSTALLMENT = "0" as const;
export const PAYTR_WEBHOOK_PATH = "/api/payments/webhooks/paytr";

export type PaytrCheckoutCredentials = {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  testMode: boolean;
};

export type PaytrUserBasketItem = {
  name: string;
  amountMinor: number;
  quantity: number;
};

export type PaytrCheckoutTokenInput = {
  merchantOid: string;
  userIp: string;
  email: string;
  paymentAmountMinor: number;
  userName?: string;
  userPhone?: string;
  userAddress?: string;
  merchantOkUrl: string;
  merchantFailUrl: string;
  userBasket: PaytrUserBasketItem[];
  paymentType?: "card" | "eft";
  installmentCount?: number;
  currency?: "TL";
  non3d?: "0" | "1";
  timeoutLimitMinutes?: number;
  debugOn?: boolean;
};

export type PaytrCheckoutTokenResult =
  | {
      ok: true;
      token: string;
      iframeUrl: string;
      merchantOid: string;
      sandboxMode: boolean;
      /** Yalnız PAYTR_ALLOW_MOCK_CHECKOUT + kimlik yok + üretim dışı. CREDIT yazmaz. */
      mockCheckout?: boolean;
    }
  | {
      ok: false;
      reason: "missing_credentials" | "invalid_amount" | "invalid_user" | "pay_api_error";
      message: string;
    };

export class PaytrProductionSafetyError extends Error {
  readonly code = "PAYTR_PRODUCTION_SAFETY" as const;
  readonly flag: "PAYTR_SANDBOX" | "PAYTR_ALLOW_MOCK_CHECKOUT";

  constructor(flag: "PAYTR_SANDBOX" | "PAYTR_ALLOW_MOCK_CHECKOUT", context: string) {
    const message =
      flag === "PAYTR_ALLOW_MOCK_CHECKOUT"
        ? `[PAYTR] PAYTR_ALLOW_MOCK_CHECKOUT üretimde yasak — ${context}`
        : `[PAYTR] PAYTR_SANDBOX üretimde yasak — ${context}`;
    super(message);
    this.name = "PaytrProductionSafetyError";
    this.flag = flag;
  }
}

export class PaytrMissingCredentialsError extends Error {
  readonly code = "PAYTR_MISSING_CREDENTIALS" as const;

  constructor(context: string) {
    super(
      `PayTR kimlik bilgileri eksik (${context}): PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY ve PAYTR_MERCHANT_SALT zorunludur.`,
    );
    this.name = "PaytrMissingCredentialsError";
  }
}

export function isPaytrProductionSafetyError(
  error: unknown,
): error is PaytrProductionSafetyError {
  return error instanceof PaytrProductionSafetyError;
}

export function isPaytrMissingCredentialsError(
  error: unknown,
): error is PaytrMissingCredentialsError {
  return error instanceof PaytrMissingCredentialsError;
}

export function assertPaytrProductionSafety(context: string): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }
  if (isPaytrMockCheckoutAllowed()) {
    const error = new PaytrProductionSafetyError("PAYTR_ALLOW_MOCK_CHECKOUT", context);
    logEvent({
      level: "error",
      event: "paytr.production_safety",
      reason: "PAYTR_ALLOW_MOCK_CHECKOUT",
      action: context,
    });
    throw error;
  }
  const sandboxFlag = process.env.PAYTR_SANDBOX?.trim();
  if (sandboxFlag === "1" || sandboxFlag?.toLowerCase() === "true") {
    const error = new PaytrProductionSafetyError("PAYTR_SANDBOX", context);
    logEvent({
      level: "error",
      event: "paytr.production_safety",
      reason: "PAYTR_SANDBOX",
      action: context,
    });
    throw error;
  }
}

export function getPaytrCheckoutCredentials(): PaytrCheckoutCredentials | null {
  const merchantId = process.env.PAYTR_MERCHANT_ID?.trim() ?? "";
  const merchantKey = process.env.PAYTR_MERCHANT_KEY?.trim() ?? "";
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT?.trim() ?? "";
  if (!merchantId || !merchantKey || !merchantSalt) {
    return null;
  }
  const sandboxFlag = process.env.PAYTR_SANDBOX?.trim();
  const testMode = sandboxFlag === "1" || sandboxFlag?.toLowerCase() === "true";
  return { merchantId, merchantKey, merchantSalt, testMode };
}

export function isPaytrSandboxEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  const flag = env.PAYTR_SANDBOX?.trim();
  return flag === "1" || flag?.toLowerCase() === "true";
}

/** Fail-closed / sandbox sicili. Mock ve boş üçlü CREDIT yazmaz. */
export type PaytrRuntimeMode = "unconfigured" | "mock" | "sandbox" | "live";

export function readPaytrRuntimeMode(
  env: Record<string, string | undefined> = process.env,
): PaytrRuntimeMode {
  const merchantId = env.PAYTR_MERCHANT_ID?.trim() ?? "";
  const merchantKey = env.PAYTR_MERCHANT_KEY?.trim() ?? "";
  const merchantSalt = env.PAYTR_MERCHANT_SALT?.trim() ?? "";
  const triple = Boolean(merchantId && merchantKey && merchantSalt);
  if (!triple) {
    return isPaytrMockCheckoutAllowed(env) ? "mock" : "unconfigured";
  }
  return isPaytrSandboxEnabled(env) ? "sandbox" : "live";
}

/** Yalnız sandbox veya canlı üçlü bakiyeye CREDIT doğurabilir (HMAC / valör sonrası). */
export function paytrRuntimeCreditsWallet(
  mode: PaytrRuntimeMode = readPaytrRuntimeMode(),
): boolean {
  return mode === "sandbox" || mode === "live";
}

export function requirePaytrCheckoutCredentials(context: string): PaytrCheckoutCredentials {
  const credentials = getPaytrCheckoutCredentials();
  if (!credentials) {
    throw new PaytrMissingCredentialsError(context);
  }
  return credentials;
}

export function isPaytrLoopbackOrPrivateIp(ip: string): boolean {
  const trimmed = ip.trim().toLowerCase();
  if (!trimmed || trimmed === "localhost" || trimmed === "::1" || trimmed === "0.0.0.0") {
    return true;
  }
  if (trimmed.startsWith("127.") || trimmed.startsWith("10.")) {
    return true;
  }
  if (trimmed.startsWith("192.168.") || trimmed.startsWith("169.254.")) {
    return true;
  }
  return /^172\.(1[6-9]|2\d|3[0-1])\./.test(trimmed);
}

export function assertPaytrLiveUserIp(userIp: string, context: string): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }
  if (isPaytrLoopbackOrPrivateIp(userIp)) {
    throw new Error(`[PAYTR] user_ip üretimde genel IPv4 olmalıdır — ${context}`);
  }
}

export function resolvePaytrMerchantAppOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? "";
  if (process.env.NODE_ENV === "production") {
    if (!raw) {
      throw new Error("[PAYTR] NEXT_PUBLIC_APP_URL üretimde zorunludur.");
    }
    let parsed: URL;
    try {
      parsed = new URL(raw);
    } catch {
      throw new Error("[PAYTR] NEXT_PUBLIC_APP_URL üretimde geçerli HTTPS köken olmalıdır.");
    }
    if (parsed.protocol !== "https:") {
      throw new Error("[PAYTR] NEXT_PUBLIC_APP_URL üretimde HTTPS olmalıdır.");
    }
    const host = parsed.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
      throw new Error("[PAYTR] NEXT_PUBLIC_APP_URL üretimde localhost olamaz.");
    }
    return `${parsed.protocol}//${parsed.host}`;
  }
  return (raw || "http://localhost:3000").replace(/\/$/, "");
}

/**
 * PayTR API sınır katmanı: TRY minor → ondalık string (1300 → "13.00").
 * `.toFixed(2)` yalnızca burada görülür.
 */
export function formatPaytrPaymentAmount(paymentAmountMinor: number): string {
  if (!Number.isInteger(paymentAmountMinor) || paymentAmountMinor <= 0) {
    throw new Error("PayTR payment_amount geçersiz.");
  }
  toPositiveAmountMinor(paymentAmountMinor);
  return (paymentAmountMinor / 100).toFixed(2);
}

export function encodePaytrUserBasket(items: PaytrUserBasketItem[]): string {
  const payload = items.map((item) => [
    item.name.slice(0, 128),
    formatPaytrPaymentAmount(item.amountMinor),
    item.quantity,
  ]);
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

/** Sepet Σ(birim × adet) — kart/vitrin amountMinor ile get-token payment_amount aynı kapıda durur. */
export function paytrUserBasketTotalMinor(items: readonly PaytrUserBasketItem[]): number {
  let total = 0;
  for (const item of items) {
    if (!Number.isInteger(item.amountMinor) || item.amountMinor <= 0) {
      throw new Error("PayTR sepet tutarı geçersiz.");
    }
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error("PayTR sepet adedi geçersiz.");
    }
    total += item.amountMinor * item.quantity;
  }
  if (!Number.isInteger(total) || total <= 0) {
    throw new Error("PayTR sepet toplamı geçersiz.");
  }
  return total;
}

export function paytrBasketMatchesPayment(
  items: readonly PaytrUserBasketItem[],
  paymentAmountMinor: number,
): boolean {
  try {
    return paytrUserBasketTotalMinor(items) === paymentAmountMinor;
  } catch {
    return false;
  }
}

export function buildPaytrIframeUrl(token: string): string {
  return `${PAYTR_IFRAME_BASE_URL}/${encodeURIComponent(token)}`;
}

/**
 * iFrame get-token HMAC — PayTR resmi sıra:
 * merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket
 * + no_installment + max_installment + currency + test_mode + merchant_salt
 * payment_amount gövdede kuruş tam sayı stringidir; sepet birim fiyatı ondalık TL kalır.
 */
export function buildPaytrTokenHash(params: {
  credentials: PaytrCheckoutCredentials;
  userIp: string;
  merchantOid: string;
  email: string;
  paymentAmount: string;
  userBasket: string;
  noInstallment: string;
  maxInstallment: string;
  currency: string;
  testMode: string;
}): string {
  const hashStr =
    `${params.credentials.merchantId}${params.userIp}${params.merchantOid}` +
    `${params.email}${params.paymentAmount}${params.userBasket}` +
    `${params.noInstallment}${params.maxInstallment}${params.currency}${params.testMode}`;
  return createHmac("sha256", params.credentials.merchantKey)
    .update(hashStr + params.credentials.merchantSalt)
    .digest("base64");
}

export async function requestPaytrCheckoutToken(
  input: PaytrCheckoutTokenInput,
  fetchImpl: typeof fetch = fetch,
): Promise<PaytrCheckoutTokenResult> {
  assertPaytrProductionSafety("requestPaytrCheckoutToken");
  assertPaytrLiveUserIp(input.userIp, "requestPaytrCheckoutToken");

  if (!Number.isInteger(input.paymentAmountMinor) || input.paymentAmountMinor <= 0) {
    return {
      ok: false,
      reason: "invalid_amount",
      message: "Ödeme tutarı geçersiz.",
    };
  }

  if (!paytrBasketMatchesPayment(input.userBasket, input.paymentAmountMinor)) {
    return {
      ok: false,
      reason: "invalid_amount",
      message: "PayTR sepet tutarı ödeme tutarı ile eşleşmiyor.",
    };
  }

  const credentials = getPaytrCheckoutCredentials();
  if (!credentials) {
    const mock = tryPaytrDevOnlyMockCheckout(input.merchantOid);
    if (mock) {
      return {
        ok: true,
        token: mock.token,
        iframeUrl: buildPaytrIframeUrl(mock.token),
        merchantOid: mock.merchantOid,
        sandboxMode: mock.sandboxMode,
        mockCheckout: true,
      };
    }
    return {
      ok: false,
      reason: "missing_credentials",
      message: isPaytrMockCheckoutAllowed()
        ? "PayTR kimlik bilgileri tanımlı değil. Mock ödeme yalnızca NODE_ENV !== production iken çalışır."
        : "PayTR kimlik bilgileri tanımlı değil. Yerel mock için PAYTR_ALLOW_MOCK_CHECKOUT=true gerekir.",
    };
  }

  const paymentAmount = String(toPositiveAmountMinor(input.paymentAmountMinor));
  const userBasket = encodePaytrUserBasket(input.userBasket);
  const currency = input.currency ?? "TL";
  const testMode = credentials.testMode ? "1" : "0";
  const noInstallment = PAYTR_IFRAME_NO_INSTALLMENT;
  const maxInstallment = PAYTR_IFRAME_MAX_INSTALLMENT;

  const paytrToken = buildPaytrTokenHash({
    credentials,
    userIp: input.userIp,
    merchantOid: input.merchantOid,
    email: input.email,
    paymentAmount,
    userBasket,
    noInstallment,
    maxInstallment,
    currency,
    testMode,
  });

  if (!isPaytrCheckoutUserComplete(input)) {
    return {
      ok: false,
      reason: "invalid_user",
      message: "Ödeme için ad, açık adres ve geçerli cep telefonu zorunludur.",
    };
  }

  const userName = input.userName!.trim();
  const userAddress = input.userAddress!.trim();
  const userPhone = normalizeTrMobilePhone(input.userPhone);
  if (!userPhone) {
    return {
      ok: false,
      reason: "invalid_user",
      message: "Ödeme için ad, açık adres ve geçerli cep telefonu zorunludur.",
    };
  }

  const body = new URLSearchParams({
    merchant_id: credentials.merchantId,
    user_ip: input.userIp,
    merchant_oid: input.merchantOid,
    email: input.email,
    payment_amount: paymentAmount,
    paytr_token: paytrToken,
    user_basket: userBasket,
    debug_on: (input.debugOn ?? credentials.testMode) ? "1" : "0",
    test_mode: testMode,
    no_installment: noInstallment,
    max_installment: maxInstallment,
    currency,
    merchant_ok_url: input.merchantOkUrl,
    merchant_fail_url: input.merchantFailUrl,
    user_name: userName,
    user_address: userAddress,
    user_phone: userPhone,
    timeout_limit: String(input.timeoutLimitMinutes ?? 30),
  });

  let response: Response;
  try {
    response = await fetchImpl(PAYTR_GET_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PayTR bağlantı hatası.";
    return { ok: false, reason: "pay_api_error", message };
  }

  let payload: { status?: string; token?: string; reason?: string };
  try {
    payload = (await response.json()) as typeof payload;
  } catch {
    return { ok: false, reason: "pay_api_error", message: "PayTR yanıtı okunamadı." };
  }

  if (payload.status !== "success" || !payload.token) {
    return {
      ok: false,
      reason: "pay_api_error",
      message: payload.reason ?? "PayTR token alınamadı.",
    };
  }

  return {
    ok: true,
    token: payload.token,
    iframeUrl: buildPaytrIframeUrl(payload.token),
    merchantOid: input.merchantOid,
    sandboxMode: credentials.testMode,
  };
}
