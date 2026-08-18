import { EMPTY_WALLET_STRIP, type WalletStripSnapshot } from "@/lib/dashboard/wallet-strip";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { isCurrencyCode, SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";

export async function fetchWalletStripClient(): Promise<WalletStripSnapshot> {
  const response = await fetch("/api/dashboard/wallet-strip");
  const body = (await response.json()) as {
    ok?: boolean;
    strip?: { live?: boolean; amountMinor?: number; currencyCode?: string };
  };
  if (!body.ok || !body.strip || typeof body.strip.amountMinor !== "number") {
    return EMPTY_WALLET_STRIP;
  }
  try {
    return {
      live: Boolean(body.strip.live),
      amountMinor: toAmountMinor(Math.trunc(body.strip.amountMinor)),
      currencyCode:
        body.strip.currencyCode && isCurrencyCode(body.strip.currencyCode)
          ? body.strip.currencyCode
          : SETTLEMENT_CURRENCY,
    };
  } catch {
    return EMPTY_WALLET_STRIP;
  }
}
