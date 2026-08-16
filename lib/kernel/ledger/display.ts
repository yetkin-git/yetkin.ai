import type { LedgerDirection } from "@/lib/kernel/ledger/types";

/** Cüzdan dökümü üst sınırı — sayfalama yok; sessiz kesmeyi UI dürüstçe söyler. */
export const WALLET_LEDGER_TAKE = 50;

export function ledgerDirectionLabel(direction: LedgerDirection): "Giriş" | "Harcama" {
  return direction === "CREDIT" ? "Giriş" : "Harcama";
}

/** DEBIT banka çekimi değildir; işaret yalnız görüntü içindir. */
export function ledgerSignedMinor(direction: LedgerDirection, amountMinor: number): number {
  const abs = Math.abs(amountMinor);
  return direction === "DEBIT" ? -abs : abs;
}
