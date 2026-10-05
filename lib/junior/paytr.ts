import "server-only";

import { createHmac } from "node:crypto";
import { JUNIOR_PRODUCTION_LOCKED } from "@/lib/kernel/compliance/circuit-breakers";
import {
  buildPaytrIframeUrl,
  buildPaytrTokenHash,
  encodePaytrSingleBasket,
  formatPaytrPaymentAmount,
  getPaytrCheckoutCredentials,
  PAYTR_IFRAME_MAX_INSTALLMENT,
  PAYTR_IFRAME_NO_INSTALLMENT,
  readPaytrRuntimeMode,
  type PaytrCheckoutCredentials,
  type PaytrRuntimeMode,
} from "@/lib/kernel/payments/paytr/checkout";
import { JUNIOR_YEARLY_LIST_PRICE_MINOR } from "@/lib/junior/limits";

/**
 * Kapalı pilot mühürü. Canlı mağaza anahtarı değildir.
 * iFrame get-token ve Direct API aynı siparişi bu üçlüyle dener.
 */
export const JUNIOR_PAYTR_TEST_CREDENTIALS: PaytrCheckoutCredentials = {
  merchantId: "000000",
  merchantKey: "junior-paytr-sandbox-key",
  merchantSalt: "junior-paytr-sandbox-salt",
  testMode: true,
};

/**
 * Canlı satış kapısı. Deneme mağaza numarası, deneme anahtarı ve sandbox satışı açmaz.
 * Üretim kilidi dururken canlı üçlü gelse de bu fonksiyon kapalı kalır.
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
  if (
    !merchantId ||
    merchantId === "000000" ||
    merchantId === JUNIOR_PAYTR_TEST_CREDENTIALS.merchantId ||
    credentials.merchantKey === JUNIOR_PAYTR_TEST_CREDENTIALS.merchantKey ||
    credentials.merchantSalt === JUNIOR_PAYTR_TEST_CREDENTIALS.merchantSalt
  ) {
    return false;
  }
  return true;
}

export function juniorPaytrLiveSaleOpen(env: NodeJS.ProcessEnv = process.env): boolean {
  return juniorPaytrCredentialsAllowSale({
    credentials: getPaytrCheckoutCredentials(),
    productionLocked: JUNIOR_PRODUCTION_LOCKED,
    runtimeMode: readPaytrRuntimeMode(env),
  });
}

export const JUNIOR_PAYTR_BASKET_NAME = "Junior yıllık paket";

export type JuniorPaytrSeal = {
  merchantOid: string;
  userBasket: string;
  paymentAmount: string;
  directAmount: string;
  iframeToken: string;
  directToken: string;
  iframeUrl: string;
  testMode: boolean;
  email: string;
  userIp: string;
  userName: string;
  userPhone: string;
  userAddress: string;
};

/** PayTR merchant_oid: yalnız harf ve rakam, en fazla 64. */
export function juniorPaytrMerchantOid(now: Date, last4: string): string {
  const stamp = now.getTime().toString(36).toUpperCase();
  return `JR${stamp}${last4}`.replace(/[^A-Z0-9]/g, "").slice(0, 64);
}

/**
 * Fatura ve sepet, PayTR test hash sırasına girer.
 * iFrame: merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket
 * + no_installment + max_installment + currency + test_mode, sonra tuz.
 * payment_amount kuruş tam sayı yazılır. Sepet birim fiyatı ondalık TL kalır.
 * Direct: aynı kimlik, tutar ondalık TL, payment_type card, taksit 0, non_3d 0.
 */
export function buildJuniorPaytrSeal(input: {
  now: Date;
  last4: string;
  email: string;
  userIp: string;
  userName: string;
  userPhone: string;
  userAddress: string;
  credentials?: PaytrCheckoutCredentials;
}): JuniorPaytrSeal {
  const credentials = input.credentials ?? JUNIOR_PAYTR_TEST_CREDENTIALS;
  const merchantOid = juniorPaytrMerchantOid(input.now, input.last4);
  const userBasket = encodePaytrSingleBasket(JUNIOR_PAYTR_BASKET_NAME, JUNIOR_YEARLY_LIST_PRICE_MINOR, 1);
  const paymentAmount = String(JUNIOR_YEARLY_LIST_PRICE_MINOR);
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
  const directAmount = formatPaytrPaymentAmount(JUNIOR_YEARLY_LIST_PRICE_MINOR);
  const directHashStr =
    `${credentials.merchantId}${input.userIp}${merchantOid}${input.email}` +
    `${directAmount}card0TL${testMode}0`;
  const directToken = createHmac("sha256", credentials.merchantKey)
    .update(directHashStr + credentials.merchantSalt)
    .digest("base64");
  const iframePathToken = iframeToken.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  return {
    merchantOid,
    userBasket,
    paymentAmount,
    directAmount,
    iframeToken,
    directToken,
    iframeUrl: buildPaytrIframeUrl(iframePathToken),
    testMode: credentials.testMode,
    email: input.email,
    userIp: input.userIp,
    userName: input.userName.trim(),
    userPhone: input.userPhone,
    userAddress: input.userAddress.trim(),
  };
}
