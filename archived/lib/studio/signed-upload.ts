import { randomUUID } from "node:crypto";
import { sha256Hex } from "@/lib/kernel/crypto/sha256";
import { ConflictError, NotFoundError } from "@/lib/kernel/http/errors";
import {
  STUDIO_EMPTY_DATA_BASE64,
  STUDIO_IMAGE_DECODED_MAX_BYTES,
  STUDIO_STORAGE_BUCKET,
  assertStudioByteSize,
  assertStudioContentHash,
  assertStudioMimeType,
  assertStudioObjectOwnerPath,
  buildStudioObjectPath,
  normalizeStudioMimeType,
  type StudioObjectStoreGateway,
  type StudioSignedUploadIntent,
} from "@/lib/studio/storage";
import type { StudioDigitalAssetRecord, StudioStore } from "@/lib/studio/types";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}

async function requireOwnedGeneration(
  studio: StudioStore,
  generationId: string,
  userId: string,
) {
  const generation = await studio.getGeneration(generationId);
  if (!generation || generation.userId !== userId) {
    throw new NotFoundError("Üretim kaydı bulunamadı.");
  }
  return generation;
}

async function requireOwnedAsset(
  studio: StudioStore,
  generationId: string,
  userId: string,
): Promise<StudioDigitalAssetRecord> {
  const asset = await studio.getDigitalAssetByGenerationId(generationId);
  if (!asset || asset.userId !== userId) {
    throw new NotFoundError("Studio görseli bulunamadı.");
  }
  return asset;
}

function isSealedInline(asset: StudioDigitalAssetRecord): boolean {
  return asset.storageKind === "inline-base64" && asset.dataBase64.length > 0;
}

function isSealedObject(asset: StudioDigitalAssetRecord): boolean {
  return asset.storageKind === "object-store" && asset.storageConfirmedAt != null;
}

function isPendingObject(asset: StudioDigitalAssetRecord): boolean {
  return asset.storageKind === "object-store" && asset.storageConfirmedAt == null && Boolean(asset.objectPath);
}

export async function signStudioUpload(input: {
  userId: string;
  generationId: string;
  mimeType: string;
  byteSize: number;
  contentHash: string;
  studio: StudioStore;
  gateway: StudioObjectStoreGateway;
  now?: Date;
}): Promise<StudioSignedUploadIntent> {
  const mimeType = assertStudioMimeType(input.mimeType);
  const byteSize = assertStudioByteSize(input.byteSize);
  const contentHash = assertStudioContentHash(input.contentHash);
  const generation = await requireOwnedGeneration(input.studio, input.generationId, input.userId);
  const objectPath = assertStudioObjectOwnerPath(
    input.userId,
    buildStudioObjectPath(input.userId, input.generationId, mimeType),
  );
  const existing = await input.studio.getDigitalAssetByGenerationId(input.generationId);
  if (existing) {
    if (existing.userId !== input.userId) {
      throw new NotFoundError("Studio görseli bulunamadı.");
    }
    if (isSealedObject(existing) || isSealedInline(existing)) {
      throw new ConflictError("Studio görseli zaten mühürlü.");
    }
    if (existing.objectPath && existing.objectPath !== objectPath) {
      throw new ConflictError("Studio nesne yolu değişmez.");
    }
    if (existing.contentHash !== contentHash || existing.mimeType !== mimeType || existing.byteSize !== byteSize) {
      throw new ConflictError("Studio görsel mührü değişmez.");
    }
  } else {
    const now = input.now ?? new Date();
    try {
      await input.studio.insertDigitalAsset({
        id: randomUUID(),
        userId: input.userId,
        generationId: input.generationId,
        assetType: "IMAGE",
        mimeType,
        contentHash,
        promptHash: sha256Hex(generation.prompt),
        dataBase64: STUDIO_EMPTY_DATA_BASE64,
        storageKind: "object-store",
        bucket: STUDIO_STORAGE_BUCKET,
        objectPath,
        byteSize,
        storageConfirmedAt: null,
        createdAt: now,
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictError("Studio görsel mührü çakıştı.");
      }
      throw error;
    }
  }

  const ticket = await input.gateway.createSignedUploadUrl(objectPath, { upsert: true });
  return {
    bucket: STUDIO_STORAGE_BUCKET,
    objectPath,
    mimeType,
    maxBytes: STUDIO_IMAGE_DECODED_MAX_BYTES,
    signedPutUrl: ticket.signedPutUrl,
    expiresAt: ticket.expiresAt.toISOString(),
  };
}

export async function confirmStudioUpload(input: {
  userId: string;
  generationId: string;
  studio: StudioStore;
  gateway: StudioObjectStoreGateway;
  now?: Date;
}): Promise<StudioDigitalAssetRecord> {
  await requireOwnedGeneration(input.studio, input.generationId, input.userId);
  const asset = await requireOwnedAsset(input.studio, input.generationId, input.userId);
  if (isSealedObject(asset)) {
    return asset;
  }
  if (isSealedInline(asset) || !isPendingObject(asset) || !asset.objectPath || asset.byteSize == null) {
    throw new NotFoundError("Studio yükleme bekleyen nesne yok.");
  }
  const objectPath = assertStudioObjectOwnerPath(input.userId, asset.objectPath);
  const info = await input.gateway.objectInfo(objectPath);
  if (!info) {
    throw new NotFoundError("Studio nesnesi henüz yüklenmedi.");
  }
  assertStudioByteSize(info.byteSize);
  if (info.byteSize !== asset.byteSize) {
    throw new ConflictError("Studio nesne boyutu mühürle uyuşmuyor.");
  }
  if (info.mimeType) {
    const storedMime = assertStudioMimeType(normalizeStudioMimeType(info.mimeType));
    if (storedMime !== asset.mimeType) {
      throw new ConflictError("Studio nesne türü mühürle uyuşmuyor.");
    }
  }

  const now = input.now ?? new Date();
  return input.studio.updateDigitalAsset({
    ...asset,
    storageKind: "object-store",
    bucket: STUDIO_STORAGE_BUCKET,
    objectPath,
    storageConfirmedAt: now,
  });
}
