import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { createMemoryBudgetShieldPort } from "@/lib/kernel/ai/budget-shield";
import type { LlmProviderAdapter, ProviderGenerateImageResult } from "@/lib/kernel/ai/types";
import { STUDIO_GENERATION_UNIT_KEY, STUDIO_IMAGE_CATALOG_MISSING, STUDIO_IMAGE_UNIT_KEY, STUDIO_MODULE_KEY } from "@/lib/studio/types";
import { generateStudioContent } from "@/lib/studio/engine";
import { generateStudioImage } from "@/lib/studio/image-engine";
import { STUDIO_IMAGE_DATA_BASE64_MAX_CHARS } from "@/lib/studio/storage";
import { createMemoryLedgerStore, type MemoryLedgerStore } from "./memory-money";
import { createMemoryPriceCatalogStore } from "./memory-pricing";
import { createMemoryAiTokenUsageStore, createMemoryStudioStore } from "./memory-studio";
import { createMemoryPaidCommandStore, mintTestCommandKey } from "./memory-paid-command";
import type { StudioDigitalAssetRecord, StudioGenerationRecord } from "@/lib/studio/types";

export const E2E_STUDIO_USER_ID = "e2e-studio-smoke-user";
export const E2E_STUDIO_PLATFORM_ID = PLATFORM_TREASURY_USER_ID;
export const E2E_STUDIO_START_MINOR = 10_000;
export const E2E_STUDIO_TEXT_FLOOR = 100;
export const E2E_STUDIO_IMAGE_FLOOR = 250;

const PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

export type StudioCashJourneyResult = {
  ledger: MemoryLedgerStore;
  text: {
    generation: StudioGenerationRecord;
    debitMinor: number;
    remainingMinor: number;
    providerCalls: number;
  };
  image: {
    generation: StudioGenerationRecord;
    asset: StudioDigitalAssetRecord;
    debitMinor: number;
    remainingMinor: number;
    providerCalls: number;
  };
  ceiling: {
    threw: boolean;
    debitUnchanged: boolean;
    assetCount: number;
    balanceMinor: number;
  };
};

function fakeGemini(): LlmProviderAdapter & { textCalls: number; imageCalls: number } {
  const adapter: LlmProviderAdapter & { textCalls: number; imageCalls: number } = {
    id: "gemini",
    textCalls: 0,
    imageCalls: 0,
    async complete() {
      adapter.textCalls += 1;
      return {
        text: "mühürlü metin",
        usage: { promptTokens: 10, completionTokens: 4, totalTokens: 14 },
      };
    },
    async generateImage(): Promise<ProviderGenerateImageResult> {
      adapter.imageCalls += 1;
      return {
        mimeType: "image/png",
        dataBase64: PNG_B64,
        usage: { promptTokens: 8, completionTokens: 1, totalTokens: 9 },
      };
    },
  };
  return adapter;
}

/**
 * Studio LLM Debit yolu (bellek): metin debit + görsel artifact + 413'te debit yok.
 * Canlı Postgres/Auth/LLM istemez.
 */
export async function runStudioCashJourney(): Promise<StudioCashJourneyResult> {
  const adapter = fakeGemini();
  const ledger = createMemoryLedgerStore([
    { userId: E2E_STUDIO_USER_ID, amountMinor: E2E_STUDIO_START_MINOR },
    { userId: E2E_STUDIO_PLATFORM_ID, amountMinor: 0 },
  ]);
  const catalog = createMemoryPriceCatalogStore([
    {
      moduleKey: STUDIO_MODULE_KEY,
      unitKey: STUDIO_GENERATION_UNIT_KEY,
      amountMinor: E2E_STUDIO_TEXT_FLOOR,
    },
    {
      moduleKey: STUDIO_MODULE_KEY,
      unitKey: STUDIO_IMAGE_UNIT_KEY,
      amountMinor: E2E_STUDIO_IMAGE_FLOOR,
    },
  ]);
  const usageStore = createMemoryAiTokenUsageStore();
  const studio = createMemoryStudioStore();
  const commands = createMemoryPaidCommandStore();
  const ports = {
    ledger,
    catalog,
    usage: usageStore,
    studio,
    commands,
    llmDeps: {
      providers: { gemini: adapter },
      budgetPort: createMemoryBudgetShieldPort({ tokensByUser: {} }),
    },
  };

  const text = await generateStudioContent(ports, {
    userId: E2E_STUDIO_USER_ID,
    commandKey: mintTestCommandKey(),
    prompt: "Kısa bir iş ilanı taslağı yaz.",
    platformUserId: E2E_STUDIO_PLATFORM_ID,
    now: new Date("2026-08-15T20:10:00.000Z"),
  });

  const image = await generateStudioImage(ports, {
    userId: E2E_STUDIO_USER_ID,
    commandKey: mintTestCommandKey(),
    prompt: "Mühürlü 16:9 ray görseli.",
    platformUserId: E2E_STUDIO_PLATFORM_ID,
    now: new Date("2026-08-15T20:11:00.000Z"),
  });

  const balanceBeforeCeiling = ledger.snapshot(E2E_STUDIO_USER_ID).amountMinor;
  let threw = false;
  try {
    await generateStudioImage(
      {
        ...ports,
        generateImage: async () => ({
          provider: "gemini",
          model: "imagen",
          mimeType: "image/png",
          dataBase64: "A".repeat(STUDIO_IMAGE_DATA_BASE64_MAX_CHARS + 1),
          usage: { promptTokens: 8, completionTokens: 1, totalTokens: 9 },
        }),
      },
      {
        userId: E2E_STUDIO_USER_ID,
        commandKey: mintTestCommandKey(),
        prompt: "Dev görsel.",
        platformUserId: E2E_STUDIO_PLATFORM_ID,
      },
    );
  } catch {
    threw = true;
  }

  const assets = await studio.listDigitalAssetsForUser(E2E_STUDIO_USER_ID);
  const balanceAfterCeiling = ledger.snapshot(E2E_STUDIO_USER_ID).amountMinor;

  return {
    ledger,
    text: {
      generation: text.generation,
      debitMinor: text.debitMinor,
      remainingMinor: text.remainingMinor,
      providerCalls: adapter.textCalls,
    },
    image: {
      generation: image.generation,
      asset: image.asset,
      debitMinor: image.debitMinor,
      remainingMinor: image.remainingMinor,
      providerCalls: adapter.imageCalls,
    },
    ceiling: {
      threw,
      debitUnchanged: balanceAfterCeiling === balanceBeforeCeiling,
      assetCount: assets.length,
      balanceMinor: balanceAfterCeiling,
    },
  };
}

export type StudioImageCatalogMissingJourney = {
  status: number;
  error: string;
  providerCalls: number;
  balanceMinor: number;
  assetCount: number;
};

/**
 * Katalog satırı yok: vatandaş 4xx, debit yok, gümrük çağrılmaz.
 */
export async function runStudioImageCatalogMissingJourney(): Promise<StudioImageCatalogMissingJourney> {
  const adapter = fakeGemini();
  const ledger = createMemoryLedgerStore([
    { userId: E2E_STUDIO_USER_ID, amountMinor: E2E_STUDIO_START_MINOR },
    { userId: E2E_STUDIO_PLATFORM_ID, amountMinor: 0 },
  ]);
  const catalog = createMemoryPriceCatalogStore([
    {
      moduleKey: STUDIO_MODULE_KEY,
      unitKey: STUDIO_GENERATION_UNIT_KEY,
      amountMinor: E2E_STUDIO_TEXT_FLOOR,
    },
  ]);
  const usageStore = createMemoryAiTokenUsageStore();
  const studio = createMemoryStudioStore();
  const commands = createMemoryPaidCommandStore();
  const ports = {
    ledger,
    catalog,
    usage: usageStore,
    studio,
    commands,
    llmDeps: {
      providers: { gemini: adapter },
      budgetPort: createMemoryBudgetShieldPort({ tokensByUser: {} }),
    },
  };

  let status = 500;
  let error = "";
  try {
    await generateStudioImage(ports, {
      userId: E2E_STUDIO_USER_ID,
      commandKey: mintTestCommandKey(),
      prompt: "Mühürlü görsel.",
      platformUserId: E2E_STUDIO_PLATFORM_ID,
    });
  } catch (thrown) {
    error = thrown instanceof Error ? thrown.message : String(thrown);
    status = error === STUDIO_IMAGE_CATALOG_MISSING || error.includes("katalogda") ? 400 : 500;
  }

  return {
    status,
    error,
    providerCalls: adapter.imageCalls,
    balanceMinor: ledger.snapshot(E2E_STUDIO_USER_ID).amountMinor,
    assetCount: (await studio.listDigitalAssetsForUser(E2E_STUDIO_USER_ID)).length,
  };
}

export { STUDIO_IMAGE_CATALOG_MISSING };
