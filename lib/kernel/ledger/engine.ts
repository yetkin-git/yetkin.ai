import {
  addAmountMinor,
  subtractAmountMinor,
  toAmountMinor,
  toPositiveAmountMinor,
  type AmountMinor,
} from "@/lib/kernel/money/amount-minor";
import { assertSameCurrency } from "@/lib/kernel/money/currency";
import type {
  AppendLedgerCommand,
  AppendLedgerResult,
  LedgerStore,
  WalletSnapshot,
} from "@/lib/kernel/ledger/types";

/** CREDIT ekler, DEBIT düşer. Negatif bakiye yasak. */
export function applyLedgerDelta(
  balanceMinor: AmountMinor,
  command: Pick<AppendLedgerCommand, "direction" | "amountMinor">,
): AmountMinor {
  const delta = toPositiveAmountMinor(command.amountMinor);
  if (command.direction === "CREDIT") {
    return addAmountMinor(balanceMinor, delta);
  }
  return subtractAmountMinor(balanceMinor, delta);
}

export function assertWalletCurrency(
  wallet: WalletSnapshot,
  currencyCode: AppendLedgerCommand["currencyCode"],
): void {
  assertSameCurrency(wallet.currencyCode, currencyCode);
}

/**
 * Append-only defter. Aynı idempotencyKey ikinci kez bakiyeyi değiştirmez.
 * Store satır kilidini (FOR UPDATE) sağlamakla yükümlüdür.
 */
export async function appendLedgerEntry(
  store: LedgerStore,
  command: AppendLedgerCommand,
): Promise<AppendLedgerResult> {
  toPositiveAmountMinor(command.amountMinor);
  if (!command.idempotencyKey.trim()) {
    throw new Error("idempotencyKey zorunludur.");
  }

  const existing = await store.findByIdempotencyKey(command.idempotencyKey);
  const wallet = await store.lockWallet(command.userId, command.currencyCode);
  assertWalletCurrency(wallet, command.currencyCode);

  if (existing) {
    return {
      applied: false,
      walletId: wallet.id,
      balanceMinor: toAmountMinor(wallet.amountMinor),
    };
  }

  const nextBalance = applyLedgerDelta(toAmountMinor(wallet.amountMinor), command);
  await store.insertEntry(wallet, command, nextBalance);

  return {
    applied: true,
    walletId: wallet.id,
    balanceMinor: nextBalance,
  };
}
