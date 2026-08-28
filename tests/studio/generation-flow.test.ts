import { describe, expect, it } from "vitest";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { createMemoryBudgetShieldPort, GATEWAY_USER_DAILY_TOKEN_QUOTA } from "@/lib/kernel/ai/budget-shield";
import type { LlmProviderAdapter, LlmUsage } from "@/lib/kernel/ai/types";
import { STUDIO_GENERATION_UNIT_KEY, STUDIO_MODULE_KEY } from "@/lib/studio/types";
import { generateStudioContent } from "@/lib/studio/engine";
import { resolveStudioDebitMinor } from "@/lib/studio/billing";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryPriceCatalogStore } from "../helpers/memory-pricing";
import { createMemoryAiTokenUsageStore, createMemoryStudioStore } from "../helpers/memory-studio";
import { createMemoryPaidCommandStore, mintTestCommandKey } from "../helpers/memory-paid-command";
import { ConflictError } from "@/lib/kernel/http/errors";

const USER = "studio-user-1";
const PLATFORM = PLATFORM_TREASURY_USER_ID;
const CATALOG_FLOOR = 100;
const LIGHT_USAGE: LlmUsage = { promptTokens: 10, completionTokens: 4, totalTokens: 14 };
const HEAVY_USAGE: LlmUsage = {
  promptTokens: 4_000_000,
  completionTokens: 0,
  totalTokens: 4_000_000,
};

function fakeGemini(usage: LlmUsage, text = "mühürlü metin"): LlmProviderAdapter & { calls: number } {
  const adapter = {
    id: "gemini" as const,
    calls: 0,
    async complete() {
      adapter.calls += 1;
      return { text, usage };
    },
  };
  return adapter;
}

function world(input?: {
  buyerBalance?: number;
  usage?: LlmUsage;
  tokensUsed?: number;
  catalogFloor?: number;
}) {
  const usage = input?.usage ?? LIGHT_USAGE;
  const adapter = fakeGemini(usage);
  const ledger = createMemoryLedgerStore([
    { userId: USER, amountMinor: input?.buyerBalance ?? 10_000 },
    { userId: PLATFORM, amountMinor: 0 },
  ]);
  const catalog = createMemoryPriceCatalogStore([
    {
      moduleKey: STUDIO_MODULE_KEY,
      unitKey: STUDIO_GENERATION_UNIT_KEY,
      amountMinor: input?.catalogFloor ?? CATALOG_FLOOR,
    },
  ]);
  const usageStore = createMemoryAiTokenUsageStore();
  const studio = createMemoryStudioStore();
  const commands = createMemoryPaidCommandStore();
  return {
    adapter,
    ledger,
    usageStore,
    studio,
    ports: {
      ledger,
      catalog,
      usage: usageStore,
      studio,
      commands,
      llmDeps: {
        providers: { gemini: adapter },
        budgetPort: createMemoryBudgetShieldPort({
          tokensByUser: input?.tokensUsed != null ? { [USER]: input.tokensUsed } : {},
        }),
      },
    },
  };
}

describe("studio üretim ve jeton debiti", () => {
  it("invokeLlm + AiTokenUsage + cüzdan debit: alıcı düşer, hazine alır, taslak yazılır", async () => {
    const ctx = world();
    const result = await generateStudioContent(ctx.ports, {
      userId: USER,
      commandKey: mintTestCommandKey(),
      prompt: "Kısa bir iş ilanı taslağı yaz.",
      platformUserId: PLATFORM,
      now: new Date("2026-08-14T00:00:00.000Z"),
    });

    expect(ctx.adapter.calls).toBe(1);
    expect(result.generation.status).toBe("SUCCEEDED");
    expect(result.generation.outputText).toBe("mühürlü metin");
    expect(result.generation.usageId).toBeTruthy();
    expect(result.generation.ledgerDebitKey).toBe(`studio-debit:${result.generation.id}`);
    expect(result.debitMinor).toBe(CATALOG_FLOOR);
    expect(result.remainingMinor).toBe(9_900);
    expect(result.generation.costMinor).toBe(0);
    expect(ctx.ledger.snapshot(USER).amountMinor).toBe(9_900);
    expect(ctx.ledger.snapshot(PLATFORM).amountMinor).toBe(CATALOG_FLOOR);

    const usages = ctx.usageStore.list();
    expect(usages).toHaveLength(1);
    expect(usages[0]?.source).toBe("studio");
    expect(usages[0]?.totalTokens).toBe(14);
    expect(usages[0]?.id).toBe(result.generation.usageId);

    const pulse = await ctx.studio.pulseForUser(USER);
    expect(pulse.draftsCount).toBe(1);
    expect(pulse.generationsSucceeded).toBe(1);
  });

  it("token maliyeti katalog tabanını aşınca debit token maliyetidir", async () => {
    const ctx = world({ usage: HEAVY_USAGE });
    const expectedDebit = resolveStudioDebitMinor(HEAVY_USAGE, CATALOG_FLOOR);
    expect(expectedDebit).toBe(200);

    const result = await generateStudioContent(ctx.ports, {
      userId: USER,
      commandKey: mintTestCommandKey(),
      prompt: "Uzun bir rapor özeti yaz.",
      platformUserId: PLATFORM,
    });

    expect(result.generation.costMinor).toBe(200);
    expect(result.debitMinor).toBe(200);
    expect(result.remainingMinor).toBe(9_800);
    expect(ctx.ledger.snapshot(USER).amountMinor).toBe(9_800);
    expect(ctx.ledger.snapshot(PLATFORM).amountMinor).toBe(200);
  });

  it("yetersiz bakiyede LLM çağrılmaz, usage ve generation yazılmaz", async () => {
    const ctx = world({ buyerBalance: 50 });
    await expect(
      generateStudioContent(ctx.ports, {
        userId: USER,
        commandKey: mintTestCommandKey(),
        prompt: "Bir slogan üret.",
        platformUserId: PLATFORM,
      }),
    ).rejects.toThrow(/Yetersiz bakiye/);

    expect(ctx.adapter.calls).toBe(0);
    expect(ctx.usageStore.list()).toHaveLength(0);
    expect(await ctx.studio.listGenerationsForUser(USER)).toHaveLength(0);
    expect(await ctx.studio.listDraftsForUser(USER)).toHaveLength(0);
    expect(ctx.ledger.snapshot(USER).amountMinor).toBe(50);
    expect(ctx.ledger.snapshot(PLATFORM).amountMinor).toBe(0);
  });

  it("günlük kota doluysa gümrük fail-closed durur, debit yoktur", async () => {
    const ctx = world({ tokensUsed: GATEWAY_USER_DAILY_TOKEN_QUOTA });
    await expect(
      generateStudioContent(ctx.ports, {
        userId: USER,
        commandKey: mintTestCommandKey(),
        prompt: "Bir slogan üret.",
        platformUserId: PLATFORM,
      }),
    ).rejects.toThrow(/kota veya gümrük/);

    expect(ctx.adapter.calls).toBe(0);
    expect(ctx.usageStore.list()).toHaveLength(0);
    expect(await ctx.studio.listGenerationsForUser(USER)).toHaveLength(0);
    expect(ctx.ledger.snapshot(USER).amountMinor).toBe(10_000);
    expect(ctx.ledger.snapshot(PLATFORM).amountMinor).toBe(0);
  });

  it("aynı Idempotency-Key ikinci debit ve ikinci LLM çağrısı doğurmaz", async () => {
    const ctx = world();
    const commandKey = mintTestCommandKey();
    const command = {
      userId: USER,
      commandKey,
      prompt: "Kısa bir iş ilanı taslağı yaz.",
      platformUserId: PLATFORM,
    };
    const first = await generateStudioContent(ctx.ports, command);
    const second = await generateStudioContent(ctx.ports, command);
    expect(ctx.adapter.calls).toBe(1);
    expect(second.generation.id).toBe(first.generation.id);
    expect(second.generation.id).toBe(commandKey);
    expect(ctx.ledger.snapshot(USER).amountMinor).toBe(9_900);
    expect(ctx.ledger.snapshot(PLATFORM).amountMinor).toBe(CATALOG_FLOOR);
    await expect(
      generateStudioContent(ctx.ports, { ...command, prompt: "Farklı gövde." }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(ctx.adapter.calls).toBe(1);
    expect(ctx.ledger.snapshot(USER).amountMinor).toBe(9_900);
  });
});
