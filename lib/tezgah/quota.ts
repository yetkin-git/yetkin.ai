import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import { startOfEuropeIstanbulDay } from "@/lib/kernel/ai/budget-shield";
import { getPrisma } from "@/lib/kernel/db";
import {
  TEZGAH_GUEST_DAILY_LIMIT,
  TEZGAH_GUEST_QUOTA_MESSAGE,
  TEZGAH_MEMBER_DAILY_LIMIT,
  TEZGAH_MEMBER_PAID_MESSAGE,
  TEZGAH_MEMBER_QUOTA_MESSAGE,
  TEZGAH_TETKIK_DATE_KEY,
  TEZGAH_TETKIK_GUEST_QUOTA_MESSAGE,
  TEZGAH_TETKIK_LIFETIME_LIMIT,
  TEZGAH_TETKIK_MEMBER_QUOTA_MESSAGE,
  type TezgahPoolKey,
} from "@/lib/tezgah/catalog";
import {
  beginTezgahCreditHold,
  commitTezgahCredit,
  readTezgahCreditRemaining,
  readTezgahPackAmount,
  readTezgahProActive,
  type TezgahCreditHold,
} from "@/lib/tezgah/paid-lane";

/**
 * Üretim hakkı. Anahtar `guest:<ip>` veya kullanıcı kimliğidir.
 * `lite` havuzu Avrupa/İstanbul gece yarısında sıfırlanır.
 * `tetkik` havuzu ömür boyudur (`dateKey = lifetime`).
 * `free_template` sayılmaz. Sayaç `tezgah_daily_quotas` satırındadır.
 * Test süreci bellek store kullanır. Cüzdan bu dosyada yazılmaz.
 */

export type TezgahLane = "free" | "pro" | "credit" | "prepaid" | "closed";

export type TezgahQuotaSnapshot = {
  allowed: boolean;
  remaining: number;
  limit: number;
  used: number;
  guest: boolean;
  lane: TezgahLane;
  poolKey: TezgahPoolKey;
  unlimited: boolean;
  paywall: boolean;
  commandKey: string | null;
  hold: TezgahCreditHold | null;
  error: string | null;
  status: 400 | 429 | null;
};

export type TezgahQuotaCommand = {
  key: string;
  requestHash: string;
};

type QuotaStore = {
  read(dateKey: string, subjectKey: string, poolKey: TezgahPoolKey): Promise<number>;
  tryConsume(
    dateKey: string,
    subjectKey: string,
    poolKey: TezgahPoolKey,
    limit: number,
    now: Date,
  ): Promise<number | null>;
  refund(dateKey: string, subjectKey: string, poolKey: TezgahPoolKey, now: Date): Promise<number>;
  reset(): void;
};

const memoryRows = new Map<string, number>();

function memoryKey(dateKey: string, subjectKey: string, poolKey: TezgahPoolKey): string {
  return `${dateKey}\t${subjectKey}\t${poolKey}`;
}

const memoryStore: QuotaStore = {
  async read(dateKey, subjectKey, poolKey) {
    return memoryRows.get(memoryKey(dateKey, subjectKey, poolKey)) ?? 0;
  },
  async tryConsume(dateKey, subjectKey, poolKey, limit) {
    const key = memoryKey(dateKey, subjectKey, poolKey);
    const used = memoryRows.get(key) ?? 0;
    if (used >= limit) {
      return null;
    }
    const next = used + 1;
    memoryRows.set(key, next);
    return next;
  },
  async refund(dateKey, subjectKey, poolKey) {
    const key = memoryKey(dateKey, subjectKey, poolKey);
    const next = Math.max(0, (memoryRows.get(key) ?? 0) - 1);
    memoryRows.set(key, next);
    return next;
  },
  reset() {
    memoryRows.clear();
  },
};

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}

function prismaStore(): QuotaStore {
  const prisma = getPrisma();
  return {
    async read(dateKey, subjectKey, poolKey) {
      const row = await prisma.tezgahDailyQuota.findUnique({
        where: { dateKey_subjectKey_poolKey: { dateKey, subjectKey, poolKey } },
      });
      return row?.usedCount ?? 0;
    },
    async tryConsume(dateKey, subjectKey, poolKey, limit, now) {
      return prisma.$transaction(async (tx) => {
        const where = { dateKey_subjectKey_poolKey: { dateKey, subjectKey, poolKey } };
        const existing = await tx.tezgahDailyQuota.findUnique({ where });
        if (!existing) {
          try {
            await tx.tezgahDailyQuota.create({
              data: { dateKey, subjectKey, poolKey, usedCount: 1, updatedAt: now },
            });
            return 1;
          } catch (error) {
            if (!isUniqueViolation(error)) {
              throw error;
            }
          }
        }
        const updated = await tx.tezgahDailyQuota.updateMany({
          where: { dateKey, subjectKey, poolKey, usedCount: { lt: limit } },
          data: { usedCount: { increment: 1 }, updatedAt: now },
        });
        if (updated.count !== 1) {
          return null;
        }
        const next = await tx.tezgahDailyQuota.findUnique({ where });
        return next?.usedCount ?? null;
      });
    },
    async refund(dateKey, subjectKey, poolKey, now) {
      const where = { dateKey_subjectKey_poolKey: { dateKey, subjectKey, poolKey } };
      await prisma.tezgahDailyQuota.updateMany({
        where: { dateKey, subjectKey, poolKey, usedCount: { gt: 0 } },
        data: { usedCount: { decrement: 1 }, updatedAt: now },
      });
      const row = await prisma.tezgahDailyQuota.findUnique({ where });
      return row?.usedCount ?? 0;
    },
    reset() {
      memoryRows.clear();
    },
  };
}

function memoryQuotaRuntime(): boolean {
  return process.env.NODE_ENV === "test" || process.env.VITEST === "true";
}

function activeStore(): QuotaStore {
  return memoryQuotaRuntime() ? memoryStore : prismaStore();
}

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

export function tezgahQuotaDateKey(poolKey: TezgahPoolKey, now = new Date()): string {
  if (poolKey === "tetkik") {
    return TEZGAH_TETKIK_DATE_KEY;
  }
  return tezgahDayKey(now);
}

export function tezgahDailyLimit(guest: boolean): number {
  return guest ? TEZGAH_GUEST_DAILY_LIMIT : TEZGAH_MEMBER_DAILY_LIMIT;
}

export function tezgahPoolLimit(poolKey: TezgahPoolKey, guest: boolean): number {
  if (poolKey === "tetkik") {
    return TEZGAH_TETKIK_LIFETIME_LIMIT;
  }
  if (poolKey === "free_template") {
    return 1;
  }
  return tezgahDailyLimit(guest);
}

function closedMessage(poolKey: TezgahPoolKey, guest: boolean, paywall: boolean): string | null {
  if (poolKey === "tetkik") {
    if (guest) {
      return TEZGAH_TETKIK_GUEST_QUOTA_MESSAGE;
    }
    return paywall ? TEZGAH_MEMBER_PAID_MESSAGE : TEZGAH_TETKIK_MEMBER_QUOTA_MESSAGE;
  }
  if (guest) {
    return TEZGAH_GUEST_QUOTA_MESSAGE;
  }
  return paywall ? TEZGAH_MEMBER_PAID_MESSAGE : TEZGAH_MEMBER_QUOTA_MESSAGE;
}

function snapshot(input: {
  allowed: boolean;
  remaining: number;
  limit: number;
  used: number;
  guest: boolean;
  lane: TezgahLane;
  poolKey: TezgahPoolKey;
  unlimited?: boolean;
  paywall?: boolean;
  commandKey?: string | null;
  hold?: TezgahCreditHold | null;
  error?: string | null;
  status?: 400 | 429 | null;
}): TezgahQuotaSnapshot {
  return {
    allowed: input.allowed,
    remaining: input.remaining,
    limit: input.limit,
    used: input.used,
    guest: input.guest,
    lane: input.lane,
    poolKey: input.poolKey,
    unlimited: input.unlimited ?? false,
    paywall: input.paywall ?? false,
    commandKey: input.commandKey ?? null,
    hold: input.hold ?? null,
    error: input.error ?? null,
    status: input.status ?? null,
  };
}

function unlimitedSnapshot(guest: boolean, poolKey: TezgahPoolKey): TezgahQuotaSnapshot {
  return snapshot({
    allowed: true,
    remaining: 1,
    limit: 1,
    used: 0,
    guest,
    lane: "free",
    poolKey,
    unlimited: true,
  });
}

export async function peekTezgahQuota(
  actorId: string,
  guest: boolean,
  now = new Date(),
  poolKey: TezgahPoolKey = "lite",
): Promise<TezgahQuotaSnapshot> {
  if (poolKey === "free_template") {
    return unlimitedSnapshot(guest, poolKey);
  }
  const limit = tezgahPoolLimit(poolKey, guest);
  if (!guest && (await readTezgahProActive(actorId, now))) {
    return snapshot({
      allowed: true,
      remaining: limit,
      limit,
      used: 0,
      guest: false,
      lane: "pro",
      poolKey,
    });
  }
  let used = 0;
  try {
    used = await activeStore().read(tezgahQuotaDateKey(poolKey, now), actorId, poolKey);
  } catch {
    return snapshot({
      allowed: false,
      remaining: 0,
      limit,
      used: 0,
      guest,
      lane: "closed",
      poolKey,
      error: "Günlük hak okunamadı.",
      status: 429,
    });
  }
  const remaining = Math.max(0, limit - used);
  if (remaining > 0) {
    return snapshot({
      allowed: true,
      remaining,
      limit,
      used,
      guest,
      lane: "free",
      poolKey,
    });
  }
  if (!guest) {
    const credit = await readTezgahCreditRemaining(actorId);
    if (credit && credit.remaining > 0 && credit.unitMinor > 0) {
      return snapshot({
        allowed: true,
        remaining: credit.remaining,
        limit: credit.remaining,
        used: 0,
        guest: false,
        lane: "credit",
        poolKey,
      });
    }
  }
  const pack = guest ? null : await readTezgahPackAmount();
  return snapshot({
    allowed: false,
    remaining: 0,
    limit,
    used,
    guest,
    lane: "closed",
    poolKey,
    paywall: pack != null,
    error: closedMessage(poolKey, guest, pack != null),
    status: 429,
  });
}

/** Başarılı üretimden önce hak düşer. Ücretsiz hat sayacı artırır. Pro sayacı artırmaz. */
export async function consumeTezgahQuota(
  actorId: string,
  guest: boolean,
  now = new Date(),
  command: TezgahQuotaCommand | null = null,
  poolKey: TezgahPoolKey = "lite",
): Promise<TezgahQuotaSnapshot> {
  if (poolKey === "free_template") {
    return unlimitedSnapshot(guest, poolKey);
  }
  const limit = tezgahPoolLimit(poolKey, guest);
  if (!guest && (await readTezgahProActive(actorId, now))) {
    return snapshot({
      allowed: true,
      remaining: limit,
      limit,
      used: 0,
      guest: false,
      lane: "pro",
      poolKey,
    });
  }
  const day = tezgahQuotaDateKey(poolKey, now);
  let consumed: number | null = null;
  try {
    consumed = await activeStore().tryConsume(day, actorId, poolKey, limit, now);
  } catch {
    return snapshot({
      allowed: false,
      remaining: 0,
      limit,
      used: limit,
      guest,
      lane: "closed",
      poolKey,
      error: "Günlük hak yazılamadı.",
      status: 429,
    });
  }
  if (consumed != null) {
    return snapshot({
      allowed: true,
      remaining: limit - consumed,
      limit,
      used: consumed,
      guest,
      lane: "free",
      poolKey,
    });
  }
  if (guest) {
    return snapshot({
      allowed: false,
      remaining: 0,
      limit,
      used: limit,
      guest: true,
      lane: "closed",
      poolKey,
      error: closedMessage(poolKey, true, false),
      status: 429,
    });
  }
  const credit = await readTezgahCreditRemaining(actorId);
  const pack = await readTezgahPackAmount();
  if (!credit || credit.remaining <= 0 || credit.unitMinor <= 0 || pack == null) {
    return snapshot({
      allowed: false,
      remaining: 0,
      limit,
      used: limit,
      guest: false,
      lane: "closed",
      poolKey,
      paywall: pack != null,
      error: closedMessage(poolKey, false, pack != null),
      status: 429,
    });
  }
  if (!command) {
    return snapshot({
      allowed: false,
      remaining: credit.remaining,
      limit,
      used: limit,
      guest: false,
      lane: "closed",
      poolKey,
      paywall: true,
      error: "Ücretli üretim Idempotency-Key ister.",
      status: 400,
    });
  }
  const hold = await beginTezgahCreditHold({
    userId: actorId,
    commandKey: command.key,
    requestHash: command.requestHash,
    unitMinor: credit.unitMinor,
    now,
  });
  if (!hold.ok) {
    return snapshot({
      allowed: false,
      remaining: 0,
      limit,
      used: limit,
      guest: false,
      lane: "closed",
      poolKey,
      paywall: true,
      error: hold.error,
      status: hold.status,
    });
  }
  return snapshot({
    allowed: true,
    remaining: Math.max(0, credit.remaining - 1),
    limit,
    used: limit,
    guest: false,
    lane: "credit",
    poolKey,
    commandKey: command.key,
    hold: hold.hold,
  });
}

/** Model boş dönerse ücretsiz hak geri yazılır. Pro ve kredi hattında sayaç değişmez. */
export async function refundTezgahQuota(
  actorId: string,
  guest: boolean,
  now = new Date(),
  lane: TezgahLane = "free",
  poolKey: TezgahPoolKey = "lite",
): Promise<TezgahQuotaSnapshot> {
  if (poolKey === "free_template" || lane !== "free") {
    return peekTezgahQuota(actorId, guest, now, poolKey);
  }
  const day = tezgahQuotaDateKey(poolKey, now);
  const limit = tezgahPoolLimit(poolKey, guest);
  const used = await activeStore().refund(day, actorId, poolKey, now);
  const remaining = Math.max(0, limit - used);
  return snapshot({
    allowed: remaining > 0,
    remaining,
    limit,
    used,
    guest,
    lane: "free",
    poolKey,
  });
}

export function resetTezgahQuotaForTests(): void {
  memoryStore.reset();
}

/** Kredi hattında üretim başarıdan sonra defter DEBIT yazar. Ücretsiz ve Pro hatta no-op'tur. */
export async function settleTezgahSlot(
  actorId: string,
  slot: TezgahQuotaSnapshot,
): Promise<{ ok: true } | { ok: false; error: string; status: 402 }> {
  if (slot.lane !== "credit" || !slot.hold) {
    return { ok: true };
  }
  return commitTezgahCredit({ userId: actorId, hold: slot.hold });
}

export type TezgahQuotaDb = Pick<PrismaClient, "tezgahDailyQuota">;
