import { EMPTY_WALLET_STRIP, type WalletStripSnapshot } from "@/lib/dashboard/wallet-strip";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { isCurrencyCode, SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

export async function fetchWalletStripClient(): Promise<WalletStripSnapshot> {
  try {
    const response = await fetch("/api/dashboard/wallet-strip", withRailApiVersion());
    const parsed = parseRailClientJson<{
      strip?: { live?: boolean; amountMinor?: number; currencyCode?: string };
    }>(await response.json());
    if (!parsed.ok || !parsed.data.strip || typeof parsed.data.strip.amountMinor !== "number") {
      return EMPTY_WALLET_STRIP;
    }
    return {
      live: Boolean(parsed.data.strip.live),
      amountMinor: toAmountMinor(Math.trunc(parsed.data.strip.amountMinor)),
      currencyCode:
        parsed.data.strip.currencyCode && isCurrencyCode(parsed.data.strip.currencyCode)
          ? parsed.data.strip.currencyCode
          : SETTLEMENT_CURRENCY,
    };
  } catch {
    return EMPTY_WALLET_STRIP;
  }
}
