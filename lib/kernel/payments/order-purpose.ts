/**
 * Ödeme siparişinin ticari niyeti.
 * `purpose` dizgisi ürün kancasında durur. Bu kod iade ve defter kuralının kapısıdır.
 * Eski satırlar legacy dizgiyle sınıflanır; yeni satırlar `order_purpose` enum'unu da taşır.
 */
export const PAYMENT_ORDER_PURPOSE = {
  WALLET_TOPUP: "WALLET_TOPUP",
  TEZGAH_PRO: "TEZGAH_PRO",
  TEZGAH_CREDIT: "TEZGAH_CREDIT",
  COMMERCE_LICENSE: "COMMERCE_LICENSE",
} as const;

export type PaymentOrderPurpose =
  (typeof PAYMENT_ORDER_PURPOSE)[keyof typeof PAYMENT_ORDER_PURPOSE];

const LEGACY_PURPOSE: Record<string, PaymentOrderPurpose> = {
  "wallet-top-up": PAYMENT_ORDER_PURPOSE.WALLET_TOPUP,
  "tezgah-license:pro": PAYMENT_ORDER_PURPOSE.TEZGAH_PRO,
  "tezgah-credit:pack": PAYMENT_ORDER_PURPOSE.TEZGAH_CREDIT,
  "commerce-license:monthly": PAYMENT_ORDER_PURPOSE.COMMERCE_LICENSE,
};

export function classifyPaymentOrderPurpose(
  purpose: string | null | undefined,
): PaymentOrderPurpose | null {
  if (!purpose) {
    return null;
  }
  if (
    purpose === PAYMENT_ORDER_PURPOSE.WALLET_TOPUP ||
    purpose === PAYMENT_ORDER_PURPOSE.TEZGAH_PRO ||
    purpose === PAYMENT_ORDER_PURPOSE.TEZGAH_CREDIT ||
    purpose === PAYMENT_ORDER_PURPOSE.COMMERCE_LICENSE
  ) {
    return purpose;
  }
  return LEGACY_PURPOSE[purpose] ?? null;
}

/** Aktif ürün bedeli self-servis karta dönmez. */
export function isActivatedProductRefundBlocked(purpose: string | null | undefined): boolean {
  const kind = classifyPaymentOrderPurpose(purpose);
  return kind === PAYMENT_ORDER_PURPOSE.TEZGAH_PRO || kind === PAYMENT_ORDER_PURPOSE.COMMERCE_LICENSE;
}

export function isWalletTopUpPurpose(purpose: string | null | undefined): boolean {
  return classifyPaymentOrderPurpose(purpose) === PAYMENT_ORDER_PURPOSE.WALLET_TOPUP;
}

export function isTezgahCreditOrderPurpose(purpose: string | null | undefined): boolean {
  return classifyPaymentOrderPurpose(purpose) === PAYMENT_ORDER_PURPOSE.TEZGAH_CREDIT;
}
