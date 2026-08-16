import { describe, expect, it } from "vitest";
import {
  assertGatewayBudgetAllows,
  createMemoryBudgetShieldPort,
  startOfEuropeIstanbulDay,
} from "@/lib/kernel/ai/budget-shield";

describe("AI budget shield", () => {
  it("hız sınırı → tavan → kota sırasıyla fail-closed çalışır", async () => {
    const rate = await assertGatewayBudgetAllows(
      { identifier: "u1", rateLimit: { limit: 1, windowMs: 60_000 } },
      createMemoryBudgetShieldPort({ rateCounts: { "llm:invoke:u1": 1 } }),
    );
    expect(rate).toEqual({ allowed: false, reason: "rate-limit" });

    const cap = await assertGatewayBudgetAllows(
      { identifier: "u1", platformDailyCapMinor: 100 },
      createMemoryBudgetShieldPort({ spentMinor: 100 }),
    );
    expect(cap).toEqual({ allowed: false, reason: "platform-cap" });

    const quota = await assertGatewayBudgetAllows(
      { userId: "u1", userDailyTokenQuota: 10 },
      createMemoryBudgetShieldPort({ tokensByUser: { u1: 10 } }),
    );
    expect(quota).toEqual({ allowed: false, reason: "user-quota" });
  });

  it("kimliği olmayan çağrıyı unattributed kovaya düşürür", async () => {
    const port = createMemoryBudgetShieldPort();
    const first = await assertGatewayBudgetAllows(
      { rateLimit: { limit: 1, windowMs: 1000 } },
      port,
    );
    const second = await assertGatewayBudgetAllows(
      { rateLimit: { limit: 1, windowMs: 1000 } },
      port,
    );
    expect(first.allowed).toBe(true);
    expect(second).toEqual({ allowed: false, reason: "rate-limit" });
  });

  it("port fırlatırsa guard-unavailable döner", async () => {
    const denied = await assertGatewayBudgetAllows(
      { identifier: "u1" },
      {
        async checkRateLimit() {
          throw new Error("redis down");
        },
        async getPlatformDailySpendMinor() {
          return 0;
        },
        async getUserDailyTokenUsage() {
          return 0;
        },
      },
    );
    expect(denied).toEqual({ allowed: false, reason: "guard-unavailable" });
  });

  it("tavan ve kota eşitlikte ve aşığında keser; tam altında izin verir", async () => {
    expect(
      await assertGatewayBudgetAllows(
        { identifier: "u1" },
        createMemoryBudgetShieldPort({ spentMinor: 500_000 }),
      ),
    ).toEqual({ allowed: false, reason: "platform-cap" });
    expect(
      await assertGatewayBudgetAllows(
        { identifier: "u1" },
        createMemoryBudgetShieldPort({ spentMinor: 500_001 }),
      ),
    ).toEqual({ allowed: false, reason: "platform-cap" });
    expect(
      await assertGatewayBudgetAllows(
        { identifier: "u1" },
        createMemoryBudgetShieldPort({ spentMinor: 499_999 }),
      ),
    ).toEqual({ allowed: true });

    expect(
      await assertGatewayBudgetAllows(
        { userId: "u1" },
        createMemoryBudgetShieldPort({ tokensByUser: { u1: 200_000 } }),
      ),
    ).toEqual({ allowed: false, reason: "user-quota" });
    expect(
      await assertGatewayBudgetAllows(
        { userId: "u1" },
        createMemoryBudgetShieldPort({ tokensByUser: { u1: 200_001 } }),
      ),
    ).toEqual({ allowed: false, reason: "user-quota" });
    expect(
      await assertGatewayBudgetAllows(
        { userId: "u1" },
        createMemoryBudgetShieldPort({ tokensByUser: { u1: 199_999 } }),
      ),
    ).toEqual({ allowed: true });
  });

  it("Europe/Istanbul gün başını UTC+3 olarak hesaplar", () => {
    const afternoonUtc = new Date("2026-08-14T12:00:00.000Z");
    expect(startOfEuropeIstanbulDay(afternoonUtc).toISOString()).toBe(
      "2026-08-13T21:00:00.000Z",
    );
    const beforeIstanbulMidnight = new Date("2026-08-13T20:59:59.000Z");
    expect(startOfEuropeIstanbulDay(beforeIstanbulMidnight).toISOString()).toBe(
      "2026-08-12T21:00:00.000Z",
    );
  });

  it("Istanbul gün kesitinde 21:00Z yeni gündür; TR DST yoktur", () => {
    const lastTickPrevDay = new Date("2026-08-13T20:59:59.999Z");
    const firstTickNewDay = new Date("2026-08-13T21:00:00.000Z");
    expect(startOfEuropeIstanbulDay(lastTickPrevDay).toISOString()).toBe(
      "2026-08-12T21:00:00.000Z",
    );
    expect(startOfEuropeIstanbulDay(firstTickNewDay).toISOString()).toBe(
      "2026-08-13T21:00:00.000Z",
    );
    const january = new Date("2026-01-15T20:59:59.000Z");
    const july = new Date("2026-07-15T20:59:59.000Z");
    expect(startOfEuropeIstanbulDay(january).toISOString()).toBe("2026-01-14T21:00:00.000Z");
    expect(startOfEuropeIstanbulDay(july).toISOString()).toBe("2026-07-14T21:00:00.000Z");
  });
});
