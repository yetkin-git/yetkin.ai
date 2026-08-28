import "server-only";

import { randomUUID } from "node:crypto";
import { getPrisma } from "@/lib/kernel/db";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { parseCurrencyCode, SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import type { WalletSnapshot } from "@/lib/kernel/ledger/types";

type WalletRow = {
  id: string;
  user_id: string;
  currency_code: string;
  amount_minor: number | string;
};

function toSnapshot(row: WalletRow): WalletSnapshot {
  return {
    id: row.id,
    userId: row.user_id,
    currencyCode: parseCurrencyCode(String(row.currency_code)),
    amountMinor: toAmountMinor(Number(row.amount_minor)),
  };
}

/**
 * Settlement cüzdanı — salt SELECT. Satır yoksa null.
 * Dashboard / wallet-strip okuma yolları yalnız bunu çağırır (INSERT yok).
 */
export async function readSettlementWallet(userId: string): Promise<WalletSnapshot | null> {
  const row = await selectSettlementWallet(userId);
  return row ? toSnapshot(row) : null;
}

async function selectSettlementWallet(userId: string): Promise<WalletRow | null> {
  const prisma = getPrisma();
  const rows = await prisma.$queryRaw<WalletRow[]>`
    SELECT id, user_id, currency_code, amount_minor
    FROM wallets
    WHERE user_id = ${userId} AND currency_code = ${SETTLEMENT_CURRENCY}
  `;
  return rows[0] ?? null;
}

/**
 * Settlement cüzdanı bootstrap — yazma yüzeyi.
 * Satır yoksa TRY 0 satırı basar (handle_new_user ile aynı ON CONFLICT).
 * Dashboard / pulse / wallet-strip bu yolu çağırmaz; o yollar `readSettlementWallet`.
 * Defter yazma kilidi değildir; o yol lockWallet SSOT durur.
 */
export async function ensureSettlementWallet(userId: string): Promise<WalletSnapshot> {
  const existing = await selectSettlementWallet(userId);
  if (existing) {
    return toSnapshot(existing);
  }

  const prisma = getPrisma();
  await prisma.$executeRaw`
    INSERT INTO wallets (id, user_id, currency_code, amount_minor, created_at, updated_at)
    VALUES (${randomUUID()}, ${userId}, ${SETTLEMENT_CURRENCY}, 0, NOW(), NOW())
    ON CONFLICT (user_id, currency_code) DO NOTHING
  `;

  const created = await selectSettlementWallet(userId);
  if (!created) {
    throw new Error("Cüzdan açılamadı.");
  }
  return toSnapshot(created);
}
