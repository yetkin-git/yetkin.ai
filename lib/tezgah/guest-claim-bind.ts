import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import {
  normalizeBillingInput,
  type CheckoutBillingFormState,
  type CheckoutBillingInfo,
} from "@/lib/kernel/identity/billing-info";
import { appendLedgerEntry } from "@/lib/kernel/ledger/engine";
import { createPrismaLedgerStore } from "@/lib/kernel/ledger/prisma-store";
import { toPositiveAmountMinor } from "@/lib/kernel/money/amount-minor";
import { ledgerCreditLineForOrder } from "@/lib/kernel/payments/order-purpose";
import { logEvent } from "@/lib/kernel/observability/log";
import {
  fulfillTezgahOrder,
  TEZGAH_PRO_ORDER_PURPOSE,
} from "@/lib/tezgah/paid-lane";

/**
 * Faz 3 / §4.1 — misafir siparişin hesaba bağlanması (adım 3–6).
 *
 * Hesap açma (Supabase `signUp`) **çağıranda** kalır: bu modül auth kimliğini
 * üretmez, yalnız açılmış kimliği ticari kayda bağlar. Böylece:
 * - Auth hesabı açılamazsa hiçbir satır değişmez (token yanmaz).
 * - Ticari bağlama tek bir yerde, test edilebilir biçimde durur.
 *
 * Sıra (değişmez): `userId` bağla → defter CREDIT → abonelik → fatura künyesi →
 * token'ı tek kullanımlık işaretle.
 */

export type BindGuestOrderInput = {
  merchantOid: string;
  claimToken: string;
  userId: string;
  now?: Date;
};

export type BindGuestOrderResult =
  | { ok: true; walletCredited: boolean; proActivated: boolean; amountMinor: number }
  | { ok: false; reason: "order_missing" | "already_bound" | "not_cleared" | "ledger_failed" };

function readBilling(json: string | null): CheckoutBillingInfo | null {
  if (!json?.trim()) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(json);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    const normalized = normalizeBillingInput(parsed as CheckoutBillingFormState);
    return normalized.ok ? normalized.billing : null;
  } catch {
    return null;
  }
}

export async function bindGuestOrderToUser(
  input: BindGuestOrderInput,
): Promise<BindGuestOrderResult> {
  const now = input.now ?? new Date();
  const prisma = getPrisma();
  const order = await prisma.paymentOrder.findUnique({
    where: { merchantOid: input.merchantOid },
    select: {
      id: true,
      merchantOid: true,
      userId: true,
      guestEmail: true,
      status: true,
      amountMinor: true,
      currencyCode: true,
      purpose: true,
      claimToken: true,
      guestBillingJson: true,
    },
  });
  if (!order) {
    return { ok: false, reason: "order_missing" };
  }
  if (order.claimToken !== input.claimToken) {
    return { ok: false, reason: "order_missing" };
  }
  if (order.userId !== null) {
    return { ok: false, reason: "already_bound" };
  }
  if (order.status !== "CLEARED" || order.currencyCode !== "TRY") {
    return { ok: false, reason: "not_cleared" };
  }

  // 3. Sahiplik bağlanır. CAS: yalnız `userId IS NULL` satırı güncellenir —
  // iki eşzamanlı claim ikinci kez bağlanamaz.
  const bound = await prisma.paymentOrder.updateMany({
    where: { id: order.id, userId: null },
    data: { userId: input.userId, updatedAt: now },
  });
  if (bound.count !== 1) {
    return { ok: false, reason: "already_bound" };
  }

  // 4. Defter CREDIT'i **şimdi** yazılır. Webhook CLEARED'da yazmadığı için
  // `wallet-top-up:{merchantOid}` anahtarı burada ilk kez kullanılır.
  // Ürün siparişi (hibe) kendi etiketiyle yazılır (Ş3 / B-03); `walletTopUpLedgerIdempotencyKey`
  // sabiti o satırlar için kullanılmaz, anahtar `ledgerCreditLineForOrder` üretir.
  let walletCredited = false;
  try {
    const line = ledgerCreditLineForOrder({ purpose: order.purpose, merchantOid: order.merchantOid });
    const appended = await appendLedgerEntry(createPrismaLedgerStore(), {
      userId: input.userId,
      currencyCode: "TRY",
      amountMinor: toPositiveAmountMinor(order.amountMinor),
      direction: "CREDIT",
      label: line.label,
      purpose: line.purpose,
      idempotencyKey: line.idempotencyKey,
    });
    walletCredited = appended.applied;
  } catch (error) {
    logEvent({
      level: "error",
      event: "tezgah.guest.claim_ledger_failed",
      userId: input.userId,
      merchantOid: order.merchantOid,
      orderId: order.id,
      amountMinor: order.amountMinor,
      reason: "ledger_write",
      applied: false,
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return { ok: false, reason: "ledger_failed" };
  }

  // 5. Tezgâh Pro aboneliği. `fulfillTezgahOrder` aynı defter anahtarını kullanır;
  // zaten yazıldığı için ikinci CREDIT doğmaz (idempotent).
  let proActivated = false;
  if (order.purpose === TEZGAH_PRO_ORDER_PURPOSE) {
    const fulfilled = await fulfillTezgahOrder({
      userId: input.userId,
      merchantOid: order.merchantOid,
      purpose: order.purpose,
      amountMinor: order.amountMinor,
      currencyCode: order.currencyCode,
      status: order.status,
      now,
    });
    proActivated = fulfilled.applied || fulfilled.reason === "already_settled";
    if (fulfilled.reason === "already_settled") {
      proActivated = true;
    } else if (fulfilled.applied) {
      proActivated = true;
    }
  }

  // 5b. Misafir fatura künyesi kalıcı profile dönüşür. Hata ölümcül değildir:
  // ödeme ve abonelik yazıldı; kullanıcı profilden künyeyi düzenleyebilir.
  const billing = readBilling(order.guestBillingJson);
  if (billing) {
    try {
      await prisma.userBillingInfo.upsert({
        where: { userId: input.userId },
        create: {
          userId: input.userId,
          invoiceType: billing.invoiceType === "corporate" ? "CORPORATE" : "INDIVIDUAL",
          fullName: billing.invoiceType === "individual" ? billing.fullName : null,
          tckn: billing.invoiceType === "individual" ? billing.tckn : null,
          companyTitle: billing.invoiceType === "corporate" ? billing.companyTitle : null,
          taxOffice: billing.invoiceType === "corporate" ? billing.taxOffice : null,
          vkn: billing.invoiceType === "corporate" ? billing.vkn : null,
          phone: billing.phone,
          address: billing.address,
          updatedAt: now,
        },
        update: {},
      });
    } catch {
      logEvent({
        level: "warn",
        event: "tezgah.guest.claim_billing_skipped",
        userId: input.userId,
        merchantOid: order.merchantOid,
        orderId: order.id,
        applied: true,
        reason: "billing_upsert",
      });
    }
  }

  // 6. Token tek kullanımlık işaretlenir. Gelecekteki deneme `usedAt` görür.
  await prisma.paymentOrder.updateMany({
    where: { id: order.id, claimTokenUsedAt: null },
    data: { claimTokenUsedAt: now, updatedAt: now },
  });

  logEvent({
    level: "info",
    event: "tezgah.guest.claimed",
    userId: input.userId,
    merchantOid: order.merchantOid,
    orderId: order.id,
    amountMinor: order.amountMinor,
    purpose: order.purpose,
    applied: true,
  });

  return {
    ok: true,
    walletCredited,
    proActivated,
    amountMinor: order.amountMinor,
  };
}
