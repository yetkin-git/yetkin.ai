import { randomUUID } from "node:crypto";
import { appendLedgerEntry } from "@/lib/kernel/ledger/engine";
import { resolvePlatformTreasuryUserId } from "@/lib/kernel/escrow/engine";
import { SETTLEMENT_CURRENCY, assertSameCurrency } from "@/lib/kernel/money/currency";
import { generateImage, type InvokeLlmDeps } from "@/lib/kernel/ai/llm-gateway";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import type { InvokeImageInput, ImageGatewayResult } from "@/lib/kernel/ai/types";
import { sha256Hex } from "@/lib/kernel/crypto/sha256";
import { BadRequestError, ConflictError } from "@/lib/kernel/http/errors";
import { hashIdempotencyPayload } from "@/lib/kernel/http/idempotency";
import {
  parseImageProviderPayload,
  requirePaidCommandKey,
  serializeProviderPayload,
} from "@/lib/kernel/ai/paid-command";
import { STUDIO_PROMPT_MAX_CHARS } from "@/lib/studio/schemas";
import {
  estimatePromptTokenUsage,
  resolveStudioDebitMinor,
  toStudioCostMinor,
} from "@/lib/studio/billing";
import {
  createStudioDraft,
  draftTitleFromPrompt,
  withStudioSettle,
  type StudioEnginePorts,
  type StudioGenerationResult,
} from "@/lib/studio/engine";
import { assertStudioImagePayloadCeiling, assertStudioMimeType, createInlineStudioAssetStorage, STUDIO_EMPTY_DATA_BASE64, STUDIO_STORAGE_BUCKET, decodeStudioImageBytes, type StudioAssetLocator, type StudioAssetStorage } from "@/lib/studio/storage";
import {
  STUDIO_IMAGE_CATALOG_MISSING,
  STUDIO_IMAGE_GENERATION_ROLE,
  STUDIO_IMAGE_UNIT_KEY,
  STUDIO_MODULE_KEY,
  type StudioDigitalAssetRecord,
  type StudioDraftRecord,
} from "@/lib/studio/types";

export type StudioImageInvoker = (
  input: InvokeImageInput,
  deps?: InvokeLlmDeps,
) => Promise<ImageGatewayResult | null>;

export type StudioImageEnginePorts = StudioEnginePorts & {
  generateImage?: StudioImageInvoker;
  /** HTTP üretim ucu object-store bağlar. Birim test inline varsayılanı kullanır. */
  assetStorage?: StudioAssetStorage;
};

export type GenerateStudioImageCommand = {
  userId: string;
  commandKey: string;
  prompt: string;
  draftId?: string;
  title?: string;
  platformUserId?: string;
  now?: Date;
};

export type StudioImageGenerationResult = StudioGenerationResult & {
  asset: StudioDigitalAssetRecord;
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

async function requireOwnedDraft(
  store: StudioEnginePorts["studio"],
  draftId: string,
  userId: string,
): Promise<StudioDraftRecord> {
  const draft = await store.getDraft(draftId);
  if (!draft || draft.userId !== userId) {
    throw new Error("Taslak bulunamadı.");
  }
  return draft;
}

async function requireStudioImageCatalogFloor(
  catalog: StudioEnginePorts["catalog"],
): Promise<{ amountMinor: number; currencyCode: typeof SETTLEMENT_CURRENCY }> {
  const entry = await catalog.findActiveEntry(STUDIO_MODULE_KEY, STUDIO_IMAGE_UNIT_KEY);
  if (!entry) {
    throw new Error(STUDIO_IMAGE_CATALOG_MISSING);
  }
  if (entry.unitType !== "MINOR") {
    throw new Error("Studio görsel fiyatı MINOR biriminde olmalıdır.");
  }
  assertSameCurrency(entry.currencyCode, SETTLEMENT_CURRENCY);
  return { amountMinor: entry.amountMinor, currencyCode: SETTLEMENT_CURRENCY };
}

export function studioImageContentHash(dataBase64: string): string {
  return sha256Hex(Buffer.from(dataBase64, "base64"));
}

export function studioImagePromptHash(prompt: string): string {
  return sha256Hex(prompt);
}

function assetFromLocator(input: {
  id: string;
  userId: string;
  generationId: string;
  contentHash: string;
  promptHash: string;
  locator: StudioAssetLocator;
  now: Date;
}): StudioDigitalAssetRecord {
  if (input.locator.kind === "object-store") {
    return {
      id: input.id,
      userId: input.userId,
      generationId: input.generationId,
      assetType: "IMAGE",
      mimeType: input.locator.mimeType,
      contentHash: input.contentHash,
      promptHash: input.promptHash,
      dataBase64: STUDIO_EMPTY_DATA_BASE64,
      storageKind: "object-store",
      bucket: input.locator.bucket || STUDIO_STORAGE_BUCKET,
      objectPath: input.locator.path,
      byteSize: input.locator.byteSize,
      storageConfirmedAt: input.now,
      createdAt: input.now,
    };
  }
  return {
    id: input.id,
    userId: input.userId,
    generationId: input.generationId,
    assetType: "IMAGE",
    mimeType: input.locator.mimeType,
    contentHash: input.contentHash,
    promptHash: input.promptHash,
    dataBase64: input.locator.dataBase64,
    storageKind: "inline-base64",
    bucket: null,
    objectPath: null,
    byteSize: Buffer.from(input.locator.dataBase64, "base64").byteLength,
    storageConfirmedAt: input.now,
    createdAt: input.now,
  };
}

async function loadSettledStudioImage(
  ports: StudioImageEnginePorts,
  commandKey: string,
  userId: string,
): Promise<StudioImageGenerationResult> {
  const generation = await ports.studio.getGeneration(commandKey);
  if (!generation || generation.userId !== userId || generation.status !== "SUCCEEDED") {
    throw new Error("Üretim kaydı bulunamadı.");
  }
  const draft = await ports.studio.getDraft(generation.draftId);
  const asset = await ports.studio.getDigitalAssetByGenerationId(generation.id);
  if (!draft || !asset) {
    throw new Error("Üretim kaydı bulunamadı.");
  }
  const wallet = await ports.ledger.lockWallet(userId, generation.currencyCode);
  return {
    draft,
    generation,
    asset,
    debitMinor: generation.debitMinor,
    remainingMinor: wallet.amountMinor,
  };
}

/**
 * IMAGE_GEN tezgâhı. Komut anahtarı = HTTP Idempotency-Key.
 * Görsel yalnız `generateImage` gümrüğünden. Debit tarifi metin ile aynı: max(token, taban).
 */
export async function generateStudioImage(
  ports: StudioImageEnginePorts,
  command: GenerateStudioImageCommand,
): Promise<StudioImageGenerationResult> {
  const prompt = requirePrompt(command.prompt);
  const commandKey = requirePaidCommandKey(command.commandKey);
  const now = command.now ?? new Date();
  const catalogFloor = await requireStudioImageCatalogFloor(ports.catalog);
  const estimatedUsage = estimatePromptTokenUsage("", prompt);
  const estimatedDebit = resolveStudioDebitMinor(estimatedUsage, catalogFloor.amountMinor);

  const platformUserId = command.platformUserId ?? resolvePlatformTreasuryUserId();
  if (platformUserId === command.userId) {
    throw new Error("Platform hazinesi üretici ile çakışamaz.");
  }

  const existingDraft = command.draftId
    ? await requireOwnedDraft(ports.studio, command.draftId, command.userId)
    : null;

  const began = await ports.commands.begin({
    userId: command.userId,
    scope: "studio.image",
    commandKey,
    requestHash: hashIdempotencyPayload({
      prompt,
      draftId: command.draftId ?? null,
      title: command.title ?? null,
    }),
    estimatedMinor: estimatedDebit,
    currencyCode: catalogFloor.currencyCode,
    now,
  });
  if (began.kind === "conflict") {
    throw new ConflictError("Idempotency-Key aynı anahtarla farklı gövde kullanılamaz.");
  }
  if (began.kind === "replay") {
    return loadSettledStudioImage(ports, commandKey, command.userId);
  }

  const wallet = await ports.ledger.lockWallet(command.userId, catalogFloor.currencyCode);
  if (wallet.amountMinor < estimatedDebit) {
    throw new Error("Yetersiz bakiye.");
  }

  let image: ImageGatewayResult;
  if (began.kind === "resume" && began.record.providerJson) {
    const stored = parseImageProviderPayload(began.record.providerJson);
    image = {
      mimeType: stored.mimeType,
      dataBase64: stored.dataBase64,
      provider: stored.provider,
      model: stored.model,
      usage: stored.usage,
    };
  } else {
    const invokeImage = ports.generateImage ?? generateImage;
    const invoked = await invokeImage(
      {
        role: STUDIO_IMAGE_GENERATION_ROLE,
        prompt,
        rateLimit: { identifier: command.userId, scope: `${STUDIO_MODULE_KEY}:image` },
        billing: {
          userId: command.userId,
          source: AI_TOKEN_SOURCES.STUDIO,
          recordUsage: false,
        },
      },
      ports.llmDeps,
    );
    if (!invoked) {
      throw new BadRequestError("Studio görsel üretimi durduruldu (kota veya gümrük).");
    }
    image = invoked;
  }

  const mimeType = assertStudioMimeType(image.mimeType);
  assertStudioImagePayloadCeiling(image.dataBase64);
  decodeStudioImageBytes(image.dataBase64);

  if (began.kind !== "resume") {
    await ports.commands.saveProviderOutput({
      userId: command.userId,
      scope: "studio.image",
      commandKey,
      providerJson: serializeProviderPayload({
        kind: "image",
        mimeType: image.mimeType,
        dataBase64: image.dataBase64,
        provider: image.provider,
        model: image.model,
        usage: image.usage,
      }),
      now,
    });
  }

  const generationId = commandKey;
  const storage = ports.assetStorage ?? createInlineStudioAssetStorage();
  const locator = await storage.put({
    userId: command.userId,
    generationId,
    blob: { mimeType, dataBase64: image.dataBase64 },
  });
  const contentHash =
    locator.kind === "object-store" ? locator.contentHash : studioImageContentHash(image.dataBase64);
  const costMinor = toStudioCostMinor(image.usage);
  const debitMinor = resolveStudioDebitMinor(image.usage, catalogFloor.amountMinor);
  const usageIdempotencyKey = studioUsageKey(generationId);
  const ledgerDebitKey = studioDebitKey(generationId);

  const settled = await withStudioSettle(ports, async (tx) => {
    const existingGeneration = await tx.studio.getGeneration(generationId);
    if (existingGeneration?.status === "SUCCEEDED" && existingGeneration.userId === command.userId) {
      const draft = await tx.studio.getDraft(existingGeneration.draftId);
      const asset = await tx.studio.getDigitalAssetByGenerationId(existingGeneration.id);
      if (!draft || !asset) {
        throw new Error("Üretim kaydı bulunamadı.");
      }
      const settledWallet = await tx.ledger.lockWallet(command.userId, catalogFloor.currencyCode);
      return {
        draft,
        generation: existingGeneration,
        asset,
        debitMinor: existingGeneration.debitMinor,
        remainingMinor: settledWallet.amountMinor,
      };
    }

    const settledWallet = await tx.ledger.lockWallet(command.userId, catalogFloor.currencyCode);
    if (settledWallet.amountMinor < debitMinor) {
      throw new Error("Yetersiz bakiye.");
    }

    const usage = await tx.usage.insert({
      id: randomUUID(),
      userId: command.userId,
      source: AI_TOKEN_SOURCES.STUDIO,
      provider: image.provider,
      model: image.model,
      roleKey: STUDIO_IMAGE_GENERATION_ROLE,
      promptTokens: image.usage.promptTokens,
      completionTokens: image.usage.completionTokens,
      totalTokens: image.usage.totalTokens,
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
      label: "Studio görsel üretim",
      purpose: "studio-generation",
      idempotencyKey: ledgerDebitKey,
    });

    await appendLedgerEntry(tx.ledger, {
      userId: platformUserId,
      currencyCode: catalogFloor.currencyCode,
      amountMinor: debitMinor,
      direction: "CREDIT",
      label: "Studio görsel settlement",
      purpose: "studio-settlement",
      idempotencyKey: studioCreditKey(generationId),
    });

    const draft =
      existingDraft ??
      (await createStudioDraft(tx, {
        userId: command.userId,
        prompt,
        title: command.title ?? draftTitleFromPrompt(prompt),
        now,
      }));

    const generation = await tx.studio.insertGeneration({
      id: generationId,
      userId: command.userId,
      draftId: draft.id,
      prompt,
      outputText: null,
      status: "SUCCEEDED",
      roleKey: STUDIO_IMAGE_GENERATION_ROLE,
      provider: image.provider,
      model: image.model,
      promptTokens: image.usage.promptTokens,
      completionTokens: image.usage.completionTokens,
      totalTokens: image.usage.totalTokens,
      costMinor,
      debitMinor,
      currencyCode: catalogFloor.currencyCode,
      usageId: usage.id,
      ledgerDebitKey,
      failureReason: null,
      createdAt: now,
      completedAt: now,
    });

    const asset = await tx.studio.insertDigitalAsset(
      assetFromLocator({
        id: randomUUID(),
        userId: command.userId,
        generationId,
        contentHash,
        promptHash: studioImagePromptHash(prompt),
        locator,
        now,
      }),
    );

    return {
      draft,
      generation,
      asset,
      debitMinor,
      remainingMinor: debitApplied.balanceMinor,
    };
  });

  await ports.commands.markSettled({
    userId: command.userId,
    scope: "studio.image",
    commandKey,
    resultId: generationId,
    now,
  });
  return settled;
}
