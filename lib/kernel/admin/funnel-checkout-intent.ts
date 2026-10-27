import "server-only";

import {
  FUNNEL_CHECKOUT_INTENT_STEP,
  FUNNEL_TIME_ZONE,
} from "@/lib/kernel/admin/funnel-constants";
import { recordFunnelDailyStep } from "@/lib/kernel/admin/funnel-counter";

/**
 * `checkout_intent` — kasa ekranı AÇILMADAN yazılan niyet.
 *
 * Neden ayrı dosya: bu satır `top-up` yan etkisi olarak değil, **kullanıcı ödeme
 * düğmesine bastığı ve gerçekten açılabilir bir kasa ekranı üretildiği an** yazılmalı.
 * Ekran açıldıktan sonra yazmak "terk" ile "niyet"i aynı kovaya koyar ve huninin
 * üçüncü adımını ölçülemez kılar.
 *
 * Sayaç yazımı tek evde kalır: `recordFunnelDailyStep`. Bu modül onun üstüne
 * **tekilleştirme + yüzey sınıflandırması** koyar. İkinci INSERT yazılmaz.
 *
 * Kişi kimliği, IP, çerez ve kampanya yazılmaz — yalnız günlük adım sayacı.
 * Throw etmez: niyet yazımı ödeme akışını bloklamaz.
 */

export const FUNNEL_INTENT_DEDUPE_PREFIX = "checkout_intent:" as const;

export const FUNNEL_INTENT_SURFACES = [
  "academy-license",
  "junior-yearly",
  "wallet-top-up",
] as const;

export type FunnelIntentSurface = (typeof FUNNEL_INTENT_SURFACES)[number];

export function isFunnelIntentSurface(value: string): value is FunnelIntentSurface {
  return (FUNNEL_INTENT_SURFACES as readonly string[]).includes(value);
}

/**
 * İstanbul takvim günü — `funnel_daily_counters.day` ile aynı eksen.
 * Sayaç bu eksende yazılır; tekilleştirme anahtarı da aynı eksende olmalı.
 */
export function funnelDayKey(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUNNEL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${pick("year")}-${pick("month")}-${pick("day")}`;
}

/**
 * Niyet anahtarı: gün + yüzey + hedef kimlik.
 * Anahtar yalnız süreç içi tekilleştirmede kullanılır; veritabanına yazılmaz.
 */
export function checkoutIntentKey(input: {
  surface: FunnelIntentSurface;
  targetSlug: string;
  day: string;
}): string {
  return `${FUNNEL_INTENT_DEDUPE_PREFIX}${input.day}:${input.surface}:${input.targetSlug.trim()}`;
}

/**
 * Süreç içi günlük kova — aynı süreçte aynı niyet 30 dakika içinde iki kez sayılmaz.
 * Çok örnekli dağıtımda kova örnek başına ayrıdır; bu yüzden bu bir **kaba**
 * tekilleştirmedir. Kesin tekilleştirme `funnel_daily_counters` üzerindeki
 * gün/adım çiftinin kendisidir (gün başına tek satır, `count` ile artar).
 */
const INTENT_MEMORY_MS = 30 * 60 * 1000;
const intentSeen = new Map<string, number>();

function recentlySeen(key: string, nowMs: number): boolean {
  const previous = intentSeen.get(key);
  return previous != null && nowMs - previous < INTENT_MEMORY_MS;
}

/**
 * Tekilleştirme yuvası yalnız **gerçekten sayıldığında** tüketilir.
 * Veritabanı düşükse niyet kaybolmaz; sonraki basış yeniden denenir.
 */
function rememberIntent(key: string, nowMs: number): void {
  intentSeen.set(key, nowMs);
  if (intentSeen.size > 500) {
    for (const [entryKey, stamp] of intentSeen) {
      if (nowMs - stamp >= INTENT_MEMORY_MS) {
        intentSeen.delete(entryKey);
      }
    }
  }
}

/** Test izolasyonu — süreç içi kovayı boşaltır. */
export function resetCheckoutIntentMemory(): void {
  intentSeen.clear();
}

export type CheckoutIntentResult = "counted" | "deduped" | "unavailable";

/**
 * Kasa ekranı açılmadan önce çağrılır. Sayaç +1.
 * `surface` ve `targetSlug` yalnız tekilleştirme anahtarı içindir; DB'ye yazılmaz.
 */
export async function recordCheckoutIntentStep(
  input: { surface: FunnelIntentSurface; targetSlug: string },
  now: Date = new Date(),
): Promise<CheckoutIntentResult> {
  const day = funnelDayKey(now);
  const key = checkoutIntentKey({ ...input, day });
  if (recentlySeen(key, now.getTime())) {
    return "deduped";
  }
  if (!process.env.DATABASE_URL?.trim()) {
    return "unavailable";
  }
  await recordFunnelDailyStep(FUNNEL_CHECKOUT_INTENT_STEP, {
    failureEvent: "funnel.checkout_intent.failed",
  });
  rememberIntent(key, now.getTime());
  return "counted";
}
