import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { logEvent } from "@/lib/kernel/observability/log";
import type { PaymentOrderSnapshot } from "@/lib/kernel/payments/clearing";
import {
  CLAIM_TOKEN_TTL_MS,
  createClaimToken,
  tezgahGuestMerchantOid,
} from "@/lib/tezgah/guest-checkout";

/**
 * Faz 3 / §4.1 — misafir siparişin **hesap sahiplenmesi**.
 *
 * İki yarı:
 *
 * **A. Token üretimi** (`issueClaimTokenForClearedGuestOrder`) — PayTR CLEARED
 * webhook'unda `userId === null` ise çağrılır. Tek kullanımlık, 14 gün ömürlü
 * `claimToken` yazar. E-posta gönderimi burada yapılmaz (kernel SMTP'ye bağlı
 * değildir); webhook çağıranı `deliverClaimMail` ile postalar.
 *
 * **B. Token tüketimi** (`redeemClaimOrder`) — `/api/auth/claim-order` çağırır.
 * Sıra **değişmez** (para → hesap → defter → abonelik):
 * 1. Token doğrulanır (tek kullanım, süre).
 * 2. Supabase Auth hesabı açılır (`signUp`; kullanıcının belirlediği şifre).
 * 3. `payment_orders.userId` ve `claimed_at` yazılır.
 * 4. Defter CREDIT'i **şimdi** yazılır (`wallet-top-up:{merchantOid}`). Bu anahtar
 *    webhook'ta yazılmadığı için çift CREDIT doğmaz; defter mutabakat invariantı
 *    (CLEARED sipariş ↔ `wallet-top-up:{merchantOid}`) bu adımla kapanır.
 * 5. Tezgâh Pro aboneliği açılır ve `guest_billing_json` → `user_billing_info`.
 * 6. Token tek kullanımlık işaretlenir.
 *
 * Başarısızlık davranışı: 2. adım düşerse token **yanmaz** (kullanıcı yeniden dener).
 * 4. adım düşerse hesap açılmış olur; token `usedAt` yazılmaz ve operatör
 * `tezgah.guest.claim_ledger_failed` alarmı görür — para kaybolmaz, tekrar denenir.
 */

export const CLAIM_TOKEN_ALREADY_USED =
  "Bu bağlantı kullanıldı. Giriş yapıp Tezgâh'a geç." as const;
export const CLAIM_TOKEN_EXPIRED =
  "Bu bağlantının süresi doldu. Aynı e-postayla giriş yapıp satın alımını açabilirsin." as const;
export const CLAIM_TOKEN_UNKNOWN = "Bu bağlantı geçerli değil." as const;
export const CLAIM_ORDER_NOT_CLEARED =
  "Ödeme henüz onaylanmadı. Birkaç dakika sonra bağlantıyı yeniden aç." as const;

export type GuestClaimOrder = {
  id: string;
  merchantOid: string;
  guestEmail: string | null;
  amountMinor: number;
  currencyCode: string;
  purpose: string;
  status: string;
  userId: string | null;
  guestBillingJson: string | null;
  claimTokenExpiresAt: Date | null;
  claimTokenUsedAt: Date | null;
};

export type IssueClaimResult =
  | { ok: true; token: string; email: string; expiresAt: Date }
  | { ok: false; reason: "not_guest" | "not_cleared" | "no_email" | "write_failed" | "already_issued" };

/**
 * A. CLEARED misafir sipariş için token üret.
 *
 * Idempotent: token zaten varsa ve süresi dolmamışsa aynı token döner (webhook
 * tekrarında ikinci e-posta basılmaz — `already_issued`).
 */
export async function issueClaimTokenForClearedGuestOrder(
  order: PaymentOrderSnapshot,
  now: Date = new Date(),
): Promise<IssueClaimResult> {
  if (order.userId !== null) {
    return { ok: false, reason: "not_guest" };
  }
  if (order.status !== "CLEARED") {
    return { ok: false, reason: "not_cleared" };
  }
  const prisma = getPrisma();
  let row = await prisma.paymentOrder.findUnique({
    where: { merchantOid: order.merchantOid },
    select: {
      id: true,
      guestEmail: true,
      claimToken: true,
      claimTokenExpiresAt: true,
      claimTokenUsedAt: true,
    },
  });
  if (!row) {
    return { ok: false, reason: "write_failed" };
  }
  const email = row.guestEmail?.trim().toLowerCase() ?? "";
  if (!email) {
    return { ok: false, reason: "no_email" };
  }
  if (
    row.claimToken &&
    row.claimTokenExpiresAt &&
    row.claimTokenExpiresAt.getTime() > now.getTime() &&
    !row.claimTokenUsedAt
  ) {
    return { ok: false, reason: "already_issued" };
  }
  const token = createClaimToken();
  const expiresAt = new Date(now.getTime() + CLAIM_TOKEN_TTL_MS);
  try {
    row = await prisma.paymentOrder.update({
      where: { merchantOid: order.merchantOid },
      data: { claimToken: token, claimTokenExpiresAt: expiresAt },
      select: {
        id: true,
        guestEmail: true,
        claimToken: true,
        claimTokenExpiresAt: true,
        claimTokenUsedAt: true,
      },
    });
  } catch {
    return { ok: false, reason: "write_failed" };
  }
  logEvent({
    level: "info",
    event: "tezgah.guest.claim_issued",
    merchantOid: order.merchantOid,
    orderId: order.id,
    amountMinor: order.amountMinor,
    purpose: order.purpose,
    applied: true,
  });
  return {
    ok: true,
    token: row.claimToken ?? token,
    email,
    expiresAt: row.claimTokenExpiresAt ?? expiresAt,
  };
}

export type ClaimLookup =
  | { ok: true; order: GuestClaimOrder }
  | { ok: false; reason: "unknown" | "used" | "expired" | "not_cleared" | "claimed"; message: string };

/** `/claim/[token]` sayfası ve redeem rotası aynı kapıyı okur. */
export async function loadClaimOrder(
  token: string,
  now: Date = new Date(),
): Promise<ClaimLookup> {
  const clean = token.trim();
  if (!clean || clean.length < 20 || clean.length > 64) {
    return { ok: false, reason: "unknown", message: CLAIM_TOKEN_UNKNOWN };
  }
  const prisma = getPrisma();
  let row: GuestClaimOrder | null = null;
  try {
    row = await prisma.paymentOrder.findUnique({
      where: { claimToken: clean },
      select: {
        id: true,
        merchantOid: true,
        guestEmail: true,
        amountMinor: true,
        currencyCode: true,
        purpose: true,
        status: true,
        userId: true,
        guestBillingJson: true,
        claimTokenExpiresAt: true,
        claimTokenUsedAt: true,
      },
    });
  } catch {
    row = null;
  }
  if (!row) {
    return { ok: false, reason: "unknown", message: CLAIM_TOKEN_UNKNOWN };
  }
  if (row.userId !== null || row.claimTokenUsedAt) {
    return { ok: false, reason: "used", message: CLAIM_TOKEN_ALREADY_USED };
  }
  if (!row.claimTokenExpiresAt || row.claimTokenExpiresAt.getTime() <= now.getTime()) {
    return { ok: false, reason: "expired", message: CLAIM_TOKEN_EXPIRED };
  }
  if (row.status !== "CLEARED") {
    return { ok: false, reason: "not_cleared", message: CLAIM_ORDER_NOT_CLEARED };
  }
  return { ok: true, order: row };
}

/** `tezgahGuestMerchantOid` — e-posta + anahtar. Ops ve test için dışa açılır. */
export { tezgahGuestMerchantOid };

/** Claim token biçimi: base64url 43 karakter (32 bayt). Kaba kuvvet yüzeyini daraltır. */
export function isClaimTokenShaped(raw: string): boolean {
  return /^[A-Za-z0-9_-]{43}$/u.test(raw.trim());
}

/** Tek kullanımlık token üreticisi ve ömrü — claim yüzeyinin tek okuma noktası. */
export { CLAIM_TOKEN_TTL_MS, createClaimToken } from "@/lib/tezgah/guest-checkout";
