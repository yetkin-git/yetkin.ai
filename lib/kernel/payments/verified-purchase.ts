import "server-only";

import { isSupabaseUserId } from "@/lib/kernel/auth/ids";
import { getPrisma } from "@/lib/kernel/db";
import { logEvent } from "@/lib/kernel/observability/log";

/**
 * Ödeme dönüşü doğrulaması — `/cuzdan?sonuc=ok&merchant_oid=…`.
 *
 * CRO/GA4 (P0): `sonuc=ok` bir **tarayıcı işaretidir**, kullanıcı elle de yazabilir.
 * GA4 `purchase` dönüşümü yalnız sunucuda **gerçekten kapanmış** bir ödeme emri
 * (`PaymentOrder.status` ∈ {PAID, CLEARED}) ve o emrin bu oturuma ait olması
 * hâlinde basılır. Aksi hâlde dönüşüm şişirilir ve reklam ROI'si yalan söyler.
 *
 * Okuma dar ve fail-safe: `merchant_oid` yoksa `null` döner; DB yoksa `null` döner;
 * sorgu patlarsa `null` döner (sahte satır üretilmez, dönüşüm basılmaz).
 */

export type VerifiedPurchase = {
  merchantOid: string;
  /** Ödeme emrinin ticari niyeti (`PaymentOrder.purpose`). */
  purpose: string;
  status: string;
  amountMinor: number;
  currencyCode: string;
};

/** PayTR `merchant_oid` biçimi: 10–64 karakter, alfanümerik. */
const MERCHANT_OID_RE = /^[A-Za-z0-9_-]{6,64}$/u;

export function isWellFormedMerchantOid(raw: string | null | undefined): boolean {
  return MERCHANT_OID_RE.test(raw?.trim() ?? "");
}

const SETTLED = new Set(["PAID", "CLEARED"]);

/**
 * Bu oturuma ait, kapanmış (`PAID`/`CLEARED`) bir ödeme emri var mı?
 * Başka kullanıcının emri asla dönmez (IDOR kilidi: `userId` her zaman oturumdan).
 */
export async function loadVerifiedPurchase(input: {
  userId: string;
  merchantOid: string | null | undefined;
}): Promise<VerifiedPurchase | null> {
  const merchantOid = input.merchantOid?.trim() ?? "";
  if (!isSupabaseUserId(input.userId) || !isWellFormedMerchantOid(merchantOid)) {
    return null;
  }
  if (!process.env.DATABASE_URL?.trim()) {
    return null;
  }
  try {
    const order = await getPrisma().paymentOrder.findUnique({
      where: { merchantOid },
      select: {
        userId: true,
        merchantOid: true,
        purpose: true,
        status: true,
        amountMinor: true,
        currencyCode: true,
      },
    });
    // IDOR: başka oturumun emri dönüşüm üretmez; varlık da sızdırılmaz.
    if (!order || order.userId !== input.userId) {
      return null;
    }
    if (!SETTLED.has(order.status)) {
      return null;
    }
    return {
      merchantOid: order.merchantOid,
      purpose: order.purpose,
      status: order.status,
      amountMinor: order.amountMinor,
      currencyCode: order.currencyCode,
    };
  } catch (error) {
    logEvent({
      level: "warn",
      event: "cuzdan.return.verify_failed",
      reason: error instanceof Error ? error.name : "unknown",
    });
    return null;
  }
}

/** Ödeme emri niyeti → GA4 masa kimliği. */
export function deskForPurpose(purpose: string | null | undefined): string {
  const value = purpose?.trim() ?? "";
  if (value.startsWith("tezgah-license") || value === "TEZGAH_PRO" || value === "TEZGAH_CREDIT") {
    return "tezgah";
  }
  if (value.startsWith("commerce-license") || value === "COMMERCE_LICENSE") {
    return "e-ticaret";
  }
  if (value.startsWith("junior")) {
    return "junior";
  }
  if (value.startsWith("grant") || value === "grant-dossier") {
    return "hibe";
  }
  return "cuzdan";
}
