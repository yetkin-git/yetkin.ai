import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { logEvent } from "@/lib/kernel/observability/log";
import type { CheckoutBillingInfo } from "@/lib/kernel/identity/billing-info";
import {
  COMMERCE_TRIAL_VERIFY_MINOR,
  commerceMerchantTrialKey,
  type CommerceRenewalStatus,
} from "@/lib/commerce/subscription-lifecycle";

/**
 * Deneme hakkı rezervasyonu.
 *
 * Sorun: `commerceTrialConsumption` satırı PayTR penceresi açılmadan önce yazılıyordu ve
 * hata yolunda silinmiyordu. Ödeme penceresini kapatan kullanıcı hakkını yakıyordu.
 *
 * Kural (iki katmanlı, `sealed_at` kolonu):
 * 1. **Kilit** — `sealed_at` boş satır yalnız eşzamanlılık kilididir; aynı vergi kimliğiyle
 *    iki ödeme penceresi aynı anda açılmasın diye yazılır. Kilit
 *    `COMMERCE_TRIAL_RESERVATION_TTL_MS` sonra bayatlar ve sahiplenilebilir; terk edilmiş
 *    pencere hak yakmaz.
 * 2. **Tüketim** — gerçek tüketim yalnız CLEARED sonrası `sealCommerceTrialConsumption` ile
 *    mühürlenir: `sealed_at` dolar ve bir daha açılmaz.
 *
 * Hata yolları (PayTR iframe açılmadı, sipariş yazılamadı, istisna) kilidi
 * `releaseCommerceTrialReservation` ile hemen serbest bırakır.
 */

/** Terk edilmiş ödeme penceresi kilidi bu süre sonra düşer. */
export const COMMERCE_TRIAL_RESERVATION_TTL_MS = 60 * 60 * 1000;

export type TrialReservationState =
  /** Deneme hakkı boş: kilit yazılabilir. */
  | "free"
  /** Kilit taze: başka bir ödeme penceresi açık. */
  | "held"
  /** Kilit bayat: mühürlenmemiş, sahiplenilebilir. */
  | "stale"
  /** Deneme gerçekten tüketilmiş (CLEARED mühürlü). */
  | "consumed";

/**
 * Kilit satırı + abonelik satırının deneme izi birlikte okunur.
 * Saf fonksiyon: karar dışarıdan verilen anlık görüntülerden çıkar.
 */
export function classifyTrialReservation(input: {
  reservation: { consumedAt: Date; sealedAt: Date | null } | null;
  /** Aynı mağazanın aboneliğinde deneme penceresi izi var mı (`trialEndsAt != null`). */
  trialSealed: boolean;
  now: Date;
}): TrialReservationState {
  if (input.trialSealed || input.reservation?.sealedAt) {
    return "consumed";
  }
  if (!input.reservation) {
    return "free";
  }
  const age = input.now.getTime() - input.reservation.consumedAt.getTime();
  if (!Number.isFinite(age) || age < 0) {
    return "held";
  }
  return age >= COMMERCE_TRIAL_RESERVATION_TTL_MS ? "stale" : "held";
}

/** Deneme anahtarı — kurumsal VKN (10) veya bireysel TCKN (11). */
export function trialMerchantKey(billing: CheckoutBillingInfo): string | null {
  return commerceMerchantTrialKey({
    invoiceType: billing.invoiceType,
    vkn: billing.invoiceType === "corporate" ? billing.vkn : null,
    tckn: billing.invoiceType === "individual" ? billing.tckn : null,
  });
}

/** Fatura künyesinde deneme anahtarı yoksa sunucu tam fiyata düşmez; açık hata verir. */
export const COMMERCE_TRIAL_KEY_REQUIRED_MESSAGE =
  "Ücretsiz deneme için fatura künyesinde VKN (kurumsal, 10 hane) veya TCKN (bireysel, 11 hane) dolu olmalı. Fatura künyesini tamamla; eksik kimlikle tam tutar çekilmez.";

async function readSealedTrial(storeId: string): Promise<boolean> {
  const row = await getPrisma().commerceSubscription.findUnique({
    where: { storeId },
    select: { trialEndsAt: true },
  });
  return row?.trialEndsAt != null;
}

/**
 * Deneme hakkı durumu. Okuma hatası `null` döner; çağıran tam fiyata **sessizce** düşmez,
 * denemeyi kapatır ve kullanıcıya katalog tutarını gösterir.
 */
export async function readTrialReservationState(
  merchantKey: string | null,
  storeId: string,
  now: Date = new Date(),
): Promise<TrialReservationState | null> {
  if (!merchantKey) {
    return null;
  }
  try {
    const prisma = getPrisma();
    const [reservation, sealed] = await Promise.all([
      prisma.commerceTrialConsumption.findUnique({
        where: { merchantKey },
        select: { consumedAt: true, sealedAt: true },
      }),
      readSealedTrial(storeId),
    ]);
    return classifyTrialReservation({ reservation, trialSealed: sealed, now });
  } catch {
    return null;
  }
}

export type ReserveTrialOutcome =
  | { ok: true; kind: "reserved" | "reclaimed" }
  | { ok: false; kind: "no_key" | "consumed" | "held" | "error" };

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === "P2002";
}

/**
 * Kilidi yazar. Bayat kilit sahiplenilir (silinip yeniden yazılır), tüketilmiş hak engellenir.
 * `no_key`: fatura künyesinde VKN/TCKN yok. `held`: taze kilit var (eşzamanlı pencere).
 */
export async function reserveCommerceTrial(
  merchantKey: string | null,
  storeId: string,
  now: Date = new Date(),
): Promise<ReserveTrialOutcome> {
  if (!merchantKey) {
    return { ok: false, kind: "no_key" };
  }
  const state = await readTrialReservationState(merchantKey, storeId, now);
  if (state === null) {
    return { ok: false, kind: "error" };
  }
  if (state === "consumed") {
    return { ok: false, kind: "consumed" };
  }
  if (state === "held") {
    return { ok: false, kind: "held" };
  }
  const prisma = getPrisma();
  if (state === "stale") {
    try {
      await prisma.commerceTrialConsumption.deleteMany({
        where: { merchantKey, sealedAt: null },
      });
    } catch {
      return { ok: false, kind: "error" };
    }
  }
  try {
    await prisma.commerceTrialConsumption.create({ data: { merchantKey, storeId } });
    return { ok: true, kind: state === "stale" ? "reclaimed" : "reserved" };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, kind: "held" };
    }
    return { ok: false, kind: "error" };
  }
}

/**
 * Ödeme penceresi açılamadı: kilidi serbest bırak.
 * Yalnız mühürlenmemiş ve bu mağazanın kilidi silinir; tüketilmiş hak asla geri açılmaz.
 */
export async function releaseCommerceTrialReservation(
  merchantKey: string | null,
  storeId: string,
  reason: string,
): Promise<void> {
  if (!merchantKey) {
    return;
  }
  try {
    if (await readSealedTrial(storeId)) {
      return;
    }
    const removed = await getPrisma().commerceTrialConsumption.deleteMany({
      where: { merchantKey, storeId, sealedAt: null },
    });
    logEvent({
      level: "info",
      event: "commerce.trial.reservation_released",
      reason,
      applied: removed.count === 1,
    });
  } catch {
    // Sessiz: kilit TTL ile kendiliğinden düşer; kullanıcı hakkını kaybetmez.
  }
}

/**
 * CLEARED sonrası tüketim mührü. Kilit TTL içinde silinmiş olsa bile hak kalıcı mühürlenir.
 * İdempotenttir: aynı anahtar ikinci kez mühürlenmez.
 */
export async function sealCommerceTrialConsumption(
  merchantKey: string | null,
  storeId: string,
  now: Date = new Date(),
): Promise<void> {
  if (!merchantKey) {
    return;
  }
  try {
    await getPrisma().commerceTrialConsumption.upsert({
      where: { merchantKey },
      create: { merchantKey, storeId, sealedAt: now },
      update: { storeId, sealedAt: now },
    });
  } catch {
    // Mühür yazılamazsa abonelik `trialEndsAt` izi yine tüketimi kanıtlar.
  }
}

/**
 * Mağaza üzerinden mühür. CLEARED kancası fatura künyesini taşımaz; mühür storeId ile
 * atılır ki terk edilmiş kilit (TTL sonrası) ikinci bir deneme açamasın.
 */
export async function sealCommerceTrialConsumptionForStore(
  storeId: string,
  now: Date = new Date(),
): Promise<void> {
  try {
    await getPrisma().commerceTrialConsumption.updateMany({
      where: { storeId, sealedAt: null },
      data: { sealedAt: now },
    });
  } catch {
    // Sessiz: abonelik `trialEndsAt` izi tüketimi kanıtlar.
  }
}

export type CommerceTrialOffer = {
  /** Deneme bu mağaza için açılabilir mi. */
  eligible: boolean;
  /** Bugün çekilecek tutar (kuruş) — denemede sembolik doğrulama bedeli. */
  verifyAmountMinor: number;
  /** Deneme kapalıysa kısa gerekçe; açıksa null. */
  blockedReason: "no_key" | "consumed" | "held" | "open_seat" | "unknown" | null;
};

/** Lisans ekranı için teklif özeti. Yazmaz. */
export async function readCommerceTrialOffer(input: {
  billing: CheckoutBillingInfo | null;
  storeId: string;
  /** ACTIVE / TRIALING / PAST_DUE koltuk doluysa deneme konuşulmaz. */
  openSeat: boolean;
  now?: Date;
}): Promise<CommerceTrialOffer> {
  if (input.openSeat) {
    return { eligible: false, verifyAmountMinor: COMMERCE_TRIAL_VERIFY_MINOR, blockedReason: "open_seat" };
  }
  const key = input.billing ? trialMerchantKey(input.billing) : null;
  if (!key) {
    return { eligible: false, verifyAmountMinor: COMMERCE_TRIAL_VERIFY_MINOR, blockedReason: "no_key" };
  }
  const state = await readTrialReservationState(key, input.storeId, input.now ?? new Date());
  if (state === null) {
    return { eligible: false, verifyAmountMinor: COMMERCE_TRIAL_VERIFY_MINOR, blockedReason: "unknown" };
  }
  if (state === "consumed") {
    return { eligible: false, verifyAmountMinor: COMMERCE_TRIAL_VERIFY_MINOR, blockedReason: "consumed" };
  }
  if (state === "held") {
    return { eligible: false, verifyAmountMinor: COMMERCE_TRIAL_VERIFY_MINOR, blockedReason: "held" };
  }
  return { eligible: true, verifyAmountMinor: COMMERCE_TRIAL_VERIFY_MINOR, blockedReason: null };
}

/** Durum adı lisans bandında TRIALING ayrımı için kullanılır. */
export function isTrialingStatus(status: CommerceRenewalStatus | string | null | undefined): boolean {
  return status === "TRIALING";
}
