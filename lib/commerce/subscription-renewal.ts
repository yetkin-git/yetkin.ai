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

/** 127.0.0.0/8 ve diğer loopback adresleri. PayTR hash'i bunlarla tutmaz. */
export function isLoopbackAddress(raw: string): boolean {
  const value = raw.trim().toLowerCase().replace(/^\[|\]$/g, "");
  if (value === "localhost" || value === "::1" || value === "0.0.0.0") {
    return true;
  }
  const host = value.startsWith("::ffff:") ? value.slice("::ffff:".length) : value;
  const parts = host.split(".");
  if (parts.length !== 4 || parts[0] !== "127") {
    return false;
  }
  return parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}

/** PayTR CAPI hash'i `user_ip` taşır. Yerel adres gönderirsek hash tutmaz. */
export function readOutboundPublicIp(
  env: NodeJS.ProcessEnv = process.env,
): { ok: true; ip: string } | { ok: false; reason: "missing" | "loopback" } {
  const raw = env.OUTBOUND_PUBLIC_IP?.trim() ?? "";
  if (!raw) {
    return { ok: false, reason: "missing" };
  }
  if (isLoopbackAddress(raw)) {
    return { ok: false, reason: "loopback" };
  }
  return { ok: true, ip: raw };
}

/**
 * Süresi dolan deneme ve ücretli lisansları tarar.
 *
 * P0.5 — **fail-closed**: `OUTBOUND_PUBLIC_IP` yoksa veya yerel adresse çekim
 * **hiç denenmez**. Satır `blocked_config` gerekçesiyle atlanır, abonelik
 * `PAST_DUE`'ya düşürülmez (deneme hakkı yanmaz), operatöre alarm basılır.
 * Eskiden burada `127.0.0.1` ile çekim deneniyor, üç denemede `CANCELED`
 * olunuyordu: ilk ayın sonunda tüm lisanslar sessizce ölüyordu.
 */
export async function runCommerceSubscriptionRenewalScan(now = new Date()): Promise<{
  scanned: number;
  charged: number;
  pastDue: number;
  canceled: number;
  blockedConfig: number;
}> {
  const prisma = getPrisma();
  const outbound = readOutboundPublicIp();
  if (!outbound.ok) {
    // Operatör alarmı: bu satır canlıda nöbetçi tarafından görülmelidir.
    console.error(
      JSON.stringify({
        level: "error",
        event: "commerce.subscription.renewal",
        reason: "blocked_config",
        detail:
          outbound.reason === "missing"
            ? "OUTBOUND_PUBLIC_IP tanımlı değil; yenileme çekimi yapılmadı."
            : "OUTBOUND_PUBLIC_IP yerel adres; yenileme çekimi yapılmadı.",
        action: "operator_attention",
      }),
    );
    logEvent({
      level: "error",
      event: "commerce.subscription.renewal",
      reason: "blocked_config",
      action: outbound.reason,
      applied: false,
    });
  }
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
  let blockedConfig = 0;
  for (const row of rows) {
    const view: CommerceRenewalRow = row;
    const step = decideCommerceRenewal(view, now);
    if (step.kind === "skip") {
      continue;
    }
    if (step.kind === "charge" && !outbound.ok) {
      // Çekim yolu kapalı: durum yazılmaz, deneme sayacı artmaz, satır iptal edilmez.
      blockedConfig += 1;
      logEvent({
        level: "error",
        event: "commerce.subscription.renewal",
        userId: row.ownerUserId,
        reason: "blocked_config",
        action: "charge_skipped",
        applied: false,
      });
      continue;
    }
    let chargeOk = false;
    if (step.kind === "charge" && outbound.ok) {
      const owner = await prisma.user.findUnique({ where: { id: row.ownerUserId }, select: { email: true } });
      const email = owner?.email?.trim() ?? "";
      if (email) {
        const outcome = await chargeStoredPaytrCard({
          merchantOid: renewalMerchantOid(row.storeId, now),
          email,
          userIp: outbound.ip,
          amountMinor: step.amountMinor,
          utoken: row.paytrUtoken,
          ctoken: row.paytrCtoken,
        });
        chargeOk = outcome.ok;
      } else {
        // Gerçek hesap e-postası yoksa çekim yapılmaz. Sahte alıcı adresine fatura gitmez.
        logEvent({
          level: "warn",
          event: "commerce.subscription.renewal",
          userId: row.ownerUserId,
          reason: "owner_email_missing",
          applied: false,
        });
      }
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
  return { scanned: rows.length, charged, pastDue, canceled, blockedConfig };
}
