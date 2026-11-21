import "server-only";

import { createHash } from "node:crypto";
import { getPrisma } from "@/lib/kernel/db";
import { logEvent } from "@/lib/kernel/observability/log";
import { chargeStoredPaytrCard } from "@/lib/commerce/paytr-stored-card";
import {
  applyCommerceRenewalResult,
  decideCommerceRenewal,
  type CommerceRenewalRow,
} from "@/lib/commerce/subscription-lifecycle";

function renewalMerchantOid(storeId: string, now: Date): string {
  const digest = createHash("sha256")
    .update(`commerce-renew:${storeId}:${now.toISOString().slice(0, 10)}`)
    .digest("hex")
    .slice(0, 12)
    .toUpperCase();
  const compact = storeId.replace(/-/g, "").toLowerCase();
  return `RN${compact}${digest}`.slice(0, 64);
}

/**
 * Süresi dolan deneme ve ücretli lisansları tarar.
 * Kayıtlı kart varsa çekim dener; olmazsa PAST_DUE ve en fazla 3 deneme.
 */
export async function runCommerceSubscriptionRenewalScan(now = new Date()): Promise<{
  scanned: number;
  charged: number;
  pastDue: number;
  canceled: number;
}> {
  const prisma = getPrisma();
  const rows = await prisma.commerceSubscription.findMany({
    where: {
      status: { in: ["TRIALING", "ACTIVE", "PAST_DUE"] },
      OR: [
        { currentPeriodEnd: { lte: now } },
        { currentPeriodEnd: null, expiresAt: { lte: now } },
        { currentPeriodEnd: null, trialEndsAt: { lte: now } },
      ],
    },
    take: 100,
  });
  let charged = 0;
  let pastDue = 0;
  let canceled = 0;
  for (const row of rows) {
    const view: CommerceRenewalRow = row;
    const step = decideCommerceRenewal(view, now);
    if (step.kind === "skip") {
      continue;
    }
    let chargeOk = false;
    if (step.kind === "charge") {
      const owner = await prisma.user.findUnique({ where: { id: row.ownerUserId }, select: { email: true } });
      const outcome = await chargeStoredPaytrCard({
        merchantOid: renewalMerchantOid(row.storeId, now),
        email: owner?.email ?? "billing@yetkin.ai",
        userIp: "127.0.0.1",
        amountMinor: step.amountMinor,
        utoken: row.paytrUtoken,
        ctoken: row.paytrCtoken,
      });
      chargeOk = outcome.ok;
    }
    const patch = applyCommerceRenewalResult(view, step, chargeOk, now);
    if (!patch) {
      continue;
    }
    await prisma.commerceSubscription.update({
      where: { id: row.id },
      data: patch,
    });
    if (patch.status === "ACTIVE" && chargeOk) {
      charged += 1;
    } else if (patch.status === "CANCELED") {
      canceled += 1;
    } else if (patch.status === "PAST_DUE") {
      pastDue += 1;
    }
    logEvent({
      level: "info",
      event: "commerce.subscription.renewal",
      userId: row.ownerUserId,
      reason: patch.status,
      applied: chargeOk,
      amountMinor: row.listPriceMinor,
    });
  }
  return { scanned: rows.length, charged, pastDue, canceled };
}
