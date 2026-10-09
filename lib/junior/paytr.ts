import "server-only";

import { JUNIOR_GUARDIAN_NOTICE, isJuniorNoticeUsable } from "@/lib/junior/guardian-notice";
import { isJuniorCheckoutLocked } from "@/lib/kernel/security/junior-gate";
import {
  buildPaytrIframeUrl,
  buildPaytrTokenHash,
  encodePaytrSingleBasket,
  getPaytrCheckoutCredentials,
  isPaytrSandboxEnabled,
  PAYTR_IFRAME_MAX_INSTALLMENT,
  PAYTR_IFRAME_NO_INSTALLMENT,
  readPaytrRuntimeMode,
  type PaytrCheckoutCredentials,
  type PaytrRuntimeMode,
} from "@/lib/kernel/payments/paytr/checkout";

/**
 * Canlı satış kapısı. Deneme mağaza numarası ve sandbox satışı açmaz.
 * Üretim kilidi dururken canlı üçlü gelse de bu fonksiyon kapalı kalır.
 * Kart numarası bu kapıdan geçmez. Tutar mührü kernel `buildPaytrTokenHash` ile kurulur.
 */
export function juniorPaytrCredentialsAllowSale(input: {
  credentials: PaytrCheckoutCredentials | null;
  productionLocked: boolean;
  runtimeMode: PaytrRuntimeMode;
}): boolean {
  if (input.productionLocked || input.runtimeMode !== "live") {
    return false;
  }
  const credentials = input.credentials;
  if (!credentials || credentials.testMode) {
    return false;
  }
  const merchantId = credentials.merchantId.trim();
  const key = credentials.merchantKey.toLowerCase();
  const salt = credentials.merchantSalt.toLowerCase();
  if (
    !merchantId ||
    merchantId === "000000" ||
    key.includes("sandbox") ||
    salt.includes("sandbox")
  ) {
    return false;
  }
  return true;
}

export function juniorPaytrLiveSaleOpen(env: NodeJS.ProcessEnv = process.env): boolean {
  return juniorPaytrCredentialsAllowSale({
    credentials: getPaytrCheckoutCredentials(),
    productionLocked: isJuniorCheckoutLocked(env),
    runtimeMode: readPaytrRuntimeMode(env),
  });
}

export type JuniorPaytrSaleGate = "closed" | "sandbox" | "live" | "refused";

function paytrCredentialsFromEnv(env: NodeJS.ProcessEnv): PaytrCheckoutCredentials | null {
  const merchantId = env.PAYTR_MERCHANT_ID?.trim() ?? "";
  const merchantKey = env.PAYTR_MERCHANT_KEY?.trim() ?? "";
  const merchantSalt = env.PAYTR_MERCHANT_SALT?.trim() ?? "";
  if (!merchantId || !merchantKey || !merchantSalt) {
    return null;
  }
  return {
    merchantId,
    merchantKey,
    merchantSalt,
    testMode: isPaytrSandboxEnabled(env),
  };
}

/**
 * Kasa kapısı. Bayrak veya mühür yoksa `closed`.
 * Üretimde deneme mağaza `refused` kalır. Üretim dışında sandbox, get-token iframe açar.
 * Canlı üçlü `live` döner. Kart numarası bu kapıdan geçmez.
 */
export function juniorPaytrSaleGate(env: NodeJS.ProcessEnv = process.env): JuniorPaytrSaleGate {
  if (isJuniorCheckoutLocked(env) || !isJuniorNoticeUsable(JUNIOR_GUARDIAN_NOTICE)) {
    return "closed";
  }
  const mode = readPaytrRuntimeMode(env);
  const credentials = paytrCredentialsFromEnv(env);
  if (mode === "live") {
    return juniorPaytrCredentialsAllowSale({
      credentials,
      productionLocked: false,
      runtimeMode: "live",
    })
      ? "live"
      : "refused";
  }
  if (mode === "sandbox" && env.NODE_ENV !== "production" && credentials) {
    return juniorPaytrCredentialsAllowSale({
      credentials: { ...credentials, testMode: false },
      productionLocked: false,
      runtimeMode: "live",
    })
      ? "sandbox"
      : "refused";
  }
  return "refused";
}

export const JUNIOR_PAYTR_BASKET_NAME = "Junior yıllık paket";

export type JuniorPaytrSeal = {
  merchantOid: string;
  userBasket: string;
  paymentAmount: string;
  iframeToken: string;
  iframeUrl: string;
  testMode: boolean;
  email: string;
  userIp: string;
  userName: string;
};

/** PayTR merchant_oid: yalnız harf ve rakam, en fazla 64. */
export function juniorPaytrMerchantOid(now: Date, idempotencyKey: string): string {
  const stamp = now.getTime().toString(36).toUpperCase();
  const suffix = idempotencyKey.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 16);
  return `JR${stamp}${suffix}`.replace(/[^A-Z0-9]/g, "").slice(0, 64);
}

/**
 * iFrame get-token. Hash sırası kernel `buildPaytrTokenHash` içindedir.
 * Direct kart yolu yoktur. Kimlik bilgisi çağırandan gelir; deneme üçlüsü gömülü değildir.
 */
export function buildJuniorPaytrSeal(input: {
  now: Date;
  idempotencyKey: string;
  email: string;
  userIp: string;
  userName: string;
  amountMinor: number;
  credentials: PaytrCheckoutCredentials;
}): JuniorPaytrSeal {
  const credentials = input.credentials;
  const merchantOid = juniorPaytrMerchantOid(input.now, input.idempotencyKey);
  const amountMinor = Math.trunc(input.amountMinor);
  const userBasket = encodePaytrSingleBasket(JUNIOR_PAYTR_BASKET_NAME, amountMinor, 1);
  const paymentAmount = String(amountMinor);
  const testMode = credentials.testMode ? "1" : "0";
  const iframeToken = buildPaytrTokenHash({
    credentials,
    userIp: input.userIp,
    merchantOid,
    email: input.email,
    paymentAmount,
    userBasket,
    noInstallment: PAYTR_IFRAME_NO_INSTALLMENT,
    maxInstallment: PAYTR_IFRAME_MAX_INSTALLMENT,
    currency: "TL",
    testMode,
  });
  const iframePathToken = iframeToken.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  return {
    merchantOid,
    userBasket,
    paymentAmount,
    iframeToken,
    iframeUrl: buildPaytrIframeUrl(iframePathToken),
    testMode: credentials.testMode,
    email: input.email,
    userIp: input.userIp,
    userName: input.userName.trim(),
  };
}
