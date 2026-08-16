import { toAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY, type CurrencyCode } from "@/lib/kernel/money/currency";

export type WalletStripSnapshot = {
  live: boolean;
  amountMinor: AmountMinor;
  currencyCode: CurrencyCode;
};

export const EMPTY_WALLET_STRIP: WalletStripSnapshot = {
  live: false,
  amountMinor: toAmountMinor(0),
  currencyCode: SETTLEMENT_CURRENCY,
};
