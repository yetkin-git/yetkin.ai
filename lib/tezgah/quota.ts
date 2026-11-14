import "server-only";

import { startOfEuropeIstanbulDay } from "@/lib/kernel/ai/budget-shield";
import {
  TEZGAH_GUEST_DAILY_LIMIT,
  TEZGAH_MEMBER_DAILY_LIMIT,
} from "@/lib/tezgah/catalog";

/**
 * Günlük üretim hakkı. Anahtar `guest:<ip>` veya kullanıcı kimliğidir.
 * Pencere Avrupa/İstanbul gece yarısında sıfırlanır. Cüzdana ve ledger'a yazılmaz.
 * Süreç içi sayaç, varsayılan hız kalkanıyla aynı sınıftadır.
 */

export type TezgahQuotaSnapshot = {
  allowed: boolean;
  remaining: number;
  limit: number;
  used: number;
  guest: boolean;
};

type Slot = { day: string; used: number };

const slots = new Map<string, Slot>();

export function tezgahDayKey(now = new Date()): string {
  const start = startOfEuropeIstanbulDay(now);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(start);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  if (!year || !month || !day) {
    throw new Error("Tezgâh gün anahtarı hesaplanamadı.");
  }
  return `${year}-${month}-${day}`;
}

export function tezgahDailyLimit(guest: boolean): number {
  return guest ? TEZGAH_GUEST_DAILY_LIMIT : TEZGAH_MEMBER_DAILY_LIMIT;
}

function readUsed(actorId: string, day: string): number {
  const slot = slots.get(actorId);
  if (!slot || slot.day !== day) {
    return 0;
  }
  return slot.used;
}

function writeUsed(actorId: string, day: string, used: number): void {
  slots.set(actorId, { day, used });
  if (slots.size <= 5000) {
    return;
  }
  for (const [key, slot] of slots) {
    if (slot.day !== day) {
      slots.delete(key);
    }
  }
}

export function peekTezgahQuota(
  actorId: string,
  guest: boolean,
  now = new Date(),
): TezgahQuotaSnapshot {
  const limit = tezgahDailyLimit(guest);
  const used = readUsed(actorId, tezgahDayKey(now));
  const remaining = Math.max(0, limit - used);
  return { allowed: remaining > 0, remaining, limit, used, guest };
}

/** Başarılı üretimden önce hak düşer. Çağrı tek iş parçacığında sayacı artırır. */
export function consumeTezgahQuota(
  actorId: string,
  guest: boolean,
  now = new Date(),
): TezgahQuotaSnapshot {
  const day = tezgahDayKey(now);
  const limit = tezgahDailyLimit(guest);
  const used = readUsed(actorId, day);
  if (used >= limit) {
    return { allowed: false, remaining: 0, limit, used, guest };
  }
  const next = used + 1;
  writeUsed(actorId, day, next);
  return { allowed: true, remaining: limit - next, limit, used: next, guest };
}

/** Model boş dönerse hak geri yazılır. Tüketilmemiş hakta no-op'tur. */
export function refundTezgahQuota(actorId: string, guest: boolean, now = new Date()): TezgahQuotaSnapshot {
  const day = tezgahDayKey(now);
  const limit = tezgahDailyLimit(guest);
  const used = readUsed(actorId, day);
  const next = Math.max(0, used - 1);
  writeUsed(actorId, day, next);
  return { allowed: next < limit, remaining: limit - next, limit, used: next, guest };
}

export function resetTezgahQuotaForTests(): void {
  slots.clear();
}
