import { describe, expect, it } from "vitest";
import { generateStudioContent } from "@/lib/studio/engine";
import { jsonFromUnknown } from "@/lib/kernel/http/json";
import {
  createPrismaBudgetShieldPort,
  type AiTokenUsageBudgetQuery,
} from "@/lib/kernel/ai/prisma-budget-shield";
import {
  DEFAULT_PLATFORM_DAILY_AI_CAP_MINOR,
  GATEWAY_USER_DAILY_TOKEN_QUOTA,
} from "@/lib/kernel/ai/budget-shield";
import { invokeLlm } from "@/lib/kernel/ai/llm-gateway";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import type { LlmProviderAdapter } from "@/lib/kernel/ai/types";
import { STUDIO_GENERATION_UNIT_KEY, STUDIO_MODULE_KEY } from "@/lib/studio/types";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryPriceCatalogStore } from "../helpers/memory-pricing";
import { createMemoryAiTokenUsageStore, createMemoryStudioStore } from "../helpers/memory-studio";

const USER = "e2e-studio-user";
const PLATFORM = PLATFORM_TREASURY_USER_ID;

function fakeQuery(seed?: {
  spentMinor?: number;
  tokensByUser?: Record<string, number>;
}): AiTokenUsageBudgetQuery {
  return {
    async sumCostMinorSince() {
      return seed?.spentMinor ?? 0;
    },
    async sumUserTokensSince(userId) {
      return seed?.tokensByUser?.[userId] ?? 0;
    },
    async countUserRowsSince() {
      return 0;
    },
  };
}

function fakeGemini(): LlmProviderAdapter & { calls: number } {
  const adapter = {
    id: "gemini" as const,
    calls: 0,
    async complete() {
      adapter.calls += 1;
      return {
        text: "sağlayıcıya gidilmemeli",
        usage: { promptTokens: 10, completionTokens: 4, totalTokens: 14 },
      };
    },
  };
  return adapter;
}

describe("E2E simülasyon: tavan doluyken Studio/LLM sağlayıcıya gitmez", () => {
  it("costMinor > 500_000 iken invokeLlm null döner, sağlayıcı çağrılmaz", async () => {
    const adapter = fakeGemini();
    const result = await invokeLlm(
      {
        provider: "gemini",
        role: "FAST_STREAM",
        system: "sys",
        user: "hello",
        billing: { userId: USER, source: "gateway" },
      },
      {
        providers: { gemini: adapter },
        budgetPort: createPrismaBudgetShieldPort({
          query: fakeQuery({ spentMinor: DEFAULT_PLATFORM_DAILY_AI_CAP_MINOR + 1 }),
          rateBuckets: new Map(),
        }),
      },
    );
    expect(result).toBeNull();
    expect(adapter.calls).toBe(0);
  });

  it("Studio üretimi tavan aşığında 4xx dürüst hata basar, debit ve sağlayıcı yoktur", async () => {
    const adapter = fakeGemini();
    const ledger = createMemoryLedgerStore([
      { userId: USER, amountMinor: 10_000 },
      { userId: PLATFORM, amountMinor: 0 },
    ]);
    const catalog = createMemoryPriceCatalogStore([
      {
        moduleKey: STUDIO_MODULE_KEY,
        unitKey: STUDIO_GENERATION_UNIT_KEY,
        amountMinor: 100,
      },
    ]);
    const usageStore = createMemoryAiTokenUsageStore();
    const studio = createMemoryStudioStore();

    let caught: unknown;
    try {
      await generateStudioContent(
        {
          ledger,
          catalog,
          usage: usageStore,
          studio,
          llmDeps: {
            providers: { gemini: adapter },
            budgetPort: createPrismaBudgetShieldPort({
              query: fakeQuery({
                spentMinor: DEFAULT_PLATFORM_DAILY_AI_CAP_MINOR + 1,
                tokensByUser: { [USER]: GATEWAY_USER_DAILY_TOKEN_QUOTA + 1 },
              }),
              rateBuckets: new Map(),
            }),
          },
        },
        {
          userId: USER,
          prompt: "Bir slogan üret.",
          platformUserId: PLATFORM,
        },
      );
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(Error);
    const response = jsonFromUnknown(caught);
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
    const body = (await response.json()) as { ok: boolean; error: string };
    expect(body.ok).toBe(false);
    expect(body.error).toMatch(/kota veya gümrük/);
    expect(adapter.calls).toBe(0);
    expect(usageStore.list()).toHaveLength(0);
    expect(ledger.snapshot(USER).amountMinor).toBe(10_000);
  });
});
