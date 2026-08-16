import { describe, expect, it } from "vitest";
import { ConflictError, NotFoundError, PayloadTooLargeError, ServiceUnavailableError } from "@/lib/kernel/http/errors";
import { jsonFromUnknown } from "@/lib/kernel/http/json";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { confirmStudioUpload, signStudioUpload } from "@/lib/studio/signed-upload";
import {
  STUDIO_IMAGE_DECODED_MAX_BYTES,
  STUDIO_STORAGE_BUCKET,
  createObjectStoreStudioAssetStorage,
  studioImageBytesHash,
  type StudioObjectStoreGateway,
} from "@/lib/studio/storage";
import { generateStudioImage } from "@/lib/studio/image-engine";
import { STUDIO_IMAGE_UNIT_KEY, STUDIO_MODULE_KEY } from "@/lib/studio/types";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { createMemoryBudgetShieldPort } from "@/lib/kernel/ai/budget-shield";
import type { LlmProviderAdapter, ProviderGenerateImageResult } from "@/lib/kernel/ai/types";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryPriceCatalogStore } from "../helpers/memory-pricing";
import { createMemoryAiTokenUsageStore, createMemoryStudioStore } from "../helpers/memory-studio";
import type { StudioGenerationRecord, StudioStore } from "@/lib/studio/types";

const USER = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";
const PLATFORM = PLATFORM_TREASURY_USER_ID;
const PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const PNG_BYTES = Buffer.from(PNG_B64, "base64");
const PNG_HASH = studioImageBytesHash(PNG_BYTES);

function memoryGateway(): StudioObjectStoreGateway & {
  objects: Map<string, { bytes: Uint8Array; mime: string }>;
  failSign?: boolean;
} {
  const objects = new Map<string, { bytes: Uint8Array; mime: string }>();
  const gateway: StudioObjectStoreGateway & {
    objects: Map<string, { bytes: Uint8Array; mime: string }>;
    failSign?: boolean;
  } = {
    objects,
    async createSignedUploadUrl(path) {
      if (gateway.failSign) {
        throw new ServiceUnavailableError("Studio nesne depo imzası alınamadı.");
      }
      return {
        signedPutUrl: `https://storage.test/upload/${path}`,
        token: "ticket",
        expiresAt: new Date("2026-08-16T00:05:00.000Z"),
      };
    },
    async uploadToSignedUrl(path, _token, body, mimeType) {
      objects.set(path, { bytes: body, mime: mimeType });
    },
    async objectInfo(path) {
      const row = objects.get(path);
      if (!row) {
        return null;
      }
      return { byteSize: row.bytes.byteLength, mimeType: row.mime };
    },
    async createSignedReadUrl(path) {
      return `https://storage.test/read/${path}?sig=1`;
    },
  };
  return gateway;
}

async function seedGeneration(studio: StudioStore, userId = USER): Promise<StudioGenerationRecord> {
  const now = new Date("2026-08-16T00:00:00.000Z");
  const draft = await studio.insertDraft({
    id: "draft_1",
    userId,
    title: "Ray",
    prompt: "Mühürlü görsel",
    status: "OPEN",
    createdAt: now,
    updatedAt: now,
  });
  return studio.insertGeneration({
    id: "gen_1",
    userId,
    draftId: draft.id,
    prompt: "Mühürlü görsel",
    outputText: null,
    status: "SUCCEEDED",
    roleKey: "IMAGE_GEN",
    provider: "gemini",
    model: "imagen",
    promptTokens: 1,
    completionTokens: 1,
    totalTokens: 2,
    costMinor: toAmountMinor(0),
    debitMinor: toAmountMinor(250),
    currencyCode: SETTLEMENT_CURRENCY,
    usageId: null,
    ledgerDebitKey: null,
    failureReason: null,
    createdAt: now,
    completedAt: now,
  });
}

describe("Studio imzalı yükleme (sign & confirm)", () => {
  it("sahip generation için imzalı PUT üretir; pending metadata bytes taşımaz", async () => {
    const studio = createMemoryStudioStore();
    await seedGeneration(studio);
    const gateway = memoryGateway();
    const intent = await signStudioUpload({
      userId: USER,
      generationId: "gen_1",
      mimeType: "image/png",
      byteSize: PNG_BYTES.byteLength,
      contentHash: PNG_HASH,
      studio,
      gateway,
    });
    expect(intent.bucket).toBe(STUDIO_STORAGE_BUCKET);
    expect(intent.objectPath).toBe(`${USER}/gen_1.png`);
    expect(intent.signedPutUrl).toContain("/upload/");
    expect(intent.maxBytes).toBe(STUDIO_IMAGE_DECODED_MAX_BYTES);

    const pending = await studio.getDigitalAssetByGenerationId("gen_1");
    expect(pending?.dataBase64).toBe("");
    expect(pending?.storageKind).toBe("object-store");
    expect(pending?.storageConfirmedAt).toBeNull();
    expect(pending?.byteSize).toBe(PNG_BYTES.byteLength);
  });

  it("aynı generationId ikinci sign yeni path üretmez", async () => {
    const studio = createMemoryStudioStore();
    await seedGeneration(studio);
    const gateway = memoryGateway();
    const first = await signStudioUpload({
      userId: USER,
      generationId: "gen_1",
      mimeType: "image/png",
      byteSize: PNG_BYTES.byteLength,
      contentHash: PNG_HASH,
      studio,
      gateway,
    });
    const second = await signStudioUpload({
      userId: USER,
      generationId: "gen_1",
      mimeType: "image/png",
      byteSize: PNG_BYTES.byteLength,
      contentHash: PNG_HASH,
      studio,
      gateway,
    });
    expect(second.objectPath).toBe(first.objectPath);
    expect((await studio.listDigitalAssetsForUser(USER)).length).toBe(1);
  });

  it("yabancı generation 404; tavan aşımı 413", async () => {
    const studio = createMemoryStudioStore();
    await seedGeneration(studio, OTHER);
    const gateway = memoryGateway();
    await expect(
      signStudioUpload({
        userId: USER,
        generationId: "gen_1",
        mimeType: "image/png",
        byteSize: 12,
        contentHash: PNG_HASH,
        studio,
        gateway,
      }),
    ).rejects.toThrow(NotFoundError);

    await expect(
      signStudioUpload({
        userId: USER,
        generationId: "gen_1",
        mimeType: "image/png",
        byteSize: STUDIO_IMAGE_DECODED_MAX_BYTES + 1,
        contentHash: PNG_HASH,
        studio,
        gateway,
      }),
    ).rejects.toThrow(PayloadTooLargeError);
    const response = jsonFromUnknown(
      new PayloadTooLargeError("Sınır aşıldığında bakiyeden düşüm yapılmaz. Studio görsel yükü tavanı aşıldı."),
    );
    expect(response.status).toBe(413);
  });

  it("PUT sonrası confirm boyutu mühürler; eksik nesne 404", async () => {
    const studio = createMemoryStudioStore();
    await seedGeneration(studio);
    const gateway = memoryGateway();
    await signStudioUpload({
      userId: USER,
      generationId: "gen_1",
      mimeType: "image/png",
      byteSize: PNG_BYTES.byteLength,
      contentHash: PNG_HASH,
      studio,
      gateway,
    });
    await expect(
      confirmStudioUpload({ userId: USER, generationId: "gen_1", studio, gateway }),
    ).rejects.toThrow(NotFoundError);

    await gateway.uploadToSignedUrl(`${USER}/gen_1.png`, "ticket", PNG_BYTES, "image/png");
    const sealed = await confirmStudioUpload({
      userId: USER,
      generationId: "gen_1",
      studio,
      gateway,
      now: new Date("2026-08-16T00:06:00.000Z"),
    });
    expect(sealed.storageConfirmedAt?.toISOString()).toBe("2026-08-16T00:06:00.000Z");
    expect(sealed.objectPath).toBe(`${USER}/gen_1.png`);
    expect(sealed.dataBase64).toBe("");
  });

  it("confirm boyut uyuşmazlığı 409", async () => {
    const studio = createMemoryStudioStore();
    await seedGeneration(studio);
    const gateway = memoryGateway();
    await signStudioUpload({
      userId: USER,
      generationId: "gen_1",
      mimeType: "image/png",
      byteSize: PNG_BYTES.byteLength,
      contentHash: PNG_HASH,
      studio,
      gateway,
    });
    await gateway.uploadToSignedUrl(`${USER}/gen_1.png`, "ticket", Buffer.from("nope"), "image/png");
    await expect(
      confirmStudioUpload({ userId: USER, generationId: "gen_1", studio, gateway }),
    ).rejects.toThrow(ConflictError);
  });
});

describe("Studio görsel motoru object-store debit kalkanı", () => {
  const PNG_B64_LOCAL = PNG_B64;

  function fakeImagen(): LlmProviderAdapter & { calls: number } {
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
          dataBase64: PNG_B64_LOCAL,
          usage: { promptTokens: 8, completionTokens: 1, totalTokens: 9 },
        };
      },
    };
    return adapter;
  }

  function objectWorld() {
    const adapter = fakeImagen();
    const ledger = createMemoryLedgerStore([
      { userId: USER, amountMinor: 10_000 },
      { userId: PLATFORM, amountMinor: 0 },
    ]);
    const catalog = createMemoryPriceCatalogStore([
      { moduleKey: STUDIO_MODULE_KEY, unitKey: STUDIO_IMAGE_UNIT_KEY, amountMinor: 250 },
    ]);
    const usageStore = createMemoryAiTokenUsageStore();
    const studio = createMemoryStudioStore();
    return { adapter, ledger, usageStore, studio, catalog };
  }

  it("yeni üretim object-store kaydeder; data_base64 boş; debit durur", async () => {
    const ctx = objectWorld();
    const gateway = memoryGateway();
    const result = await generateStudioImage(
      {
        ledger: ctx.ledger,
        catalog: ctx.catalog,
        usage: ctx.usageStore,
        studio: ctx.studio,
        assetStorage: createObjectStoreStudioAssetStorage(gateway),
        llmDeps: {
          providers: { gemini: ctx.adapter },
          budgetPort: createMemoryBudgetShieldPort({ tokensByUser: {} }),
        },
      },
      { userId: USER, prompt: "Mühürlü 16:9 ray görseli.", platformUserId: PLATFORM },
    );
    expect(result.asset.storageKind).toBe("object-store");
    expect(result.asset.dataBase64).toBe("");
    expect(result.asset.objectPath).toBe(`${USER}/${result.generation.id}.png`);
    expect(result.debitMinor).toBe(250);
    expect(ctx.ledger.snapshot(USER).amountMinor).toBe(9_750);
    expect(gateway.objects.has(`${USER}/${result.generation.id}.png`)).toBe(true);
  });

  it("imza 503 ise debit ve satır yok", async () => {
    const ctx = objectWorld();
    const gateway = memoryGateway();
    gateway.failSign = true;
    await expect(
      generateStudioImage(
        {
          ledger: ctx.ledger,
          catalog: ctx.catalog,
          usage: ctx.usageStore,
          studio: ctx.studio,
          assetStorage: createObjectStoreStudioAssetStorage(gateway),
          llmDeps: {
            providers: { gemini: ctx.adapter },
            budgetPort: createMemoryBudgetShieldPort({ tokensByUser: {} }),
          },
        },
        { userId: USER, prompt: "Mühürlü görsel.", platformUserId: PLATFORM },
      ),
    ).rejects.toThrow(ServiceUnavailableError);
    expect(ctx.adapter.calls).toBe(1);
    expect(ctx.ledger.snapshot(USER).amountMinor).toBe(10_000);
    expect(await ctx.studio.listDigitalAssetsForUser(USER)).toHaveLength(0);
  });
});
