import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import {
  UNATTRIBUTED_RATE_LIMIT_IDENTIFIER,
  startOfEuropeIstanbulDay,
  type BudgetShieldPort,
} from "@/lib/kernel/ai/budget-shield";

export type AiTokenUsageBudgetQuery = {
  sumCostMinorSince(since: Date): Promise<number>;
  sumUserTokensSince(userId: string, since: Date): Promise<number>;
  countUserRowsSince(userId: string, since: Date): Promise<number>;
};

type ProcessRateBucket = { resetAt: number; count: number };

const processRateBuckets = new Map<string, ProcessRateBucket>();

function requireNonNegativeInt(value: number, label: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Bütçe zırhı ${label} geçersiz.`);
  }
  return value;
}

function identifierFromRateKey(key: string): string {
  const withoutPrefix = key.startsWith("llm:") ? key.slice(4) : key;
  const colon = withoutPrefix.lastIndexOf(":");
  if (colon < 0) {
    return withoutPrefix;
  }
  return withoutPrefix.slice(colon + 1);
}

function bumpProcessRate(
  buckets: Map<string, ProcessRateBucket>,
  key: string,
  limit: number,
  windowMs: number,
  nowMs: number,
): boolean {
  const existing = buckets.get(key);
  if (!existing || nowMs >= existing.resetAt) {
    buckets.set(key, { resetAt: nowMs + windowMs, count: 1 });
    return 1 <= limit;
  }
  existing.count += 1;
  return existing.count <= limit;
}

export function createPrismaAiTokenUsageBudgetQuery(): AiTokenUsageBudgetQuery {
  return {
    async sumCostMinorSince(since) {
      const prisma = getPrisma();
      const result = await prisma.aiTokenUsage.aggregate({
        where: { createdAt: { gte: since } },
        _sum: { costMinor: true },
      });
      return requireNonNegativeInt(result._sum.costMinor ?? 0, "platform harcaması");
    },
    async sumUserTokensSince(userId, since) {
      const prisma = getPrisma();
      const result = await prisma.aiTokenUsage.aggregate({
        where: { userId, createdAt: { gte: since } },
        _sum: { totalTokens: true },
      });
      return requireNonNegativeInt(result._sum.totalTokens ?? 0, "kullanıcı token");
    },
    async countUserRowsSince(userId, since) {
      const prisma = getPrisma();
      const count = await prisma.aiTokenUsage.count({
        where: { userId, createdAt: { gte: since } },
      });
      return requireNonNegativeInt(count, "hız sayacı");
    },
  };
}

export type PrismaBudgetShieldOptions = {
  query?: AiTokenUsageBudgetQuery;
  now?: () => Date;
  rateBuckets?: Map<string, ProcessRateBucket>;
};

/**
 * Redis yok. Platform tavanı ve kullanıcı kotası `AiTokenUsage` günlük agregasından okunur.
 * Hız sınırı süreç içi kova + (kimlikli çağrıda) aynı tablonun pencere sayımı.
 * DB yoksa veya sorgu fırlatırsa fail-closed (guard-unavailable).
 */
export function createPrismaBudgetShieldPort(
  options: PrismaBudgetShieldOptions = {},
): BudgetShieldPort {
  const query = options.query ?? createPrismaAiTokenUsageBudgetQuery();
  const now = options.now ?? (() => new Date());
  const rateBuckets = options.rateBuckets ?? processRateBuckets;

  return {
    async checkRateLimit({ key, limit, windowMs }) {
      const instant = now();
      const nowMs = instant.getTime();
      if (!bumpProcessRate(rateBuckets, key, limit, windowMs, nowMs)) {
        return { allowed: false };
      }
      const identifier = identifierFromRateKey(key).trim();
      if (!identifier || identifier === UNATTRIBUTED_RATE_LIMIT_IDENTIFIER) {
        return { allowed: true };
      }
      const since = new Date(nowMs - windowMs);
      const dbCount = await query.countUserRowsSince(identifier, since);
      return { allowed: dbCount < limit };
    },
    async getPlatformDailySpendMinor() {
      return query.sumCostMinorSince(startOfEuropeIstanbulDay(now()));
    },
    async getUserDailyTokenUsage(userId) {
      const trimmed = userId.trim();
      if (!trimmed) {
        throw new Error("Bütçe zırhı kullanıcı kimliği boş.");
      }
      return query.sumUserTokensSince(trimmed, startOfEuropeIstanbulDay(now()));
    },
  };
}
