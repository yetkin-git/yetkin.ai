/**
 * Studio görsel depolama kalkanı.
 *
 * Taşıyıcı: Supabase Storage imzalı PUT (`kind: "object-store"`).
 * Eski satırlar `inline-base64` okunur (kör DROP yok). Sözleşme: .system_docs/STORAGE_CONTRACT.md
 *   - `SUPABASE_SERVICE_ROLE_KEY` JS/env'de yoktur (anayasa).
 *   - Anon + vatandaş JWT; bucket policy `user_id/` öneki.
 *   - Prisma metadata (bucket, path, mime, hash, byteSize); bytes nesne depoda.
 *   - Kısa ömürlü imzalı GET ile tezgâh. Kamu URL yok.
 */

import { isSupabaseUserId } from "@/lib/kernel/auth/ids";
import { ForbiddenError, PayloadTooLargeError, ServiceUnavailableError } from "@/lib/kernel/http/errors";
import { sha256Hex } from "@/lib/kernel/crypto/sha256";
import { STUDIO_IMAGE_DATA_BASE64_MAX_CHARS } from "@/lib/kernel/storage/byte-ceilings";

/** Base64 karakter tavanı (2 MiB metin ≈ 1.5 MiB decoded). CHECK ile aynı sayı. */
export { STUDIO_IMAGE_DATA_BASE64_MAX_CHARS };

/** Decoded byte tavanı — Base64 tavanının 3/4'ü. Nesne depo PUT aynı sayıyı taşır. */
export const STUDIO_IMAGE_DECODED_MAX_BYTES = Math.floor((STUDIO_IMAGE_DATA_BASE64_MAX_CHARS * 3) / 4);

/** Yeni üretim varsayılanı. Eski satır okuma `inline-base64` kalır. */
export const STUDIO_STORAGE_BACKEND = "object-store" as const;

export const STUDIO_STORAGE_BUCKET = "studio-assets" as const;

export const STUDIO_ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

/** İmza TTL — dakikalar. Storage URL daha uzun yaşasa da sözleşme bu. */
export const STUDIO_SIGNED_UPLOAD_TTL_SECONDS = 300;

export const STUDIO_SIGNED_READ_TTL_SECONDS = 300;

/** CHECK sütunu durur; nesne depo satırında gövde yoktur. */
export const STUDIO_EMPTY_DATA_BASE64 = "";

export type StudioAllowedMimeType = (typeof STUDIO_ALLOWED_MIME_TYPES)[number];

export type StudioStorageKind = "inline-base64" | "object-store";

export type StudioAssetBlob = {
  mimeType: string;
  dataBase64: string;
};

export type StudioObjectStoreMetadata = {
  bucket: typeof STUDIO_STORAGE_BUCKET;
  objectPath: string;
  mimeType: StudioAllowedMimeType;
  byteSize: number;
  contentHash: string;
};

export type StudioAssetLocator =
  | { kind: "inline-base64"; mimeType: string; dataBase64: string }
  | {
      kind: "object-store";
      bucket: string;
      path: string;
      mimeType: string;
      byteSize: number;
      contentHash: string;
    };

export type StudioAssetStorage = {
  put(input: { userId: string; generationId: string; blob: StudioAssetBlob }): Promise<StudioAssetLocator>;
  get(locator: StudioAssetLocator): Promise<StudioAssetBlob>;
};

export type StudioSignedUploadIntent = {
  bucket: typeof STUDIO_STORAGE_BUCKET;
  objectPath: string;
  mimeType: StudioAllowedMimeType;
  maxBytes: number;
  signedPutUrl: string;
  expiresAt: string;
};

export type StudioSignedUploadTicket = {
  signedPutUrl: string;
  token: string;
  expiresAt: Date;
};

/** Vatandaş JWT ile Storage. `service_role` yok. */
export type StudioObjectStoreGateway = {
  createSignedUploadUrl(
    path: string,
    options?: { upsert?: boolean },
  ): Promise<StudioSignedUploadTicket>;
  uploadToSignedUrl(path: string, token: string, body: Uint8Array, mimeType: StudioAllowedMimeType): Promise<void>;
  objectInfo(path: string): Promise<{ byteSize: number; mimeType: string | null } | null>;
  createSignedReadUrl(path: string, expiresIn?: number): Promise<string>;
};

export function assertStudioImagePayloadCeiling(dataBase64: string): string {
  if (dataBase64.length > STUDIO_IMAGE_DATA_BASE64_MAX_CHARS) {
    throw new PayloadTooLargeError(
      "Sınır aşıldığında bakiyeden düşüm yapılmaz. Studio görsel yükü tavanı aşıldı.",
    );
  }
  return dataBase64;
}

export function assertStudioByteSize(byteSize: number): number {
  if (!Number.isInteger(byteSize) || byteSize <= 0 || byteSize > STUDIO_IMAGE_DECODED_MAX_BYTES) {
    throw new PayloadTooLargeError(
      "Sınır aşıldığında bakiyeden düşüm yapılmaz. Studio görsel yükü tavanı aşıldı.",
    );
  }
  return byteSize;
}

export function decodeStudioImageBytes(dataBase64: string): Buffer {
  assertStudioImagePayloadCeiling(dataBase64);
  const bytes = Buffer.from(dataBase64, "base64");
  assertStudioByteSize(bytes.byteLength);
  return bytes;
}

export function assertStudioMimeType(mimeType: string): StudioAllowedMimeType {
  const trimmed = normalizeStudioMimeType(mimeType);
  if ((STUDIO_ALLOWED_MIME_TYPES as readonly string[]).includes(trimmed)) {
    return trimmed as StudioAllowedMimeType;
  }
  throw new ForbiddenError("Studio görsel türü kabul edilmez.");
}

export function normalizeStudioMimeType(mimeType: string): string {
  return mimeType.split(";")[0]?.trim().toLowerCase() ?? "";
}

export function assertStudioContentHash(contentHash: string): string {
  const hash = contentHash.trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(hash)) {
    throw new ForbiddenError("Studio içerik mührü geçersiz.");
  }
  return hash;
}

export function studioObjectExtension(mimeType: StudioAllowedMimeType): "png" | "jpg" | "webp" {
  if (mimeType === "image/jpeg") {
    return "jpg";
  }
  if (mimeType === "image/webp") {
    return "webp";
  }
  return "png";
}

export function buildStudioObjectPath(
  userId: string,
  generationId: string,
  mimeType: StudioAllowedMimeType,
): string {
  if (!isSupabaseUserId(userId) || !generationId.trim()) {
    throw new ForbiddenError("Studio nesne yolu geçersiz.");
  }
  return `${userId}/${generationId.trim()}.${studioObjectExtension(mimeType)}`;
}

export function assertStudioObjectOwnerPath(userId: string, objectPath: string): string {
  const path = objectPath.trim();
  const prefix = `${userId}/`;
  if (!isSupabaseUserId(userId) || !path.startsWith(prefix) || path.includes("..") || path.includes("//")) {
    throw new ForbiddenError("Vatandaş yalnız kendi nesnesini okur.");
  }
  return path;
}

export function studioImageBytesHash(bytes: Buffer | Uint8Array): string {
  return sha256Hex(bytes);
}

export function locatorFromStudioAsset(input: {
  storageKind: StudioStorageKind;
  mimeType: string;
  dataBase64: string;
  bucket: string | null;
  objectPath: string | null;
  byteSize: number | null;
  contentHash: string;
  storageConfirmedAt: Date | null;
}): StudioAssetLocator | null {
  if (input.storageKind === "object-store" && input.objectPath && input.storageConfirmedAt) {
    return {
      kind: "object-store",
      bucket: input.bucket ?? STUDIO_STORAGE_BUCKET,
      path: input.objectPath,
      mimeType: input.mimeType,
      byteSize: input.byteSize ?? 0,
      contentHash: input.contentHash,
    };
  }
  if (input.dataBase64.length > 0) {
    return {
      kind: "inline-base64",
      mimeType: input.mimeType,
      dataBase64: input.dataBase64,
    };
  }
  return null;
}

export function studioAssetPreviewSrc(input: {
  previewUrl?: string | null;
  mimeType: string;
  dataBase64: string;
}): string | null {
  if (input.previewUrl) {
    return input.previewUrl;
  }
  if (input.dataBase64.length > 0) {
    return `data:${input.mimeType};base64,${input.dataBase64}`;
  }
  return null;
}

function objectStoreUnavailable(): StudioAssetStorage {
  return {
    async put() {
      throw new ServiceUnavailableError("Studio nesne depo bağlı değil.");
    },
    async get() {
      throw new ServiceUnavailableError("Studio nesne depo bağlı değil.");
    },
  };
}

/**
 * Eski Base64 taşıyıcı. Object-store locator get etmez — dual-read üst katmanda.
 */
export function createInlineStudioAssetStorage(): StudioAssetStorage {
  return {
    async put({ blob }) {
      const mimeType = assertStudioMimeType(blob.mimeType);
      decodeStudioImageBytes(blob.dataBase64);
      return {
        kind: "inline-base64",
        mimeType,
        dataBase64: blob.dataBase64,
      };
    },
    async get(locator) {
      if (locator.kind !== "inline-base64") {
        throw new Error("Studio inline taşıyıcı nesne depo okumaz.");
      }
      return { mimeType: locator.mimeType, dataBase64: locator.dataBase64 };
    },
  };
}

/**
 * İmzalı PUT. Gateway vatandaş JWT taşır; `service_role` yok.
 * Gateway yoksa fail-closed 503 — debit çağıran katmanda durur.
 */
export function createObjectStoreStudioAssetStorage(
  gateway?: StudioObjectStoreGateway,
): StudioAssetStorage {
  if (!gateway) {
    return objectStoreUnavailable();
  }
  return {
    async put({ userId, generationId, blob }) {
      const mimeType = assertStudioMimeType(blob.mimeType);
      const bytes = decodeStudioImageBytes(blob.dataBase64);
      const objectPath = assertStudioObjectOwnerPath(
        userId,
        buildStudioObjectPath(userId, generationId, mimeType),
      );
      const ticket = await gateway.createSignedUploadUrl(objectPath, { upsert: true });
      await gateway.uploadToSignedUrl(objectPath, ticket.token, bytes, mimeType);
      return {
        kind: "object-store",
        bucket: STUDIO_STORAGE_BUCKET,
        path: objectPath,
        mimeType,
        byteSize: bytes.byteLength,
        contentHash: studioImageBytesHash(bytes),
      };
    },
    async get() {
      throw new Error("Nesne depo gövdesi Next üzerinden inmez; imzalı GET kullan.");
    },
  };
}

/** Dashboard Storage CORS — kod SSOT. Joker origin ve PUT dışı metod yasak. */
export const STUDIO_STORAGE_CORS_ALLOWED_METHODS = ["PUT"] as const;
export const STUDIO_STORAGE_CORS_WILDCARD_ORIGIN = "*";
export const STUDIO_STORAGE_CORS_ALLOWED_HEADERS = ["content-type", "x-upsert"] as const;

export function studioStorageCorsOrigin(appUrl: string): string {
  return new URL(appUrl.trim()).origin;
}

export function parseCorsAllowMethods(header: string | null | undefined): string[] {
  return (header ?? "")
    .split(",")
    .map((token) => token.trim().toUpperCase())
    .filter((token) => token.length > 0);
}

/**
 * Canlı OPTIONS yanıtı sözleşmesi: origin = NEXT_PUBLIC_APP_URL origin, metod yalnız PUT.
 * `*` veya GET/DELETE/POST joker metod fail-closed.
 */
export function assertStudioStorageCorsHeaders(
  headers: {
    allowOrigin: string | null | undefined;
    allowMethods: string | null | undefined;
  },
  appUrl: string,
): { origin: string; methods: string[] } {
  const origin = studioStorageCorsOrigin(appUrl);
  const allowOrigin = (headers.allowOrigin ?? "").trim();
  if (!allowOrigin || allowOrigin === STUDIO_STORAGE_CORS_WILDCARD_ORIGIN) {
    throw new Error(
      "Storage CORS joker origin (*) yasak. Dashboard yalnız NEXT_PUBLIC_APP_URL origin PUT.",
    );
  }
  if (allowOrigin !== origin) {
    throw new Error(
      `Storage CORS origin ${allowOrigin} ≠ ${origin}. Yalnız NEXT_PUBLIC_APP_URL origin.`,
    );
  }
  const methods = parseCorsAllowMethods(headers.allowMethods);
  const extra = methods.filter((method) => method !== "PUT" && method !== "OPTIONS");
  if (!methods.includes("PUT") || extra.length > 0) {
    throw new Error(
      "Storage CORS metodu yalnız PUT (preflight OPTIONS). GET/DELETE/POST/PATCH yasak.",
    );
  }
  return { origin, methods };
}

/** Yetkisiz kök dumanı — tarayıcıya joker veya yabancı origin yansıtılmaz. */
export const STUDIO_STORAGE_CORS_FOREIGN_PROBE_ORIGIN = "https://evil.example" as const;

export function assertStudioStorageCorsRejectsForeignOrigin(
  headers: { allowOrigin: string | null | undefined },
  foreignOrigin: string = STUDIO_STORAGE_CORS_FOREIGN_PROBE_ORIGIN,
): void {
  const allowOrigin = (headers.allowOrigin ?? "").trim();
  if (!allowOrigin) {
    return;
  }
  if (allowOrigin === STUDIO_STORAGE_CORS_WILDCARD_ORIGIN) {
    throw new Error(
      "Storage CORS yetkisiz köke açık: joker origin (*). Dashboard yalnız Rail origin PUT.",
    );
  }
  if (allowOrigin === foreignOrigin.trim()) {
    throw new Error(
      `Storage CORS yetkisiz kökü yansıtır (${foreignOrigin}). Yabancı origin kapatılmalı.`,
    );
  }
}
