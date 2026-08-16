import type { AmountMinor } from "@/lib/kernel/money/amount-minor";
import type { CurrencyCode } from "@/lib/kernel/money/currency";

export type PaymentProviderId = "paytr";

export type CheckoutBasketItem = {
  name: string;
  amountMinor: AmountMinor;
  quantity: number;
};

export type BeginCheckoutInput = {
  merchantOid: string;
  userIp: string;
  email: string;
  paymentAmountMinor: number;
  currencyCode: CurrencyCode;
  merchantOkUrl: string;
  merchantFailUrl: string;
  userBasket: CheckoutBasketItem[];
  userName?: string;
  userPhone?: string;
  userAddress?: string;
};

export type BeginCheckoutResult =
  | {
      ok: true;
      token: string;
      iframeUrl: string;
      merchantOid: string;
      sandboxMode: boolean;
      mockCheckout?: boolean;
    }
  | {
      ok: false;
      reason: "missing_credentials" | "invalid_amount" | "unsupported_currency" | "pay_api_error";
      message: string;
    };

export type WebhookVerification =
  | { ok: true; merchantOid: string; status: string; amountMinor: AmountMinor }
  | { ok: false; reason: "invalid_signature" | "invalid_payload" | "missing_credentials" };

/**
 * PSP portu — gün 0 somut adaptör PayTR (S6-A).
 * İkinci sağlayıcı ancak gerçek adaptör + ayrı merchantOid evreni ile gelir.
 */
export type PaymentProvider = {
  readonly id: PaymentProviderId;
  beginCheckout(input: BeginCheckoutInput): Promise<BeginCheckoutResult>;
  verifyWebhook(payload: unknown): WebhookVerification;
};
