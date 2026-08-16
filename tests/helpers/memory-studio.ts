import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import type { AiTokenUsageRecord, AiTokenUsageStore } from "@/lib/kernel/ai/usage-store";
import { assertStudioByteSize, assertStudioImagePayloadCeiling, assertStudioMimeType, assertStudioObjectOwnerPath } from "@/lib/studio/storage";
import type {
  StudioDigitalAssetRecord,
  StudioDraftRecord,
  StudioGenerationRecord,
  StudioPulse,
  StudioStore,
} from "@/lib/studio/types";

export function createMemoryAiTokenUsageStore(): AiTokenUsageStore & {
  list(): AiTokenUsageRecord[];
} {
  const byId = new Map<string, AiTokenUsageRecord>();
  const byKey = new Map<string, string>();

  return {
    list() {
      return [...byId.values()].map((row) => ({ ...row }));
    },
    async insert(record) {
      if (record.idempotencyKey) {
        const existingId = byKey.get(record.idempotencyKey);
        if (existingId) {
          const existing = byId.get(existingId);
          if (existing) {
            return { ...existing };
          }
        }
      }
      byId.set(record.id, record);
      if (record.idempotencyKey) {
        byKey.set(record.idempotencyKey, record.id);
      }
      return { ...record };
    },
    async findByIdempotencyKey(idempotencyKey) {
      const id = byKey.get(idempotencyKey);
      const row = id ? byId.get(id) : undefined;
      return row ? { ...row } : null;
    },
  };
}

export function createMemoryStudioStore(): StudioStore {
  const drafts = new Map<string, StudioDraftRecord>();
  const generations = new Map<string, StudioGenerationRecord>();
  const assets = new Map<string, StudioDigitalAssetRecord>();

  return {
    async insertDraft(draft) {
      drafts.set(draft.id, draft);
      return { ...draft };
    },
    async getDraft(id) {
      const row = drafts.get(id);
      return row ? { ...row } : null;
    },
    async listDraftsForUser(userId) {
      return [...drafts.values()]
        .filter((row) => row.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((row) => ({ ...row }));
    },
    async insertGeneration(generation) {
      generations.set(generation.id, generation);
      return { ...generation };
    },
    async getGeneration(id) {
      const row = generations.get(id);
      return row ? { ...row } : null;
    },
    async listGenerationsForUser(userId) {
      return [...generations.values()]
        .filter((row) => row.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((row) => ({ ...row }));
    },
    async insertDigitalAsset(asset) {
      assertStudioImagePayloadCeiling(asset.dataBase64);
      assertStudioMimeType(asset.mimeType);
      if (asset.storageKind === "object-store") {
        if (!asset.objectPath || asset.byteSize == null) {
          throw new Error("Studio nesne metadata eksik.");
        }
        assertStudioObjectOwnerPath(asset.userId, asset.objectPath);
        assertStudioByteSize(asset.byteSize);
      }
      assets.set(asset.id, asset);
      return { ...asset };
    },
    async updateDigitalAsset(asset) {
      const existing = [...assets.values()].find(
        (row) => row.generationId === asset.generationId && row.userId === asset.userId,
      );
      if (!existing) {
        throw new Error("Studio görseli bulunamadı.");
      }
      assertStudioImagePayloadCeiling(asset.dataBase64);
      assets.set(existing.id, { ...asset, id: existing.id });
      return { ...asset, id: existing.id };
    },
    async getDigitalAssetByGenerationId(generationId) {
      const found = [...assets.values()].find((row) => row.generationId === generationId);
      return found ? { ...found } : null;
    },
    async listDigitalAssetsForUser(userId) {
      return [...assets.values()]
        .filter((row) => row.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((row) => ({ ...row }));
    },
    async pulseForUser(userId) {
      const ownDrafts = [...drafts.values()].filter((row) => row.userId === userId);
      const ownGens = [...generations.values()].filter(
        (row) => row.userId === userId && row.status === "SUCCEEDED",
      );
      const latestDraft = [...ownDrafts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      const latestGen = [...ownGens].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      const pulse: StudioPulse = {
        draftsCount: ownDrafts.length,
        generationsSucceeded: ownGens.length,
        lastDraftTitle: latestDraft?.title ?? null,
        lastDebitMinor: toAmountMinor(latestGen?.debitMinor ?? 0),
        currencyCode: latestGen?.currencyCode ?? SETTLEMENT_CURRENCY,
      };
      return pulse;
    },
  };
}
