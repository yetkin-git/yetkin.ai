import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import { startOfEuropeIstanbulDay } from "@/lib/kernel/ai/budget-shield";
import { getPrisma } from "@/lib/kernel/db";
import {
  TEZGAH_FREE_MONTHLY_CREDITS,
  TEZGAH_GUEST_DAILY_LIMIT,
  TEZGAH_GUEST_QUOTA_MESSAGE,
  TEZGAH_MEMBER_PAID_MESSAGE,
  TEZGAH_MEMBER_QUOTA_MESSAGE,
  TEZGAH_PRO_MONTHLY_CREDITS,
  TEZGAH_PRO_QUOTA_MESSAGE,
  TEZGAH_ROLLOVER_BPS,
  TEZGAH_ROLLOVER_CAP_BPS,
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
  releaseTezgahCredit,
  type TezgahCreditHold,
} from "@/lib/tezgah/paid-lane";

/**
 * Üretim hakkı. Anahtar `guest:<ip>` veya kullanıcı kimliğidir.
 *
 * Faz 3 / S-01 — periyot tablosu:
 *
 * | Hat            | Havuz    | Periyot anahtarı        | Tavan                        |
 * |----------------|----------|-------------------------|------------------------------|
 * | Misafir        | `lite`   | `YYYY-MM-DD` (günlük)   | `TEZGAH_GUEST_DAILY_LIMIT`   |
 * | Üye (ücretsiz) | `lite`   | `YYYY-MM` (aylık)       | `TEZGAH_FREE_MONTHLY_CREDITS`|
 * | Üye (Pro)      | `lite`   | `YYYY-MM` (aylık)       | `TEZGAH_PRO_MONTHLY_CREDITS` |
 * | Herkes         | `tetkik` | `lifetime`              | 1 (ömür boyu)                |
 * | Herkes         | `free_template` | sayılmaz        | sınırsız                     |
 *
 * Misafir hattı **bilinçli olarak günlük kalır**: misafir kovası `guest:<ip>`'dir ve
 * bir çıkış IP'sini (CGNAT, kurumsal NAT, kafe) yüzlerce kişi paylaşabilir. Aylık
 * havuz bu kovaya 30 kredi verirdi; günlük 3 hem maliyet kalkanını hem adaleti korur.
 *
 * Tablo adı `tezgah_daily_quotas` **tarihsel** olarak kalır (rename RLS mührünü
 * kırar). Kolon `date_key` artık gerçekten bir *periyot* anahtarıdır; yorum bunu
 * `prisma/schema/tezgah.prisma` içinde taşır.
 *
 * `lite` havuzunda **aylık devir** vardır: önceki ayın kullanılmayan kredisinin
 * %50'si bu aya taşınır, taban havuzun %50'siyle sınırlıdır (`tezgahRolloverCredits`).
 * Devir her okumada **deterministik** hesaplanır — cron'a bağımlı değildir; cron
 * (`tezgah.credit.rollover`) yalnız denetim kaydı ve temizlik yapar.
 *
 * Para, cüzdan ve defter bu dosyada yazılmaz.
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
  /** Bu ay devreden kredi. `limit` bunu içerir; `rollover` ayrıştırır (UI dili için). */
  rollover?: number;
  /** Periyot anahtarı: üyede `YYYY-MM`, misafirde `YYYY-MM-DD`, tetkikte `lifetime`. */
  periodKey?: string;
};

export type TezgahQuotaCommand = {
  key: string;
  requestHash: string;
};

export type TezgahQuotaRefundOptions = {
  hold?: TezgahCreditHold | null;
  command?: TezgahQuotaCommand | null;
};

type QuotaCommandOutcome = { kind: "fresh" | "replay"; used: number } | { kind: "conflict" } | null;

type QuotaStore = {
  read(dateKey: string, subjectKey: string, poolKey: TezgahPoolKey): Promise<number>;
  /**
   * Faz 3 / S-01 — devir için *satır var mı* sorusu.
   * `0` (kayıt var, hiç kullanılmamış) ile `null` (kayıt yok, havuz hiç açılmamış)
   * ayrımı kritiktir: aksi hâlde hiç üretim yapmamış yeni kullanıcı "kullanmadım"
   * diye bedava devir kazanırdı.
   */
  readOptional(
    dateKey: string,
    subjectKey: string,
    poolKey: TezgahPoolKey,
  ): Promise<number | null>;
  tryConsume(
    dateKey: string,
    subjectKey: string,
    poolKey: TezgahPoolKey,
    limit: number,
    now: Date,
    command?: TezgahQuotaCommand | null,
  ): Promise<QuotaCommandOutcome>;
  refund(dateKey: string, subjectKey: string, poolKey: TezgahPoolKey, now: Date): Promise<number>;
  forgetCommand(
    dateKey: string,
    subjectKey: string,
    poolKey: TezgahPoolKey,
    commandKey: string,
  ): Promise<void>;
  reset(): void;
};

const memoryRows = new Map<string, number>();
const memoryCommands = new Map<string, { requestHash: string; usedAfter: number }>();

function memoryKey(dateKey: string, subjectKey: string, poolKey: TezgahPoolKey): string {
  return `${dateKey}\t${subjectKey}\t${poolKey}`;
}

function memoryCommandKey(
  dateKey: string,
  subjectKey: string,
  poolKey: TezgahPoolKey,
  commandKey: string,
): string {
  return `${memoryKey(dateKey, subjectKey, poolKey)}\t${commandKey}`;
}

const memoryStore: QuotaStore = {
  async read(dateKey, subjectKey, poolKey) {
    return memoryRows.get(memoryKey(dateKey, subjectKey, poolKey)) ?? 0;
  },
  async readOptional(dateKey, subjectKey, poolKey) {
    return memoryRows.get(memoryKey(dateKey, subjectKey, poolKey)) ?? null;
  },
  async tryConsume(dateKey, subjectKey, poolKey, limit, _now, command) {
    const key = memoryKey(dateKey, subjectKey, poolKey);
    if (command) {
      const slot = memoryCommands.get(memoryCommandKey(dateKey, subjectKey, poolKey, command.key));
      if (slot) {
        if (slot.requestHash !== command.requestHash) {
          return { kind: "conflict" };
        }
        return { kind: "replay", used: slot.usedAfter };
      }
    }
    const used = memoryRows.get(key) ?? 0;
    if (used >= limit) {
      return null;
    }
    const next = used + 1;
    memoryRows.set(key, next);
    if (command) {
      memoryCommands.set(memoryCommandKey(dateKey, subjectKey, poolKey, command.key), {
        requestHash: command.requestHash,
        usedAfter: next,
      });
    }
    return { kind: "fresh", used: next };
  },
  async refund(dateKey, subjectKey, poolKey) {
    const key = memoryKey(dateKey, subjectKey, poolKey);
    const next = Math.max(0, (memoryRows.get(key) ?? 0) - 1);
    memoryRows.set(key, next);
    return next;
  },
  forgetCommand(dateKey, subjectKey, poolKey, commandKey) {
    memoryCommands.delete(memoryCommandKey(dateKey, subjectKey, poolKey, commandKey));
    return Promise.resolve();
  },
  reset() {
    memoryRows.clear();
    memoryCommands.clear();
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
    async readOptional(dateKey, subjectKey, poolKey) {
      const row = await prisma.tezgahDailyQuota.findUnique({
        where: { dateKey_subjectKey_poolKey: { dateKey, subjectKey, poolKey } },
      });
      return row?.usedCount ?? null;
    },
    async tryConsume(dateKey, subjectKey, poolKey, limit, now, command) {
      // Y1 — komut eşlemesi artık VERİTABANINDA (`tezgah_quota_commands`).
      // Önceki sürüm süreç içi Map kullanıyordu: ikinci istek başka bir örneğe
      // düşerse sayaç ikinci kez düşüyordu.
      return prisma.$transaction(async (tx) => {
        const where = { dateKey_subjectKey_poolKey: { dateKey, subjectKey, poolKey } };
        if (command) {
          const seen = await tx.tezgahQuotaCommand.findUnique({
            where: {
              dateKey_subjectKey_poolKey_commandKey: {
                dateKey,
                subjectKey,
                poolKey,
                commandKey: command.key,
              },
            },
            select: { requestHash: true, usedAfter: true },
          });
          if (seen) {
            if (seen.requestHash !== command.requestHash) {
              return { kind: "conflict" as const };
            }
            return { kind: "replay" as const, used: seen.usedAfter };
          }
        }
        const existing = await tx.tezgahDailyQuota.findUnique({ where });
        let used: number | null = null;
        if (!existing) {
          try {
            await tx.tezgahDailyQuota.create({
              data: { dateKey, subjectKey, poolKey, usedCount: 1, updatedAt: now },
            });
            used = 1;
          } catch (error) {
            if (!isUniqueViolation(error)) {
              throw error;
            }
          }
        }
        if (used == null) {
          const updated = await tx.tezgahDailyQuota.updateMany({
            where: { dateKey, subjectKey, poolKey, usedCount: { lt: limit } },
            data: { usedCount: { increment: 1 }, updatedAt: now },
          });
          if (updated.count !== 1) {
            return null;
          }
          const next = await tx.tezgahDailyQuota.findUnique({ where });
          used = next?.usedCount ?? null;
        }
        if (used == null) {
          return null;
        }
        if (command) {
          // Eşzamanlı iki istek aynı anahtarla: ikincisi P2002 alır ve
          // işlem geri sarılır — sayaç bir kez artar.
          await tx.tezgahQuotaCommand.create({
            data: {
              dateKey,
              subjectKey,
              poolKey,
              commandKey: command.key,
              requestHash: command.requestHash,
              usedAfter: used,
              createdAt: now,
            },
          });
        }
        return { kind: "fresh" as const, used };
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
    async forgetCommand(dateKey, subjectKey, poolKey, commandKey) {
      // Kalıcı defterden silinir; iade sonrası yeniden deneme yeni düşüm alır.
      await prisma.tezgahQuotaCommand
        .deleteMany({ where: { dateKey, subjectKey, poolKey, commandKey } })
        .catch(() => undefined);
    },
    reset() {
      memoryRows.clear();
      memoryCommands.clear();
    },
  };
}

function memoryQuotaRuntime(): boolean {
  return process.env.NODE_ENV === "test" || process.env.VITEST === "true";
}

function activeStore(): QuotaStore {
  return memoryQuotaRuntime() ? memoryStore : prismaStore();
}

const ISTANBUL_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Istanbul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function istanbulParts(now: Date): { year: string; month: string; day: string } {
  const parts = ISTANBUL_DATE.formatToParts(startOfEuropeIstanbulDay(now));
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  if (!year || !month || !day) {
    throw new Error("Tezgâh periyot anahtarı hesaplanamadı.");
  }
  return { year, month, day };
}

/** İstanbul günü (`YYYY-MM-DD`). Misafir hattının periyodu. */
export function tezgahDayKey(now = new Date()): string {
  const { year, month, day } = istanbulParts(now);
  return `${year}-${month}-${day}`;
}

/** İstanbul ayı (`YYYY-MM`). Üye kredi havuzunun periyodu. */
export function tezgahMonthKey(now = new Date()): string {
  const { year, month } = istanbulParts(now);
  return `${year}-${month}`;
}

/** Bir ay geri: `2026-11` → `2026-10`, `2026-01` → `2025-12`. */
export function tezgahPreviousMonthKey(now = new Date()): string {
  const { year, month } = istanbulParts(now);
  const monthNumber = Number(month);
  const yearNumber = Number(year);
  if (monthNumber === 1) {
    return `${yearNumber - 1}-12`;
  }
  return `${yearNumber}-${String(monthNumber - 1).padStart(2, "0")}`;
}

/**
 * Faz 3 / S-01 — periyot anahtarı (tek kaynak).
 *
 * `tetkik` her zaman `lifetime` döner. `lite` havuzu üyede aylık (`YYYY-MM`),
 * misafirde günlük (`YYYY-MM-DD`) döner. `guest` verilmezse üye hattı varsayılır.
 */
export function tezgahQuotaPeriodKey(
  poolKey: TezgahPoolKey,
  now = new Date(),
  guest = false,
): string {
  if (poolKey === "tetkik") {
    return TEZGAH_TETKIK_DATE_KEY;
  }
  return guest ? tezgahDayKey(now) : tezgahMonthKey(now);
}

/** Geriye dönük ad. `tezgahQuotaPeriodKey(pool, now)` ile aynıdır (üye hattı). */
export function tezgahQuotaDateKey(poolKey: TezgahPoolKey, now = new Date()): string {
  return tezgahQuotaPeriodKey(poolKey, now);
}

/** Misafir `lite` tavanı. Günlük kalır; aylık havuza bağlanmaz. */
export function tezgahDailyLimit(guest: boolean): number {
  return guest ? TEZGAH_GUEST_DAILY_LIMIT : TEZGAH_FREE_MONTHLY_CREDITS;
}

/**
 * Taban tavan (devir hariç). `lite`: misafir günlük 3, üye aylık 30.
 * `tetkik` ömür boyu 1. `free_template` sayılmaz.
 */
export function tezgahPoolLimit(poolKey: TezgahPoolKey, guest: boolean): number {
  if (poolKey === "tetkik") {
    return TEZGAH_TETKIK_LIFETIME_LIMIT;
  }
  if (poolKey === "free_template") {
    return 1;
  }
  return tezgahDailyLimit(guest);
}

/**
 * B-02 / S-01: Pro hattı taban tavanı. Ücretsiz havuz (30) Pro'ya uygulanmaz.
 * `tetkik` havuzu Pro'da da ömür boyu 1'dir; ürün sözleşmesi değişmedi.
 */
export function tezgahProPoolLimit(poolKey: TezgahPoolKey): number {
  if (poolKey === "tetkik") {
    return TEZGAH_TETKIK_LIFETIME_LIMIT;
  }
  if (poolKey === "free_template") {
    return 1;
  }
  return TEZGAH_PRO_MONTHLY_CREDITS;
}

/**
 * Faz 3 / S-01 — aylık devir.
 *
 * Kullanılmayan aylık kredinin **%50'si** sonraki aya devreder, taban havuzun
 * **%50'siyle** sınırlıdır (30 → en çok 15, 500 → en çok 250).
 *
 * Kurallar (dürüstlük):
 * - Önceki ayda **hiç satır yoksa devir 0'dır.** Havuzu hiç açmamış yeni kullanıcı
 *   "kullanmadım" diye bedava kredi kazanmaz; devir yalnız gerçek artığı taşır.
 * - Devir zincirleme birikmez: taban + devir hesaplanırken devredilen kredi
 *   kullanılmamış sayılmaz — çünkü önceki ayın *kendi* tabanı okunur.
 * - `tetkik` ömür boyudur; devir yoktur.
 */
export function tezgahRolloverCredits(input: {
  baseLimit: number;
  previousUsed: number | null;
}): number {
  const base = Math.max(0, Math.trunc(input.baseLimit));
  if (base <= 0 || input.previousUsed == null) {
    return 0;
  }
  const used = Math.max(0, Math.trunc(input.previousUsed));
  const unused = Math.max(0, base - used);
  const carried = Math.floor((unused * TEZGAH_ROLLOVER_BPS) / 10_000);
  const cap = Math.floor((base * TEZGAH_ROLLOVER_CAP_BPS) / 10_000);
  return Math.max(0, Math.min(carried, cap));
}

function closedMessage(
  poolKey: TezgahPoolKey,
  guest: boolean,
  paywall: boolean,
  pro = false,
): string | null {
  if (poolKey === "tetkik") {
    if (guest) {
      return TEZGAH_TETKIK_GUEST_QUOTA_MESSAGE;
    }
    return paywall ? TEZGAH_MEMBER_PAID_MESSAGE : TEZGAH_TETKIK_MEMBER_QUOTA_MESSAGE;
  }
  if (guest) {
    return TEZGAH_GUEST_QUOTA_MESSAGE;
  }
  if (pro) {
    // B-02: Pro hattı "ücretsiz kredi doldu" demez; kendi cümlesini basar.
    return paywall ? TEZGAH_MEMBER_PAID_MESSAGE : TEZGAH_PRO_QUOTA_MESSAGE;
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
  rollover?: number;
  periodKey?: string;
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
    rollover: input.rollover ?? 0,
    periodKey: input.periodKey ?? "",
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

/**
 * Aktörün bu periyot için etkin tavanı: taban + devir.
 * Devir hatası tavanı taban yapar; kullanıcıya uydurma kredi basılmaz.
 */
async function effectiveLimitFor(input: {
  poolKey: TezgahPoolKey;
  guest: boolean;
  actorId: string;
  pro: boolean;
  now: Date;
}): Promise<{ limit: number; rollover: number }> {
  const baseLimit = input.pro
    ? tezgahProPoolLimit(input.poolKey)
    : tezgahPoolLimit(input.poolKey, input.guest);
  if (input.guest || input.poolKey !== "lite" || baseLimit <= 0) {
    return { limit: baseLimit, rollover: 0 };
  }
  let previousUsed: number | null = null;
  try {
    previousUsed = await activeStore().readOptional(
      tezgahPreviousMonthKey(input.now),
      input.actorId,
      input.poolKey,
    );
  } catch {
    previousUsed = null;
  }
  const rollover = tezgahRolloverCredits({ baseLimit, previousUsed });
  return { limit: baseLimit + rollover, rollover };
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
  const periodKey = tezgahQuotaPeriodKey(poolKey, now, guest);
  const proActive = !guest && (await readTezgahProActive(actorId, now));
  if (proActive) {
    // B-02 / S-01: Pro hattı kendi aylık tavanıyla (+devir) sayılır. Kota
    // `tezgah_daily_quotas` periyot satırında durur; ayın 1'inde yenilenir.
    const { limit: proLimit, rollover } = await effectiveLimitFor({
      poolKey,
      guest: false,
      actorId,
      pro: true,
      now,
    });
    let proUsed = 0;
    try {
      proUsed = await activeStore().read(periodKey, actorId, poolKey);
    } catch {
      proUsed = 0;
    }
    const proRemaining = Math.max(0, proLimit - proUsed);
    if (proRemaining > 0) {
      return snapshot({
        allowed: true,
        remaining: proRemaining,
        limit: proLimit,
        used: proUsed,
        guest: false,
        lane: "pro",
        poolKey,
        rollover,
        periodKey,
      });
    }
    // Pro hattı tükendi: kredi varsa kredi hattı, yoksa Pro cümlesi.
    const proCredit = await readTezgahCreditRemaining(actorId);
    if (proCredit && proCredit.remaining > 0 && proCredit.unitMinor > 0) {
      return snapshot({
        allowed: true,
        remaining: proCredit.remaining,
        limit: proCredit.remaining,
        used: 0,
        guest: false,
        lane: "credit",
        poolKey,
        rollover,
        periodKey,
      });
    }
    const proPack = await readTezgahPackAmount();
    return snapshot({
      allowed: false,
      remaining: 0,
      limit: proLimit,
      used: proUsed,
      guest: false,
      lane: "pro",
      poolKey,
      paywall: proPack != null,
      error: closedMessage(poolKey, false, proPack != null, true),
      status: 429,
      rollover,
      periodKey,
    });
  }
  const { limit, rollover } = await effectiveLimitFor({
    poolKey,
    guest,
    actorId,
    pro: false,
    now,
  });
  let used = 0;
  try {
    used = await activeStore().read(periodKey, actorId, poolKey);
  } catch {
    return snapshot({
      allowed: false,
      remaining: 0,
      limit,
      used: 0,
      guest,
      lane: "closed",
      poolKey,
      error: guest ? "Günlük hak okunamadı." : "Aylık kredi okunamadı.",
      status: 429,
      rollover,
      periodKey,
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
      rollover,
      periodKey,
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
        rollover,
        periodKey,
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
    rollover,
    periodKey,
  });
}

function commandConflictSnapshot(input: {
  remaining: number;
  limit: number;
  used: number;
  guest: boolean;
  poolKey: TezgahPoolKey;
  rollover?: number;
  periodKey?: string;
}): TezgahQuotaSnapshot {
  return snapshot({
    allowed: false,
    remaining: input.remaining,
    limit: input.limit,
    used: input.used,
    guest: input.guest,
    lane: "closed",
    poolKey: input.poolKey,
    paywall: true,
    error: "Bu Idempotency-Key başka bir üretimde.",
    status: 400,
    rollover: input.rollover,
    periodKey: input.periodKey,
  });
}

/** Başarılı üretimden önce hak düşer. Ücretsiz ve Pro hat sayacı artırır; aynı komut anahtarı ikinci kez sayılmaz. */
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
  const periodKey = tezgahQuotaPeriodKey(poolKey, now, guest);
  if (!guest && (await readTezgahProActive(actorId, now))) {
    // B-02 / S-01: Pro hattı gerçek aylık sayacı kullanır.
    const { limit: proLimit, rollover } = await effectiveLimitFor({
      poolKey,
      guest: false,
      actorId,
      pro: true,
      now,
    });
    let proOutcome: QuotaCommandOutcome = null;
    try {
      proOutcome = await activeStore().tryConsume(periodKey, actorId, poolKey, proLimit, now, command);
    } catch {
      return snapshot({
        allowed: false,
        remaining: 0,
        limit: proLimit,
        used: proLimit,
        guest: false,
        lane: "pro",
        poolKey,
        error: "Aylık Pro kredisi yazılamadı.",
        status: 429,
        rollover,
        periodKey,
      });
    }
    if (proOutcome?.kind === "conflict") {
      return commandConflictSnapshot({
        remaining: 0,
        limit: proLimit,
        used: proLimit,
        guest: false,
        poolKey,
        rollover,
        periodKey,
      });
    }
    if (proOutcome != null) {
      return snapshot({
        allowed: true,
        remaining: proLimit - proOutcome.used,
        limit: proLimit,
        used: proOutcome.used,
        guest: false,
        lane: "pro",
        poolKey,
        commandKey: command?.key ?? null,
        rollover,
        periodKey,
      });
    }
    // Pro tavanı doldu: kredi hattı varsa oraya düşer, yoksa Pro cümlesi basılır.
    const proCredit = await readTezgahCreditRemaining(actorId);
    const proPack = await readTezgahPackAmount();
    const noProCredit =
      !proCredit || proCredit.remaining <= 0 || proCredit.unitMinor <= 0 || proPack == null;
    if (noProCredit) {
      return snapshot({
        allowed: false,
        remaining: 0,
        limit: proLimit,
        used: proLimit,
        guest: false,
        lane: "pro",
        poolKey,
        paywall: proPack != null,
        error: closedMessage(poolKey, false, proPack != null, true),
        status: 429,
        rollover,
        periodKey,
      });
    }
    if (!command) {
      return snapshot({
        allowed: false,
        remaining: proCredit.remaining,
        limit: proLimit,
        used: proLimit,
        guest: false,
        lane: "closed",
        poolKey,
        paywall: true,
        error: "Ücretli üretim Idempotency-Key ister.",
        status: 400,
        rollover,
        periodKey,
      });
    }
    const proHold = await beginTezgahCreditHold({
      userId: actorId,
      commandKey: command.key,
      requestHash: command.requestHash,
      unitMinor: proCredit.unitMinor,
      now,
    });
    if (!proHold.ok) {
      return snapshot({
        allowed: false,
        remaining: 0,
        limit: proLimit,
        used: proLimit,
        guest: false,
        lane: "closed",
        poolKey,
        paywall: true,
        error: proHold.error,
        status: proHold.status,
        rollover,
        periodKey,
      });
    }
    return snapshot({
      allowed: true,
      remaining: Math.max(0, proCredit.remaining - 1),
      limit: proLimit,
      used: proLimit,
      guest: false,
      lane: "credit",
      poolKey,
      commandKey: command.key,
      hold: proHold.hold,
      rollover,
      periodKey,
    });
  }
  const { limit, rollover } = await effectiveLimitFor({
    poolKey,
    guest,
    actorId,
    pro: false,
    now,
  });
  let outcome: QuotaCommandOutcome = null;
  try {
    outcome = await activeStore().tryConsume(periodKey, actorId, poolKey, limit, now, command);
  } catch {
    return snapshot({
      allowed: false,
      remaining: 0,
      limit,
      used: limit,
      guest,
      lane: "closed",
      poolKey,
      error: guest ? "Günlük hak yazılamadı." : "Aylık kredi yazılamadı.",
      status: 429,
      rollover,
      periodKey,
    });
  }
  if (outcome?.kind === "conflict") {
    return commandConflictSnapshot({
      remaining: 0,
      limit,
      used: limit,
      guest,
      poolKey,
      rollover,
      periodKey,
    });
  }
  if (outcome != null) {
    return snapshot({
      allowed: true,
      remaining: limit - outcome.used,
      limit,
      used: outcome.used,
      guest,
      lane: "free",
      poolKey,
      commandKey: command?.key ?? null,
      rollover,
      periodKey,
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
      rollover,
      periodKey,
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
      rollover,
      periodKey,
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
      rollover,
      periodKey,
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
      rollover,
      periodKey,
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
    rollover,
    periodKey,
  });
}

/**
 * Model boş dönerse hak geri yazılır.
 * Ücretsiz ve Pro: sayaç decrement. Kredi: hold serbest (`releaseTezgahCredit`).
 * Komut anahtarı unutulur; aynı Idempotency-Key ile yeniden deneme yeni düşüm alır.
 */
export async function refundTezgahQuota(
  actorId: string,
  guest: boolean,
  now = new Date(),
  lane: TezgahLane = "free",
  poolKey: TezgahPoolKey = "lite",
  options: TezgahQuotaRefundOptions = {},
): Promise<TezgahQuotaSnapshot> {
  if (poolKey === "free_template") {
    return peekTezgahQuota(actorId, guest, now, poolKey);
  }
  const periodKey = tezgahQuotaPeriodKey(poolKey, now, guest);
  if (options.command?.key) {
    await activeStore().forgetCommand(periodKey, actorId, poolKey, options.command.key);
  }
  if (lane === "credit") {
    if (options.hold) {
      await releaseTezgahCredit({ userId: actorId, hold: options.hold, now });
    }
    return peekTezgahQuota(actorId, guest, now, poolKey);
  }
  if (lane !== "free" && lane !== "pro") {
    return peekTezgahQuota(actorId, guest, now, poolKey);
  }
  const pro = lane === "pro";
  const { limit, rollover } = await effectiveLimitFor({
    poolKey,
    guest,
    actorId,
    pro,
    now,
  });
  const used = await activeStore().refund(periodKey, actorId, poolKey, now);
  const remaining = Math.max(0, limit - used);
  return snapshot({
    allowed: remaining > 0,
    remaining,
    limit,
    used,
    guest,
    lane: pro ? "pro" : "free",
    poolKey,
    rollover,
    periodKey,
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
