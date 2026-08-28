import { SETTLEMENT_CURRENCY, type CurrencyCode } from "@/lib/kernel/money/currency";
import { logEvent } from "@/lib/kernel/observability/log";

/**
 * Lisanslı pazaryeri (split payment) portu.
 *
 * Rail ödeme kuruluşu değildir. Usta neti Rail cüzdanına CREDIT yazılmaz,
 * IBAN çekimi açılmaz. Para lisanslı kuruluşta (PayTR / iyzico Pazaryeri)
 * bloke kalır; iş bitince komisyon platforma, ana para usta IBAN'ına
 * kuruluş tarafından dağılır.
 */

export const MARKETPLACE_SPLIT_PROVIDER_IDS = ["split"] as const;

export type MarketplaceSplitProviderId = (typeof MARKETPLACE_SPLIT_PROVIDER_IDS)[number];

export const DEFAULT_MARKETPLACE_SPLIT_PROVIDER: MarketplaceSplitProviderId = "split";

export type MarketplaceSplitLegRole = "platform" | "artisan";

export type MarketplaceSplitLeg = {
  role: MarketplaceSplitLegRole;
  userId: string;
  amountMinor: number;
};

export type MarketplaceSplitIntent = {
  providerId: MarketplaceSplitProviderId;
  referenceKey: string;
  currencyCode: CurrencyCode;
  status: "recorded_pending_psp";
  legs: readonly MarketplaceSplitLeg[];
};

export type MarketplaceSplitSettleResult =
  | { ok: true; pspSettlementId: string }
  | { ok: false; reason: "not_configured" };

export type MarketplaceHoldCommand = {
  buyerUserId: string;
  artisanUserId?: string;
  referenceKey: string;
  grossMinor: number;
  holdBps: number;
  currencyCode: CurrencyCode;
};

export type MarketplaceHoldResult =
  | { ok: true; pspPaymentId: string }
  | { ok: false; reason: "not_configured" };

export const MARKETPLACE_PAYMENT_NOT_CONFIGURED_ERROR =
  "Ödeme henüz bağlanmadı";

export type MarketplaceSplitPort = {
  readonly id: MarketplaceSplitProviderId;
  beginHold(command: MarketplaceHoldCommand): Promise<MarketplaceHoldResult>;
  settle(intent: MarketplaceSplitIntent): Promise<MarketplaceSplitSettleResult>;
};

/**
 * PayTR Pazaryeri gün 0 adaptörü — mağaza/alt satıcı onboard edilmeden
 * gerçek dağıtım çağrılmaz. beginHold ve settle dürüst `not_configured`
 * döner; üçüncü kişi fonu Rail cüzdanına girmez.
 */
export const paytrMarketplaceSplitPort: MarketplaceSplitPort = {
  id: "split",
  async beginHold() {
    return { ok: false, reason: "not_configured" };
  },
  async settle() {
    return { ok: false, reason: "not_configured" };
  },
};

export function buildMarketplaceSplitIntent(input: {
  referenceKey: string;
  legs: readonly MarketplaceSplitLeg[];
  providerId?: MarketplaceSplitProviderId;
  currencyCode?: CurrencyCode;
}): MarketplaceSplitIntent {
  return {
    providerId: input.providerId ?? DEFAULT_MARKETPLACE_SPLIT_PROVIDER,
    referenceKey: input.referenceKey,
    currencyCode: input.currencyCode ?? SETTLEMENT_CURRENCY,
    status: "recorded_pending_psp",
    legs: input.legs,
  };
}

export async function settleMarketplaceSplit(
  intent: MarketplaceSplitIntent,
  port: MarketplaceSplitPort = paytrMarketplaceSplitPort,
): Promise<MarketplaceSplitSettleResult> {
  const result = await port.settle(intent);
  logEvent({
    level: result.ok ? "info" : "warn",
    event: "marketplace_split.recorded",
    action: "settle",
    reason: result.ok ? "psp_accepted" : result.reason,
    amountMinor: intent.legs.reduce((sum, leg) => sum + leg.amountMinor, 0),
    applied: result.ok,
  });
  return result;
}
