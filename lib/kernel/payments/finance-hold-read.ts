import "server-only";

import { getPrisma } from "@/lib/kernel/db";

/** REQUESTED satırların toplamı. Tablo yoksa profil çökmez; inceleme uyarısı 0 kalır. */
export async function readWalletFinanceHoldMinor(userId: string): Promise<number> {
  try {
    const prisma = getPrisma();
    const rows = await prisma.$queryRaw<{ amount_minor: number }[]>`
      SELECT COALESCE(SUM(amount_minor), 0)::int AS amount_minor
      FROM wallet_card_refunds
      WHERE user_id = ${userId}
        AND status = 'REQUESTED'
    `;
    return Number(rows[0]?.amount_minor ?? 0);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("wallet_card_refunds") && /42P01|does not exist|P2021/i.test(message)) {
      return 0;
    }
    throw error;
  }
}
