import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import type {
  BeginCheckoutInput,
  BeginCheckoutResult,
  PaymentProvider,
  WebhookVerification,
} from "@/lib/kernel/payments/provider";
import {
  isPaytrProductionSafetyError,
  requestPaytrCheckoutToken,
} from "@/lib/kernel/payments/paytr/checkout";
import {
  isPaytrWebhookPayload,
  parsePaytrAmountMinor,
  verifyPaytrWebhookHash,
} from "@/lib/kernel/payments/paytr/webhook";

/**
 * PayTR somut adaptör — PaymentProvider portunun gün 0 tek uygulaması.
 */
export class PaytrPaymentProvider implements PaymentProvider {
  readonly id = "paytr" as const;

  async beginCheckout(input: BeginCheckoutInput): Promise<BeginCheckoutResult> {
    if (input.currencyCode !== "TRY") {
      return {
        ok: false,
        reason: "unsupported_currency",
        message: "PayTR adaptörü yalnızca TRY settlement kabul eder.",
      };
    }

    const result = await requestPaytrCheckoutToken({
      merchantOid: input.merchantOid,
      userIp: input.userIp,
      email: input.email,
      paymentAmountMinor: input.paymentAmountMinor,
      merchantOkUrl: input.merchantOkUrl,
      merchantFailUrl: input.merchantFailUrl,
      userBasket: input.userBasket.map((item) => ({
        name: item.name,
        amountMinor: item.amountMinor,
        quantity: item.quantity,
      })),
      userName: input.userName,
      userPhone: input.userPhone,
      userAddress: input.userAddress,
      currency: "TL",
    });

    return result;
  }

  verifyWebhook(payload: unknown): WebhookVerification {
    if (!isPaytrWebhookPayload(payload)) {
      return { ok: false, reason: "invalid_payload" };
    }
    try {
      if (!verifyPaytrWebhookHash(payload)) {
        return { ok: false, reason: "invalid_signature" };
      }
    } catch (error) {
      if (isPaytrProductionSafetyError(error)) {
        throw error;
      }
      return { ok: false, reason: "missing_credentials" };
    }
    const amountMinor = parsePaytrAmountMinor(payload.totalAmount);
    if (!amountMinor) {
      return { ok: false, reason: "invalid_payload" };
    }
    return {
      ok: true,
      merchantOid: payload.merchantOid,
      status: payload.status,
      amountMinor: toAmountMinor(amountMinor),
    };
  }
}

export const paytrPaymentProvider = new PaytrPaymentProvider();
