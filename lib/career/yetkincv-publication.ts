import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { toAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";
import { logEvent } from "@/lib/kernel/observability/log";
import type { PaymentOrderSnapshot } from "@/lib/kernel/payments/clearing";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";

/**
 * Faz 3 / §4.3 — YetkinCV **ücretli yayın mührü**.
 *
 * Model ayrımı (dürüstlük ilkesi):
 *
 * | Katman | Ücret | Nerede |
 * |---|---|---|
 * | Vaka sınavı, puanlama, SWOT, 30/60/90 planı | **Ücretsiz** | `lib/career/yetkincv-store.ts` |
 * | SHA-256 mühür (`YetkinCvSeal` satırı) | **Ücretsiz** | `sealYetkinCvSitting` |
 * | Kamuya açık kariyer kartı + uzman dizini görünürlüğü | **290 TL (tek seferlik)** | `sealedPublication` |
 *
 * Yani para **puanı değil yayını** satın alır: "Puan satın almadan değil test
 * sonucundan oluşur" cümlesi bozulmaz. Satın alma tek başına puan basmaz; puan
 * olmayan kullanıcı yayın satın alsa bile `/vize` kartı puan üretmez.
 *
 * Mali akış: `POST /api/career/yetkincv/purchase` → `placeSingleCatalogPurchase`
 * (katalog `career/yetkincv-exam` = 29.000 kuruş) → PayTR CLEARED →
 * `fulfillYetkinCvPublication` → `sealedPublication = true`.
 */

export const YETKINCV_PUBLICATION_UNIT = "yetkincv-exam" as const;
export const YETKINCV_PUBLICATION_ORDER_PURPOSE = "career-license:yetkincv-publication" as const;
export const YETKINCV_PUBLICATION_BASKET_NAME = "YetkinCV kamuya açık kariyer kartı" as const;
export const YETKINCV_PUBLICATION_RETURN_DESK = "career" as const;

export type YetkinCvPublicationState = {
  /** Mühür var mı? Puan yoksa yayın satın alınamaz. */
  hasSeal: boolean;
  /** Kamuya açık kart açık mı? */
  published: boolean;
  /** Yayını açan sipariş (varsa). Tekrar ödemeyi durdurur. */
  paidMerchantOid: string | null;
  publishedAt: string | null;
  certificateHash: string | null;
};

/**
 * Katalog tutarı — CTA ve vitrin aynı yerden okur.
 * Satır yoksa/pasifse `null`; fiyat uydurulmaz (A1).
 */
export async function readYetkinCvPublicationAmount(): Promise<AmountMinor | null> {
  try {
    const entry = await createPrismaPriceCatalogStore().findActiveEntry(
      "career",
      YETKINCV_PUBLICATION_UNIT,
    );
    if (!entry || !entry.isActive || entry.currencyCode !== "TRY" || entry.amountMinor <= 0) {
      return null;
    }
    return toAmountMinor(entry.amountMinor);
  } catch {
    return null;
  }
}

const UNPUBLISHED: YetkinCvPublicationState = {
  hasSeal: false,
  published: false,
  paidMerchantOid: null,
  publishedAt: null,
  certificateHash: null,
};

/**
 * Kullanıcının **en son** mührünün yayın durumu. Mühür yoksa `hasSeal: false`
 * (satın alma kapalı, uydurma yayın yok).
 */
export async function loadYetkinCvPublicationState(
  userId: string,
): Promise<YetkinCvPublicationState> {
  try {
    const row = await getPrisma().yetkinCvSeal.findFirst({
      where: { userId },
      orderBy: { issuedAt: "desc" },
      select: {
        sealedPublication: true,
        publicationPaidMerchantOid: true,
        publishedAt: true,
        certificateHash: true,
      },
    });
    if (!row) {
      return UNPUBLISHED;
    }
    return {
      hasSeal: true,
      published: row.sealedPublication,
      paidMerchantOid: row.publicationPaidMerchantOid,
      publishedAt: row.publishedAt?.toISOString() ?? null,
      certificateHash: row.certificateHash,
    };
  } catch {
    return UNPUBLISHED;
  }
}

/** Hash ile yayın durumu — `/vize/[hash]` özet kartı için. */
export async function loadYetkinCvPublicationByHash(
  certificateHash: string,
): Promise<{ published: boolean } | null> {
  try {
    const row = await getPrisma().yetkinCvSeal.findUnique({
      where: { certificateHash },
      select: { sealedPublication: true },
    });
    return row ? { published: row.sealedPublication } : null;
  } catch {
    return null;
  }
}

export type FulfillPublicationResult = { applied: boolean; reason: string };

/**
 * CLEARED sipariş → yayın açılır.
 *
 * Idempotent: aynı `merchantOid` ikinci kez yayın açmaz, ikinci kez ücret almaz.
 * `userId` zorunludur (misafir yayın satın alamaz: kart zaten bir hesaba bağlı
 * mühürdür). Mühür yoksa `no_seal` döner — **para alınmış ama ürün yok** durumu
 * operatöre `license_gap` alarmı olarak düşer (`lib/kernel/payments/license-gap`).
 *
 * Yayın **en son** mühre uygulanır: kullanıcı yeni bir sınav yaptıysa eski kart
 * kendiliğinden yayınlanmaz.
 */
export async function fulfillYetkinCvPublication(
  order: PaymentOrderSnapshot,
): Promise<FulfillPublicationResult> {
  if (order.purpose !== YETKINCV_PUBLICATION_ORDER_PURPOSE) {
    return { applied: false, reason: "not_yetkincv" };
  }
  if (order.status !== "CLEARED") {
    return { applied: false, reason: "not_cleared" };
  }
  if (!order.userId) {
    return { applied: false, reason: "no_user" };
  }
  const prisma = getPrisma();
  const seal = await prisma.yetkinCvSeal.findFirst({
    where: { userId: order.userId },
    orderBy: { issuedAt: "desc" },
    select: { id: true, sealedPublication: true, publicationPaidMerchantOid: true },
  });
  if (!seal) {
    logEvent({
      level: "warn",
      event: "career.publication.no_seal",
      userId: order.userId,
      merchantOid: order.merchantOid,
      orderId: order.id,
      purpose: order.purpose,
      applied: false,
      reason: "no_seal",
    });
    return { applied: false, reason: "no_seal" };
  }
  if (seal.sealedPublication && seal.publicationPaidMerchantOid === order.merchantOid) {
    return { applied: false, reason: "already_published" };
  }
  await prisma.yetkinCvSeal.update({
    where: { id: seal.id },
    data: {
      sealedPublication: true,
      publicationPaidMerchantOid: seal.publicationPaidMerchantOid ?? order.merchantOid,
      publishedAt: new Date(),
    },
  });
  logEvent({
    level: "info",
    event: "career.publication.opened",
    userId: order.userId,
    merchantOid: order.merchantOid,
    orderId: order.id,
    purpose: order.purpose,
    applied: true,
  });
  return { applied: true, reason: "published" };
}
