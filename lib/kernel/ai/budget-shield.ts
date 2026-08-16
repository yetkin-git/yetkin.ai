export const UNATTRIBUTED_RATE_LIMIT_IDENTIFIER = "unattributed";

export const GATEWAY_USER_DAILY_TOKEN_QUOTA = 200_000;

export const DEFAULT_PLATFORM_DAILY_AI_CAP_MINOR = 500_000;

export const DEFAULT_RATE_LIMIT = { limit: 30, windowMs: 60_000 } as const;

export const UNATTRIBUTED_RATE_LIMIT = { limit: 60, windowMs: 60_000 } as const;

/** Platform günü — Inngest cron ile aynı TZ. Türkiye'de DST yok (UTC+3). */
export const BUDGET_SHIELD_TIME_ZONE = "Europe/Istanbul";

export function startOfEuropeIstanbulDay(now = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUDGET_SHIELD_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  if (!year || !month || !day) {
    throw new Error("Europe/Istanbul gün başı hesaplanamadı.");
  }
  return new Date(`${year}-${month}-${day}T00:00:00+03:00`);
}

export type LlmGatewayDenialReason =
  | "rate-limit"
  | "guard-unavailable"
  | "user-quota"
  | "platform-cap";

export type BudgetVerdict =
  | { allowed: true }
  | { allowed: false; reason: LlmGatewayDenialReason };

export type BudgetShieldPort = {
  checkRateLimit(input: {
    key: string;
    limit: number;
    windowMs: number;
  }): Promise<{ allowed: boolean }>;
  getPlatformDailySpendMinor(): Promise<number>;
  getUserDailyTokenUsage(userId: string): Promise<number>;
};

export type BudgetShieldInput = {
  identifier?: string | null;
  userId?: string | null;
  source?: string | null;
  rateLimit?: { limit?: number; windowMs?: number; scope?: string };
  platformDailyCapMinor?: number;
  userDailyTokenQuota?: number;
};

export function resolvePlatformDailyAiCapMinor(
  envValue = process.env.AI_PLATFORM_DAILY_CAP_MINOR,
): number {
  const raw = envValue?.trim();
  if (!raw) {
    return DEFAULT_PLATFORM_DAILY_AI_CAP_MINOR;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return DEFAULT_PLATFORM_DAILY_AI_CAP_MINOR;
  }
  return parsed;
}

export function resolveBudgetIdentifier(input: BudgetShieldInput): string {
  const fromRate = input.identifier?.trim();
  if (fromRate) {
    return fromRate;
  }
  const fromUser = input.userId?.trim();
  if (fromUser) {
    return fromUser;
  }
  return UNATTRIBUTED_RATE_LIMIT_IDENTIFIER;
}

/**
 * Bütçe zırhı — ağdan önce, fail-closed.
 * Sıra: hız sınırı → platform günlük tavan → kullanıcı günlük token.
 */
export async function assertGatewayBudgetAllows(
  input: BudgetShieldInput,
  port: BudgetShieldPort,
): Promise<BudgetVerdict> {
  const identifier = resolveBudgetIdentifier(input);
  const isUnattributed = identifier === UNATTRIBUTED_RATE_LIMIT_IDENTIFIER;
  const fallback = isUnattributed ? UNATTRIBUTED_RATE_LIMIT : DEFAULT_RATE_LIMIT;
  const scope = input.rateLimit?.scope ?? input.source ?? "invoke";

  try {
    const rate = await port.checkRateLimit({
      key: `llm:${scope}:${identifier}`,
      limit: input.rateLimit?.limit ?? fallback.limit,
      windowMs: input.rateLimit?.windowMs ?? fallback.windowMs,
    });
    if (!rate.allowed) {
      return { allowed: false, reason: "rate-limit" };
    }
  } catch {
    return { allowed: false, reason: "guard-unavailable" };
  }

  const capMinor = input.platformDailyCapMinor ?? resolvePlatformDailyAiCapMinor();
  try {
    const spentMinor = await port.getPlatformDailySpendMinor();
    if (!Number.isInteger(spentMinor) || spentMinor < 0) {
      return { allowed: false, reason: "guard-unavailable" };
    }
    if (spentMinor >= capMinor) {
      return { allowed: false, reason: "platform-cap" };
    }
  } catch {
    return { allowed: false, reason: "guard-unavailable" };
  }

  const userId = input.userId?.trim();
  if (!userId) {
    return { allowed: true };
  }

  const quota = input.userDailyTokenQuota ?? GATEWAY_USER_DAILY_TOKEN_QUOTA;
  try {
    const tokensUsed = await port.getUserDailyTokenUsage(userId);
    if (!Number.isInteger(tokensUsed) || tokensUsed < 0) {
      return { allowed: false, reason: "guard-unavailable" };
    }
    return tokensUsed < quota
      ? { allowed: true }
      : { allowed: false, reason: "user-quota" };
  } catch {
    return { allowed: false, reason: "guard-unavailable" };
  }
}

/**
 * Yalnız test ve enjekte edilen yerel kova.
 * Üretim varsayılanı `createPrismaBudgetShieldPort` — çağrı başına boş bellek yasak.
 */
export function createMemoryBudgetShieldPort(seed?: {
  spentMinor?: number;
  tokensByUser?: Record<string, number>;
  rateCounts?: Record<string, number>;
}): BudgetShieldPort {
  const spentMinor = seed?.spentMinor ?? 0;
  const tokensByUser = { ...(seed?.tokensByUser ?? {}) };
  const rateCounts = { ...(seed?.rateCounts ?? {}) };
  return {
    async checkRateLimit({ key, limit }) {
      const next = (rateCounts[key] ?? 0) + 1;
      rateCounts[key] = next;
      return { allowed: next <= limit };
    },
    async getPlatformDailySpendMinor() {
      return spentMinor;
    },
    async getUserDailyTokenUsage(userId) {
      return tokensByUser[userId] ?? 0;
    },
  };
}
