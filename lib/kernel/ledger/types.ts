import type { AmountMinor } from "@/lib/kernel/money/amount-minor";
import type { CurrencyCode } from "@/lib/kernel/money/currency";

export type LedgerDirection = "CREDIT" | "DEBIT";

export type LedgerEntryRecord = {
  id: string;
  walletId: string;
  userId: string;
  amountMinor: AmountMinor;
  currencyCode: CurrencyCode;
  direction: LedgerDirection;
  label: string;
  purpose: string;
  idempotencyKey: string;
  createdAt: Date;
};

/** Vatandaş defter satırı — yazma anahtarı ve cüzdan id'si yüzeye çıkmaz. */
export type WalletLedgerRow = Pick<
  LedgerEntryRecord,
  "id" | "amountMinor" | "currencyCode" | "direction" | "label" | "purpose" | "createdAt"
>;

export type WalletSnapshot = {
  id: string;
  userId: string;
  currencyCode: CurrencyCode;
  amountMinor: AmountMinor;
};

export type AppendLedgerCommand = {
  userId: string;
  currencyCode: CurrencyCode;
  amountMinor: AmountMinor;
  direction: LedgerDirection;
  label: string;
  purpose: string;
  idempotencyKey: string;
};

export type AppendLedgerResult = {
  applied: boolean;
  walletId: string;
  balanceMinor: AmountMinor;
};

export type LedgerStore = {
  lockWallet(userId: string, currencyCode: CurrencyCode): Promise<WalletSnapshot>;
  findByIdempotencyKey(idempotencyKey: string): Promise<LedgerEntryRecord | null>;
  insertEntry(
    wallet: WalletSnapshot,
    command: AppendLedgerCommand,
    nextBalance: AmountMinor,
  ): Promise<void>;
};
