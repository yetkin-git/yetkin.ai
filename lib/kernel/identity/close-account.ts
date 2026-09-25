import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { ConflictError } from "@/lib/kernel/http/errors";
import { readSettlementWallet } from "@/lib/kernel/ledger/wallet-read";
import {
  ACCOUNT_CLOSE_REFUND_OPEN,
  anonymizedCitizenEmail,
  assertAccountCloseable,
} from "@/lib/kernel/identity/close-account-gate";
import { logEvent } from "@/lib/kernel/observability/log";

export {
  ACCOUNT_CLOSE_BALANCE_BLOCK,
  ACCOUNT_CLOSE_CONFIRM,
  ACCOUNT_CLOSE_REFUND_OPEN,
  anonymizedCitizenEmail,
  assertAccountCloseable,
} from "@/lib/kernel/identity/close-account-gate";

/**
 * Bakiye ₺0 ise public.users anonimleşir, fatura künyesi silinir, auth.users kalkar.
 * Defter satırı Restrict olduğu için users satırı durur; e-posta ve ad gider.
 */
export async function closeCitizenAccount(userId: string): Promise<{ closed: true }> {
  const wallet = await readSettlementWallet(userId);
  assertAccountCloseable(wallet?.amountMinor ?? 0);

  const prisma = getPrisma();
  const openRefunds = await prisma.$queryRaw<{ n: number }[]>`
    SELECT COUNT(*)::int AS n
    FROM wallet_card_refunds
    WHERE user_id = ${userId}
      AND status IN ('PENDING', 'ACCEPTED')
  `;
  if (Number(openRefunds[0]?.n ?? 0) > 0) {
    throw new ConflictError(ACCOUNT_CLOSE_REFUND_OPEN);
  }

  const email = anonymizedCitizenEmail(userId);
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      DELETE FROM user_billing_info WHERE user_id = ${userId}
    `;
    await tx.$executeRaw`
      UPDATE users
      SET email = ${email},
          display_name = NULL,
          updated_at = NOW()
      WHERE id = ${userId}
    `;
  });

  try {
    await prisma.$executeRaw`DELETE FROM auth.sessions WHERE user_id = ${userId}::uuid`;
  } catch (error) {
    logEvent({
      level: "warn",
      event: "auth.account_close",
      reason: "sessions_skip",
      errorName: error instanceof Error ? error.name : "sessions",
    });
  }
  try {
    await prisma.$executeRaw`DELETE FROM auth.identities WHERE user_id = ${userId}::uuid`;
  } catch (error) {
    logEvent({
      level: "warn",
      event: "auth.account_close",
      reason: "identities_skip",
      errorName: error instanceof Error ? error.name : "identities",
    });
  }
  try {
    await prisma.$executeRaw`DELETE FROM auth.users WHERE id = ${userId}::uuid`;
  } catch (error) {
    logEvent({
      level: "error",
      event: "auth.account_close",
      reason: "auth_delete_failed",
      errorName: error instanceof Error ? error.name : "auth_users",
    });
    throw error;
  }

  logEvent({
    level: "info",
    event: "auth.account_close",
    reason: "closed",
    action: userId,
  });
  return { closed: true };
}
