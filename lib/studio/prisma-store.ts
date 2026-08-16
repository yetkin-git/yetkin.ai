import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/kernel/db";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { parseCurrencyCode, SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { assertStudioByteSize, assertStudioImagePayloadCeiling, assertStudioMimeType, assertStudioObjectOwnerPath } from "@/lib/studio/storage";
import type {
  StudioDigitalAssetRecord,
  StudioDraftRecord,
  StudioGenerationRecord,
  StudioPulse,
  StudioStore,
} from "@/lib/studio/types";

function toDraft(row: {
  id: string;
  userId: string;
  title: string;
  prompt: string;
  status: StudioDraftRecord["status"];
  createdAt: Date;
  updatedAt: Date;
}): StudioDraftRecord {
  return { ...row };
}

function toGeneration(row: {
  id: string;
  userId: string;
  draftId: string;
  prompt: string;
  outputText: string | null;
  status: StudioGenerationRecord["status"];
  roleKey: string;
  provider: string | null;
  model: string | null;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costMinor: number;
  debitMinor: number;
  currencyCode: string;
  usageId: string | null;
  ledgerDebitKey: string | null;
  failureReason: string | null;
  createdAt: Date;
  completedAt: Date | null;
}): StudioGenerationRecord {
  return {
    ...row,
    costMinor: toAmountMinor(row.costMinor),
    debitMinor: toAmountMinor(row.debitMinor),
    currencyCode: parseCurrencyCode(row.currencyCode),
  };
}

function toAsset(row: {
  id: string;
  userId: string;
  generationId: string;
  assetType: StudioDigitalAssetRecord["assetType"];
  mimeType: string;
  contentHash: string;
  promptHash: string;
  dataBase64: string;
  storageKind: string;
  bucket: string | null;
  objectPath: string | null;
  byteSize: number | null;
  storageConfirmedAt: Date | null;
  createdAt: Date;
}): StudioDigitalAssetRecord {
  return {
    ...row,
    storageKind: row.storageKind === "object-store" ? "object-store" : "inline-base64",
  };
}

function assertAssetMetadata(asset: StudioDigitalAssetRecord): void {
  assertStudioImagePayloadCeiling(asset.dataBase64);
  assertStudioMimeType(asset.mimeType);
  if (asset.storageKind === "object-store") {
    if (!asset.objectPath || asset.byteSize == null) {
      throw new Error("Studio nesne metadata eksik.");
    }
    assertStudioObjectOwnerPath(asset.userId, asset.objectPath);
    assertStudioByteSize(asset.byteSize);
  }
}

export type StudioWriteDb = Pick<
  PrismaClient,
  "studioDraft" | "studioGeneration" | "studioDigitalAsset"
>;

export function bindStudioStore(db: StudioWriteDb): StudioStore {
  return {
    async insertDraft(draft) {
      const row = await db.studioDraft.create({
        data: {
          id: draft.id,
          userId: draft.userId,
          title: draft.title,
          prompt: draft.prompt,
          status: draft.status,
          createdAt: draft.createdAt,
          updatedAt: draft.updatedAt,
        },
      });
      return toDraft(row);
    },
    async getDraft(id) {
      const row = await db.studioDraft.findUnique({ where: { id } });
      return row ? toDraft(row) : null;
    },
    async listDraftsForUser(userId) {
      const rows = await db.studioDraft.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toDraft);
    },
    async insertGeneration(generation) {
      const row = await db.studioGeneration.create({
        data: {
          id: generation.id,
          userId: generation.userId,
          draftId: generation.draftId,
          prompt: generation.prompt,
          outputText: generation.outputText,
          status: generation.status,
          roleKey: generation.roleKey,
          provider: generation.provider,
          model: generation.model,
          promptTokens: generation.promptTokens,
          completionTokens: generation.completionTokens,
          totalTokens: generation.totalTokens,
          costMinor: generation.costMinor,
          debitMinor: generation.debitMinor,
          currencyCode: generation.currencyCode,
          usageId: generation.usageId,
          ledgerDebitKey: generation.ledgerDebitKey,
          failureReason: generation.failureReason,
          createdAt: generation.createdAt,
          completedAt: generation.completedAt,
        },
      });
      return toGeneration(row);
    },
    async getGeneration(id) {
      const row = await db.studioGeneration.findUnique({ where: { id } });
      return row ? toGeneration(row) : null;
    },
    async listGenerationsForUser(userId) {
      const rows = await db.studioGeneration.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toGeneration);
    },
    async insertDigitalAsset(asset) {
      assertAssetMetadata(asset);
      const row = await db.studioDigitalAsset.create({
        data: {
          id: asset.id,
          userId: asset.userId,
          generationId: asset.generationId,
          assetType: asset.assetType,
          mimeType: asset.mimeType,
          contentHash: asset.contentHash,
          promptHash: asset.promptHash,
          dataBase64: asset.dataBase64,
          storageKind: asset.storageKind,
          bucket: asset.bucket,
          objectPath: asset.objectPath,
          byteSize: asset.byteSize,
          storageConfirmedAt: asset.storageConfirmedAt,
          createdAt: asset.createdAt,
        },
      });
      return toAsset(row);
    },
    async updateDigitalAsset(asset) {
      assertAssetMetadata(asset);
      const existing = await db.studioDigitalAsset.findFirst({
        where: { generationId: asset.generationId, userId: asset.userId },
      });
      if (!existing) {
        throw new Error("Studio görseli bulunamadı.");
      }
      const row = await db.studioDigitalAsset.update({
        where: { id: existing.id },
        data: {
          mimeType: asset.mimeType,
          contentHash: asset.contentHash,
          promptHash: asset.promptHash,
          dataBase64: asset.dataBase64,
          storageKind: asset.storageKind,
          bucket: asset.bucket,
          objectPath: asset.objectPath,
          byteSize: asset.byteSize,
          storageConfirmedAt: asset.storageConfirmedAt,
        },
      });
      return toAsset(row);
    },
    async getDigitalAssetByGenerationId(generationId) {
      const row = await db.studioDigitalAsset.findUnique({ where: { generationId } });
      return row ? toAsset(row) : null;
    },
    async listDigitalAssetsForUser(userId) {
      const rows = await db.studioDigitalAsset.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toAsset);
    },
    async pulseForUser(userId) {
      const [draftsCount, generationsSucceeded, latestDraft, latestDebit] = await Promise.all([
        db.studioDraft.count({ where: { userId } }),
        db.studioGeneration.count({ where: { userId, status: "SUCCEEDED" } }),
        db.studioDraft.findFirst({
          where: { userId },
          orderBy: { createdAt: "desc" },
          select: { title: true },
        }),
        db.studioGeneration.findFirst({
          where: { userId, status: "SUCCEEDED" },
          orderBy: { createdAt: "desc" },
          select: { debitMinor: true, currencyCode: true },
        }),
      ]);
      const pulse: StudioPulse = {
        draftsCount,
        generationsSucceeded,
        lastDraftTitle: latestDraft?.title ?? null,
        lastDebitMinor: toAmountMinor(latestDebit?.debitMinor ?? 0),
        currencyCode: latestDebit ? parseCurrencyCode(latestDebit.currencyCode) : SETTLEMENT_CURRENCY,
      };
      return pulse;
    },
  };
}

export function createPrismaStudioStore(): StudioStore {
  return bindStudioStore(getPrisma());
}
