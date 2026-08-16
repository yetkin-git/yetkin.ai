import "server-only";

import { isSupabaseUserId } from "@/lib/kernel/auth/ids";
import { getPrisma } from "@/lib/kernel/db";
import { WALLET_LEDGER_TAKE } from "@/lib/kernel/ledger/display";
import type { WalletLedgerRow, WalletSnapshot } from "@/lib/kernel/ledger/types";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { parseCurrencyCode, SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";

export type WalletBoard = {
  wallet: WalletSnapshot | null;
  entries: WalletLedgerRow[];
  hasMore: boolean;
};

/**
 * Oturum sahibinin TRY cüzdanı ve append-only defteri.
 * userId oturumdan gelmelidir; sorgu başka kullanıcı satırı çekmez.
 * DATABASE_URL yoksa veya Prisma patlarsa null — sahte satır yok.
 */
export async function loadWalletBoard(userId: string): Promise<WalletBoard | null> {
  if (!isSupabaseUserId(userId) || !process.env.DATABASE_URL?.trim()) {
    return null;
  }

  try {
    const prisma = getPrisma();
    const [walletRow, rows] = await Promise.all([
      prisma.wallet.findUnique({
        where: {
          userId_currencyCode: { userId, currencyCode: SETTLEMENT_CURRENCY },
        },
      }),
      prisma.ledgerEntry.findMany({
        where: { userId, currencyCode: SETTLEMENT_CURRENCY },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: WALLET_LEDGER_TAKE + 1,
        select: {
          id: true,
          amountMinor: true,
          currencyCode: true,
          direction: true,
          label: true,
          purpose: true,
          createdAt: true,
        },
      }),
    ]);

    const hasMore = rows.length > WALLET_LEDGER_TAKE;
    const sliced = hasMore ? rows.slice(0, WALLET_LEDGER_TAKE) : rows;
    const wallet: WalletSnapshot | null = walletRow
      ? {
          id: walletRow.id,
          userId: walletRow.userId,
          currencyCode: parseCurrencyCode(walletRow.currencyCode),
          amountMinor: toAmountMinor(walletRow.amountMinor),
        }
      : null;

    return {
      wallet,
      hasMore,
      entries: sliced.map((row) => ({
        id: row.id,
        amountMinor: toAmountMinor(row.amountMinor),
        currencyCode: parseCurrencyCode(row.currencyCode),
        direction: row.direction,
        label: row.label,
        purpose: row.purpose,
        createdAt: row.createdAt,
      })),
    };
  } catch {
    return null;
  }
}
