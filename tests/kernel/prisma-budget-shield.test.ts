import { describe, expect, it } from "vitest";
import { invokeLlm, generateImage } from "@/lib/kernel/ai/llm-gateway";
import {
  assertGatewayBudgetAllows,
  DEFAULT_PLATFORM_DAILY_AI_CAP_MINOR,
  GATEWAY_USER_DAILY_TOKEN_QUOTA,
} from "@/lib/kernel/ai/budget-shield";
import { createPrismaBudgetShieldPort } from "@/lib/kernel/ai/prisma-budget-shield";
import type { AiTokenUsageBudgetQuery } from "@/lib/kernel/ai/prisma-budget-shield";
import type { LlmProviderAdapter } from "@/lib/kernel/ai/types";

function fakeQuery(seed?: {
  spentMinor?: number;
  tokensByUser?: Record<string, number>;
  rowCountByUser?: Record<string, number>;
}): AiTokenUsageBudgetQuery {
  return {
    async sumCostMinorSince() {
      return seed?.spentMinor ?? 0;
    },
    async sumUserTokensSince(userId) {
      return seed?.tokensByUser?.[userId] ?? 0;
    },
    async countUserRowsSince(userId) {
      return seed?.rowCountByUser?.[userId] ?? 0;
    },
  };
}

type UsageRow = {
  userId: string;
  costMinor: number;
  totalTokens: number;
  createdAt: Date;
};

function timedQuery(rows: UsageRow[]): AiTokenUsageBudgetQuery {
  return {
    async sumCostMinorSince(since) {
      return rows
        .filter((row) => row.createdAt.getTime() >= since.getTime())
        .reduce((sum, row) => sum + row.costMinor, 0);
    },
    async sumUserTokensSince(userId, since) {
      return rows
        .filter((row) => row.userId === userId && row.createdAt.getTime() >= since.getTime())
        .reduce((sum, row) => sum + row.totalTokens, 0);
    },
    async countUserRowsSince(userId, since) {
      return rows.filter(
        (row) => row.userId === userId && row.createdAt.getTime() >= since.getTime(),
      ).length;
    },
  };
}

describe("Postgres AI bütçe zırhı", () => {
  it("AiTokenUsage günlük harcama tavanı ağa gitmeden platform-cap döner", async () => {
    const port = createPrismaBudgetShieldPort({
      query: fakeQuery({ spentMinor: DEFAULT_PLATFORM_DAILY_AI_CAP_MINOR }),
      rateBuckets: new Map(),
    });
    const verdict = await assertGatewayBudgetAllows({ identifier: "u1" }, port);
    expect(verdict).toEqual({ allowed: false, reason: "platform-cap" });
  });

  it("AiTokenUsage günlük token kotası ağa gitmeden user-quota döner", async () => {
    const port = createPrismaBudgetShieldPort({
      query: fakeQuery({ tokensByUser: { u1: GATEWAY_USER_DAILY_TOKEN_QUOTA } }),
      rateBuckets: new Map(),
    });
    const verdict = await assertGatewayBudgetAllows({ userId: "u1" }, port);
    expect(verdict).toEqual({ allowed: false, reason: "user-quota" });
  });

  it("çoklu süreç hızını AiTokenUsage pencere sayımı ile keser", async () => {
    const port = createPrismaBudgetShieldPort({
      query: fakeQuery({ rowCountByUser: { u1: 30 } }),
      rateBuckets: new Map(),
    });
    const verdict = await assertGatewayBudgetAllows(
      { userId: "u1", rateLimit: { limit: 30, windowMs: 60_000, scope: "studio:image" } },
      port,
    );
    expect(verdict).toEqual({ allowed: false, reason: "rate-limit" });
  });

  it("sorgu fırlatırsa guard-unavailable döner (fail-closed)", async () => {
    const port = createPrismaBudgetShieldPort({
      query: {
        async sumCostMinorSince() {
          throw new Error("DATABASE_URL tanımlı değil.");
        },
        async sumUserTokensSince() {
          return 0;
        },
        async countUserRowsSince() {
          return 0;
        },
      },
      rateBuckets: new Map(),
    });
    const verdict = await assertGatewayBudgetAllows({ identifier: "u1" }, port);
    expect(verdict).toEqual({ allowed: false, reason: "guard-unavailable" });
  });

  it("tavan altındayken izin verir", async () => {
    const port = createPrismaBudgetShieldPort({
      query: fakeQuery({
        spentMinor: DEFAULT_PLATFORM_DAILY_AI_CAP_MINOR - 1,
        tokensByUser: { u1: GATEWAY_USER_DAILY_TOKEN_QUOTA - 1 },
      }),
      rateBuckets: new Map(),
    });
    const verdict = await assertGatewayBudgetAllows({ userId: "u1" }, port);
    expect(verdict).toEqual({ allowed: true });
  });

  it("costMinor > 500_000 ve tokens > 200_000 ağa gitmeden keser", async () => {
    const capPort = createPrismaBudgetShieldPort({
      query: fakeQuery({ spentMinor: DEFAULT_PLATFORM_DAILY_AI_CAP_MINOR + 1 }),
      rateBuckets: new Map(),
    });
    expect(await assertGatewayBudgetAllows({ identifier: "u1" }, capPort)).toEqual({
      allowed: false,
      reason: "platform-cap",
    });

    const quotaPort = createPrismaBudgetShieldPort({
      query: fakeQuery({ tokensByUser: { u1: GATEWAY_USER_DAILY_TOKEN_QUOTA + 1 } }),
      rateBuckets: new Map(),
    });
    expect(await assertGatewayBudgetAllows({ userId: "u1" }, quotaPort)).toEqual({
      allowed: false,
      reason: "user-quota",
    });
  });

  it("Istanbul gün kesitinden önceki harcamayı yeni güne taşımaz", async () => {
    const istanbulMidnightUtc = new Date("2026-08-13T21:00:00.000Z");
    const previousDaySpend: UsageRow = {
      userId: "u1",
      costMinor: DEFAULT_PLATFORM_DAILY_AI_CAP_MINOR + 1,
      totalTokens: GATEWAY_USER_DAILY_TOKEN_QUOTA + 1,
      createdAt: new Date("2026-08-13T20:59:59.000Z"),
    };
    const afterCut = createPrismaBudgetShieldPort({
      query: timedQuery([previousDaySpend]),
      now: () => istanbulMidnightUtc,
      rateBuckets: new Map(),
    });
    expect(await assertGatewayBudgetAllows({ userId: "u1" }, afterCut)).toEqual({
      allowed: true,
    });

    const beforeCut = createPrismaBudgetShieldPort({
      query: timedQuery([previousDaySpend]),
      now: () => new Date("2026-08-13T20:59:59.000Z"),
      rateBuckets: new Map(),
    });
    expect(await assertGatewayBudgetAllows({ identifier: "u1" }, beforeCut)).toEqual({
      allowed: false,
      reason: "platform-cap",
    });
  });
});

const fakeGemini: LlmProviderAdapter & { calls: number } = {
  id: "gemini",
  calls: 0,
  async complete() {
    fakeGemini.calls += 1;
    return {
      text: "mühür",
      usage: { promptTokens: 10, completionTokens: 4, totalTokens: 14 },
    };
  },
};

describe("invokeLlm / generateImage Prisma zırhı ağdan önce keser", () => {
  it("platform tavanı doluyken sağlayıcıyı çağırmaz", async () => {
    fakeGemini.calls = 0;
    const result = await invokeLlm(
      {
        provider: "gemini",
        role: "FAST_STREAM",
        system: "sys",
        user: "hello",
        billing: { userId: "u1", source: "gateway" },
      },
      {
        providers: { gemini: fakeGemini },
        budgetPort: createPrismaBudgetShieldPort({
          query: fakeQuery({ spentMinor: DEFAULT_PLATFORM_DAILY_AI_CAP_MINOR }),
          rateBuckets: new Map(),
        }),
      },
    );
    expect(result).toBeNull();
    expect(fakeGemini.calls).toBe(0);
  });

  it("kullanıcı kotası doluyken generateImage sağlayıcıyı çağırmaz", async () => {
    let imageCalls = 0;
    const withImage: LlmProviderAdapter = {
      id: "gemini",
      async complete() {
        return {
          text: "x",
          usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        };
      },
      async generateImage() {
        imageCalls += 1;
        return {
          mimeType: "image/png",
          dataBase64: "aaaa",
          usage: { promptTokens: 2, completionTokens: 1, totalTokens: 3 },
        };
      },
    };
    const result = await generateImage(
      {
        provider: "gemini",
        role: "IMAGE_GEN",
        prompt: "ray",
        billing: { userId: "u1", source: "studio" },
      },
      {
        providers: { gemini: withImage },
        budgetPort: createPrismaBudgetShieldPort({
          query: fakeQuery({ tokensByUser: { u1: GATEWAY_USER_DAILY_TOKEN_QUOTA } }),
          rateBuckets: new Map(),
        }),
      },
    );
    expect(result).toBeNull();
    expect(imageCalls).toBe(0);
  });
});
