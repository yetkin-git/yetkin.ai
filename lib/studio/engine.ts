import { randomUUID } from "node:crypto";
import { appendLedgerEntry } from "@/lib/kernel/ledger/engine";
import type { LedgerStore } from "@/lib/kernel/ledger/types";
import { resolvePlatformTreasuryUserId } from "@/lib/kernel/escrow/engine";
import type { PriceCatalogStore } from "@/lib/kernel/pricing/catalog";
import { SETTLEMENT_CURRENCY, assertSameCurrency } from "@/lib/kernel/money/currency";
import { invokeLlm, type InvokeLlmDeps } from "@/lib/kernel/ai/llm-gateway";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import type { AiTokenUsageStore } from "@/lib/kernel/ai/usage-store";
import type { InvokeLlmInput, LlmGatewayResult } from "@/lib/kernel/ai/types";
import { STUDIO_PROMPT_MAX_CHARS } from "@/lib/studio/schemas";
import {
  estimatePromptTokenUsage,
  resolveStudioDebitMinor,
  toStudioCostMinor,
} from "@/lib/studio/billing";
import {
  STUDIO_GENERATION_ROLE,
  STUDIO_GENERATION_UNIT_KEY,
  STUDIO_MODULE_KEY,
  type StudioDraftRecord,
  type StudioGenerationRecord,
  type StudioStore,
} from "@/lib/studio/types";

export const STUDIO_SYSTEM_PROMPT =
  "Sen Yetkin Rail Studio üretim kapısısın. Kullanıcının metin talebine kısa, net, Türkçe içerik üret. Yazılım IDE’si, DevLabs tezgâhı veya sahte canlı iddia üretme.";

export type StudioLlmInvoker = (
  input: InvokeLlmInput,
  deps?: InvokeLlmDeps,
) => Promise<LlmGatewayResult | null>;

export type StudioSettleWritePorts = {
  ledger: LedgerStore;
  usage: AiTokenUsageStore;
  studio: StudioStore;
};

export type StudioEnginePorts = {
  ledger: LedgerStore;
  catalog: PriceCatalogStore;
  usage: AiTokenUsageStore;
  studio: StudioStore;
  invokeLlm?: StudioLlmInvoker;
  llmDeps?: InvokeLlmDeps;
  /**
   * Token defteri + cüzdan debit/credit + generation insert tek atomik birim.
   * LLM çağrısı dışarıda kalır. Prisma: `$transaction`.
   */
  runSettleAtomic?: <T>(work: (tx: StudioSettleWritePorts) => Promise<T>) => Promise<T>;
};

export type CreateStudioDraftCommand = {
  userId: string;
  prompt: string;
  title?: string;
  now?: Date;
};

export type GenerateStudioContentCommand = {
  userId: string;
  prompt: string;
  draftId?: string;
  title?: string;
  platformUserId?: string;
  now?: Date;
};

export type StudioGenerationResult = {
  draft: StudioDraftRecord;
  generation: StudioGenerationRecord;
  debitMinor: StudioGenerationRecord["debitMinor"];
  remainingMinor: StudioGenerationRecord["debitMinor"];
};

function studioDebitKey(generationId: string): string {
  return `studio-debit:${generationId}`;
}

function studioCreditKey(generationId: string): string {
  return `studio-credit:${generationId}`;
}

function studioUsageKey(generationId: string): string {
  return `studio-usage:${generationId}`;
}

export async function withStudioSettle<T>(
  ports: StudioEnginePorts,
  work: (tx: StudioSettleWritePorts) => Promise<T>,
): Promise<T> {
  if (ports.runSettleAtomic) {
    return ports.runSettleAtomic(work);
  }
  return work({ ledger: ports.ledger, usage: ports.usage, studio: ports.studio });
}

export function draftTitleFromPrompt(prompt: string, title?: string): string {
  const explicit = title?.trim();
  if (explicit) {
    return explicit.slice(0, 120);
  }
  const compact = prompt.trim().replace(/\s+/g, " ");
  if (compact.length <= 80) {
    return compact;
  }
  return `${compact.slice(0, 77)}...`;
}

function requirePrompt(raw: string): string {
  const prompt = raw.trim();
  if (!prompt) {
    throw new Error("Üretim metni boş.");
  }
  if (prompt.length > STUDIO_PROMPT_MAX_CHARS) {
    throw new Error("Üretim metni çok uzun.");
  }
  return prompt;
}

async function requireStudioCatalogFloor(
  catalog: PriceCatalogStore,
): Promise<{ amountMinor: number; currencyCode: typeof SETTLEMENT_CURRENCY }> {
  const entry = await catalog.findActiveEntry(STUDIO_MODULE_KEY, STUDIO_GENERATION_UNIT_KEY);
  if (!entry) {
    throw new Error("Studio üretim fiyatı katalogda yok.");
  }
  if (entry.unitType !== "MINOR") {
    throw new Error("Studio üretim fiyatı MINOR biriminde olmalıdır.");
  }
  assertSameCurrency(entry.currencyCode, SETTLEMENT_CURRENCY);
  return { amountMinor: entry.amountMinor, currencyCode: SETTLEMENT_CURRENCY };
}

export async function createStudioDraft(
  ports: Pick<StudioEnginePorts, "studio">,
  command: CreateStudioDraftCommand,
): Promise<StudioDraftRecord> {
  const prompt = requirePrompt(command.prompt);
  const now = command.now ?? new Date();
  return ports.studio.insertDraft({
    id: randomUUID(),
    userId: command.userId,
    title: draftTitleFromPrompt(prompt, command.title),
    prompt,
    status: "OPEN",
    createdAt: now,
    updatedAt: now,
  });
}

async function requireOwnedDraft(
  store: StudioStore,
  draftId: string,
  userId: string,
): Promise<StudioDraftRecord> {
  const draft = await store.getDraft(draftId);
  if (!draft || draft.userId !== userId) {
    throw new Error("Taslak bulunamadı.");
  }
  return draft;
}

/**
 * Tek üretim kapısı. Ağdan önce bakiye + katalog fail-closed.
 * LLM yalnız `invokeLlm` ile. Token defteri + cüzdan debit aynı üretim id’sine bağlanır.
 */
export async function generateStudioContent(
  ports: StudioEnginePorts,
  command: GenerateStudioContentCommand,
): Promise<StudioGenerationResult> {
  const prompt = requirePrompt(command.prompt);
  const now = command.now ?? new Date();
  const catalogFloor = await requireStudioCatalogFloor(ports.catalog);
  const estimatedUsage = estimatePromptTokenUsage(STUDIO_SYSTEM_PROMPT, prompt);
  const estimatedDebit = resolveStudioDebitMinor(estimatedUsage, catalogFloor.amountMinor);

  const wallet = await ports.ledger.lockWallet(command.userId, catalogFloor.currencyCode);
  if (wallet.amountMinor < estimatedDebit) {
    throw new Error("Yetersiz bakiye.");
  }

  const platformUserId = command.platformUserId ?? resolvePlatformTreasuryUserId();
  if (platformUserId === command.userId) {
    throw new Error("Platform hazinesi üretici ile çakışamaz.");
  }

  const existingDraft = command.draftId
    ? await requireOwnedDraft(ports.studio, command.draftId, command.userId)
    : null;

  const invoke = ports.invokeLlm ?? invokeLlm;
  const llm = await invoke(
    {
      role: STUDIO_GENERATION_ROLE,
      system: STUDIO_SYSTEM_PROMPT,
      user: prompt,
      rateLimit: { identifier: command.userId, scope: STUDIO_MODULE_KEY },
      billing: {
        userId: command.userId,
        source: AI_TOKEN_SOURCES.STUDIO,
        recordUsage: false,
      },
    },
    ports.llmDeps,
  );

  if (!llm) {
    throw new Error("Studio üretimi durduruldu (kota veya gümrük).");
  }

  const generationId = randomUUID();
  const costMinor = toStudioCostMinor(llm.usage);
  const debitMinor = resolveStudioDebitMinor(llm.usage, catalogFloor.amountMinor);
  const usageIdempotencyKey = studioUsageKey(generationId);
  const ledgerDebitKey = studioDebitKey(generationId);

  return withStudioSettle(ports, async (tx) => {
    const settledWallet = await tx.ledger.lockWallet(command.userId, catalogFloor.currencyCode);
    if (settledWallet.amountMinor < debitMinor) {
      throw new Error("Yetersiz bakiye.");
    }

    const usage = await tx.usage.insert({
      id: randomUUID(),
      userId: command.userId,
      source: AI_TOKEN_SOURCES.STUDIO,
      provider: llm.provider,
      model: llm.model,
      roleKey: STUDIO_GENERATION_ROLE,
      promptTokens: llm.usage.promptTokens,
      completionTokens: llm.usage.completionTokens,
      totalTokens: llm.usage.totalTokens,
      costMinor,
      currencyCode: catalogFloor.currencyCode,
      idempotencyKey: usageIdempotencyKey,
      createdAt: now,
    });

    const debitApplied = await appendLedgerEntry(tx.ledger, {
      userId: command.userId,
      currencyCode: catalogFloor.currencyCode,
      amountMinor: debitMinor,
      direction: "DEBIT",
      label: "Studio AI üretim",
      purpose: "studio-generation",
      idempotencyKey: ledgerDebitKey,
    });

    await appendLedgerEntry(tx.ledger, {
      userId: platformUserId,
      currencyCode: catalogFloor.currencyCode,
      amountMinor: debitMinor,
      direction: "CREDIT",
      label: "Studio AI settlement",
      purpose: "studio-settlement",
      idempotencyKey: studioCreditKey(generationId),
    });

    const draft =
      existingDraft ??
      (await createStudioDraft(tx, {
        userId: command.userId,
        prompt,
        title: command.title,
        now,
      }));

    const generation = await tx.studio.insertGeneration({
      id: generationId,
      userId: command.userId,
      draftId: draft.id,
      prompt,
      outputText: llm.text,
      status: "SUCCEEDED",
      roleKey: STUDIO_GENERATION_ROLE,
      provider: llm.provider,
      model: llm.model,
      promptTokens: llm.usage.promptTokens,
      completionTokens: llm.usage.completionTokens,
      totalTokens: llm.usage.totalTokens,
      costMinor,
      debitMinor,
      currencyCode: catalogFloor.currencyCode,
      usageId: usage.id,
      ledgerDebitKey,
      failureReason: null,
      createdAt: now,
      completedAt: now,
    });

    return { draft, generation, debitMinor, remainingMinor: debitApplied.balanceMinor };
  });
}
