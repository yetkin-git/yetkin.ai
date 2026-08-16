export const MODULE_ID = "studio" as const;

/** Faz 4 dar yüzey — tek üretim peronu; 15 peron yok. */
export const STUDIO_HAPPY_PATH = ["draft", "invoke-llm", "token-usage", "wallet-debit"] as const;

/** S57-A — ikinci yüzey yalnız IMAGE_GEN. */
export const STUDIO_IMAGE_PATH = [
  "prompt",
  "generate-image",
  "token-usage",
  "wallet-debit",
  "digital-asset",
] as const;

export type StudioHappyPathStep = (typeof STUDIO_HAPPY_PATH)[number];
export type StudioImagePathStep = (typeof STUDIO_IMAGE_PATH)[number];

export { STUDIO_GENERATION_UNIT_KEY, STUDIO_IMAGE_CATALOG_MISSING, STUDIO_IMAGE_UNIT_KEY, STUDIO_MODULE_KEY } from "@/lib/studio/types";
export { createStudioDraft, generateStudioContent } from "@/lib/studio/engine";
export { generateStudioImage } from "@/lib/studio/image-engine";
export {
  STUDIO_IMAGE_DATA_BASE64_MAX_CHARS,
  STUDIO_IMAGE_DECODED_MAX_BYTES,
  STUDIO_STORAGE_BACKEND,
  STUDIO_STORAGE_BUCKET,
  STUDIO_ALLOWED_MIME_TYPES,
  STUDIO_SIGNED_UPLOAD_TTL_SECONDS,
  STUDIO_EMPTY_DATA_BASE64,
  assertStudioImagePayloadCeiling,
  assertStudioByteSize,
  assertStudioMimeType,
  assertStudioContentHash,
  assertStudioObjectOwnerPath,
  buildStudioObjectPath,
  locatorFromStudioAsset,
  studioAssetPreviewSrc,
  createInlineStudioAssetStorage,
  createObjectStoreStudioAssetStorage,
} from "@/lib/studio/storage";
export type {
  StudioAssetLocator,
  StudioObjectStoreMetadata,
  StudioObjectStoreGateway,
  StudioSignedUploadIntent,
  StudioStorageKind,
} from "@/lib/studio/storage";
export { signStudioUpload, confirmStudioUpload } from "@/lib/studio/signed-upload";
export {
  createStudioDraftInputSchema,
  generateStudioInputSchema,
  generateStudioImageInputSchema,
  studioSignUploadInputSchema,
  studioConfirmUploadInputSchema,
} from "@/lib/studio/schemas";
export { resolveStudioDebitMinor } from "@/lib/studio/billing";
export type {
  StudioDigitalAssetRecord,
  StudioDraftRecord,
  StudioGenerationRecord,
  StudioPulse,
  StudioStore,
} from "@/lib/studio/types";
