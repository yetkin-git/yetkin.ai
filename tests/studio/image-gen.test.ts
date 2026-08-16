import { describe, expect, it } from "vitest";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { createMemoryBudgetShieldPort, GATEWAY_USER_DAILY_TOKEN_QUOTA } from "@/lib/kernel/ai/budget-shield";
import type { LlmProviderAdapter, ProviderGenerateImageResult } from "@/lib/kernel/ai/types";
import { STUDIO_IMAGE_CATALOG_MISSING, STUDIO_IMAGE_UNIT_KEY, STUDIO_MODULE_KEY } from "@/lib/studio/types";
import { generateStudioImage, studioImageContentHash } from "@/lib/studio/image-engine";
import { STUDIO_IMAGE_DATA_BASE64_MAX_CHARS } from "@/lib/studio/storage";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryPriceCatalogStore } from "../helpers/memory-pricing";
import { createMemoryAiTokenUsageStore, createMemoryStudioStore } from "../helpers/memory-studio";

const USER = "studio-image-user";
const PLATFORM = PLATFORM_TREASURY_USER_ID;
const CATALOG_FLOOR = 250;
/** 1×1 PNG */
const PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

function fakeImagen(dataBase64 = PNG_B64): LlmProviderAdapter & { calls: number } {
  const adapter: LlmProviderAdapter & { calls: number } = {
    id: "gemini",
    calls: 0,
    async complete() {
      return { text: "metin değil", usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 } };
    },
    async generateImage(): Promise<ProviderGenerateImageResult> {
      adapter.calls += 1;
      return {
        mimeType: "image/png",
        dataBase64,
        usage: { promptTokens: 8, completionTokens: 1, totalTokens: 9 },
      };
    },
  };
  return adapter;
}

function world(input?: { buyerBalance?: number; tokensUsed?: number; catalogFloor?: number }) {
  const adapter = fakeImagen();
  const ledger = createMemoryLedgerStore([
    { userId: USER, amountMinor: input?.buyerBalance ?? 10_000 },
    { userId: PLATFORM, amountMinor: 0 },
  ]);
  const catalog = createMemoryPriceCatalogStore([
    {
      moduleKey: STUDIO_MODULE_KEY,
      unitKey: STUDIO_IMAGE_UNIT_KEY,
      amountMinor: input?.catalogFloor ?? CATALOG_FLOOR,
    },
  ]);
  const usageStore = createMemoryAiTokenUsageStore();
  const studio = createMemoryStudioStore();
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
      llmDeps: {
        providers: { gemini: adapter },
        budgetPort: createMemoryBudgetShieldPort({
          tokensByUser: input?.tokensUsed != null ? { [USER]: input.tokensUsed } : {},
        }),
      },
    },
  };
}

describe("studio IMAGE_GEN debit ve telif hash", () => {
  it("generateImage + AiTokenUsage + cüzdan debit + StudioDigitalAsset SHA256", async () => {
    const ctx = world();
    const result = await generateStudioImage(ctx.ports, {
      userId: USER,
      prompt: "Mühürlü 16:9 ray görseli.",
      platformUserId: PLATFORM,
      now: new Date("2026-08-14T12:00:00.000Z"),
    });

    expect(ctx.adapter.calls).toBe(1);
    expect(result.generation.roleKey).toBe("IMAGE_GEN");
    expect(result.generation.status).toBe("SUCCEEDED");
    expect(result.debitMinor).toBe(CATALOG_FLOOR);
    expect(result.remainingMinor).toBe(10_000 - CATALOG_FLOOR);
    expect(ctx.ledger.snapshot(USER).amountMinor).toBe(10_000 - CATALOG_FLOOR);
    expect(ctx.ledger.snapshot(PLATFORM).amountMinor).toBe(CATALOG_FLOOR);

    const usages = ctx.usageStore.list();
    expect(usages).toHaveLength(1);
    expect(usages[0]?.roleKey).toBe("IMAGE_GEN");
    expect(usages[0]?.source).toBe("studio");

    expect(result.asset.assetType).toBe("IMAGE");
    expect(result.asset.contentHash).toBe(studioImageContentHash(PNG_B64));
    expect(result.asset.contentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.asset.generationId).toBe(result.generation.id);
    expect(await ctx.studio.getDigitalAssetByGenerationId(result.generation.id)).not.toBeNull();
  });

  it("yetersiz bakiyede generateImage çağrılmaz", async () => {
    const ctx = world({ buyerBalance: 50 });
    await expect(
      generateStudioImage(ctx.ports, {
        userId: USER,
        prompt: "Küçük görsel.",
        platformUserId: PLATFORM,
      }),
    ).rejects.toThrow(/Yetersiz bakiye/);
    expect(ctx.adapter.calls).toBe(0);
    expect(ctx.usageStore.list()).toHaveLength(0);
    expect(await ctx.studio.listDigitalAssetsForUser(USER)).toHaveLength(0);
    expect(ctx.ledger.snapshot(USER).amountMinor).toBe(50);
  });

  it("günlük kota doluysa gümrük fail-closed, debit yok", async () => {
    const ctx = world({ tokensUsed: GATEWAY_USER_DAILY_TOKEN_QUOTA });
    await expect(
      generateStudioImage(ctx.ports, {
        userId: USER,
        prompt: "Küçük görsel.",
        platformUserId: PLATFORM,
      }),
    ).rejects.toThrow(/kota veya gümrük/);
    expect(ctx.adapter.calls).toBe(0);
    expect(ctx.ledger.snapshot(USER).amountMinor).toBe(10_000);
  });

  it("Base64 tavanı aşınca debit ve satır yok", async () => {
    const ctx = world();
    await expect(
      generateStudioImage(
        {
          ...ctx.ports,
          generateImage: async () => ({
            provider: "gemini",
            model: "imagen",
            mimeType: "image/png",
            dataBase64: "A".repeat(STUDIO_IMAGE_DATA_BASE64_MAX_CHARS + 1),
            usage: { promptTokens: 8, completionTokens: 1, totalTokens: 9 },
          }),
        },
        {
          userId: USER,
          prompt: "Dev görsel.",
          platformUserId: PLATFORM,
        },
      ),
    ).rejects.toThrow(/tavanı aşıldı/);
    expect(ctx.ledger.snapshot(USER).amountMinor).toBe(10_000);
    expect(await ctx.studio.listDigitalAssetsForUser(USER)).toHaveLength(0);
  });

  it("katalog yokken vatandaş dili, generateImage ve debit yok", async () => {
    const ctx = world();
    ctx.ports.catalog = createMemoryPriceCatalogStore([]);
    await expect(
      generateStudioImage(ctx.ports, {
        userId: USER,
        prompt: "Mühürlü görsel.",
        platformUserId: PLATFORM,
      }),
    ).rejects.toThrow(STUDIO_IMAGE_CATALOG_MISSING);
    expect(ctx.adapter.calls).toBe(0);
    expect(ctx.usageStore.list()).toHaveLength(0);
    expect(await ctx.studio.listDigitalAssetsForUser(USER)).toHaveLength(0);
    expect(ctx.ledger.snapshot(USER).amountMinor).toBe(10_000);
    expect(ctx.ledger.snapshot(PLATFORM).amountMinor).toBe(0);
  });
});
