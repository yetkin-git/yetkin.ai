import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import {
  COMMERCE_TRIAL_OPTIMIZATION_LIMIT,
  COMMERCE_TRIAL_QUESTION_LIMIT,
} from "@/lib/commerce/subscription-lifecycle";

export type CommerceTrialQuotaKind = "question" | "optimization";

const LIMIT: Record<CommerceTrialQuotaKind, number> = {
  question: COMMERCE_TRIAL_QUESTION_LIMIT,
  optimization: COMMERCE_TRIAL_OPTIMIZATION_LIMIT,
};

/**
 * Deneme dışındaki lisanslar kotaya takılmaz.
 * TRIALING satırda sayaç limiti aşarsa çağrı reddedilir ve sayaç artmaz.
 */
export async function consumeCommerceTrialQuota(
  storeId: string,
  kind: CommerceTrialQuotaKind,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const prisma = getPrisma();
  const row = await prisma.commerceSubscription.findUnique({
    where: { storeId },
    select: { status: true },
  });
  if (!row || row.status !== "TRIALING") {
    return { ok: true };
  }
  const limit = LIMIT[kind];
  const updated =
    kind === "question"
      ? await prisma.commerceSubscription.updateMany({
          where: { storeId, status: "TRIALING", trialQuestionsUsed: { lt: limit } },
          data: { trialQuestionsUsed: { increment: 1 } },
        })
      : await prisma.commerceSubscription.updateMany({
          where: { storeId, status: "TRIALING", trialOptimizationsUsed: { lt: limit } },
          data: { trialOptimizationsUsed: { increment: 1 } },
        });
  if (updated.count === 1) {
    return { ok: true };
  }
  return {
    ok: false,
    error:
      kind === "question"
        ? "Deneme süresindeki AI müşteri sorusu kotası doldu."
        : "Deneme süresindeki ürün optimizasyon kotası doldu.",
  };
}
