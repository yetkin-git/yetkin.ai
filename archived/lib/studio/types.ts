import type { AmountMinor } from "@/lib/kernel/money/amount-minor";
import type { CurrencyCode } from "@/lib/kernel/money/currency";
import type { AiTokenUsageRecord } from "@/lib/kernel/ai/usage-store";
import type { StudioStorageKind } from "@/lib/studio/storage";

export type { StudioStorageKind } from "@/lib/studio/storage";

export const STUDIO_MODULE_KEY = "studio" as const;

/** Super Admin katalog birimi — kod sabiti satış fiyatı yok (S11-A). */
export const STUDIO_GENERATION_UNIT_KEY = "generation:text" as const;

export const STUDIO_IMAGE_UNIT_KEY = "generation:image" as const;

/** Katalog satırı yokken vatandaş 4xx — debit yok. */
export const STUDIO_IMAGE_CATALOG_MISSING =
  "Görsel fiyatı katalogda henüz yok. Üretim durur; bakiyeden düşüm yok.";

export const STUDIO_GENERATION_ROLE = "FAST_STREAM" as const;

export const STUDIO_IMAGE_GENERATION_ROLE = "IMAGE_GEN" as const;

export type StudioDraftStatus = "OPEN" | "ARCHIVED";

export type StudioGenerationStatus = "SUCCEEDED" | "FAILED";

export type StudioAssetType = "IMAGE";

export type StudioDraftRecord = {
  id: string;
  userId: string;
  title: string;
  prompt: string;
  status: StudioDraftStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type StudioGenerationRecord = {
  id: string;
  userId: string;
  draftId: string;
  prompt: string;
  outputText: string | null;
  status: StudioGenerationStatus;
  roleKey: string;
  provider: string | null;
  model: string | null;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costMinor: AmountMinor;
  debitMinor: AmountMinor;
  currencyCode: CurrencyCode;
  usageId: string | null;
  ledgerDebitKey: string | null;
  failureReason: string | null;
  createdAt: Date;
  completedAt: Date | null;
};

export type StudioDigitalAssetRecord = {
  id: string;
  userId: string;
  generationId: string;
  assetType: StudioAssetType;
  mimeType: string;
  contentHash: string;
  promptHash: string;
  dataBase64: string;
  storageKind: StudioStorageKind;
  bucket: string | null;
  objectPath: string | null;
  byteSize: number | null;
  storageConfirmedAt: Date | null;
  previewUrl?: string | null;
  createdAt: Date;
};

export type StudioPulse = {
  draftsCount: number;
  generationsSucceeded: number;
  lastDraftTitle: string | null;
  lastDebitMinor: AmountMinor;
  currencyCode: CurrencyCode;
};

export type StudioStore = {
  insertDraft(draft: StudioDraftRecord): Promise<StudioDraftRecord>;
  getDraft(id: string): Promise<StudioDraftRecord | null>;
  listDraftsForUser(userId: string): Promise<StudioDraftRecord[]>;
  insertGeneration(generation: StudioGenerationRecord): Promise<StudioGenerationRecord>;
  getGeneration(id: string): Promise<StudioGenerationRecord | null>;
  listGenerationsForUser(userId: string): Promise<StudioGenerationRecord[]>;
  insertDigitalAsset(asset: StudioDigitalAssetRecord): Promise<StudioDigitalAssetRecord>;
  updateDigitalAsset(asset: StudioDigitalAssetRecord): Promise<StudioDigitalAssetRecord>;
  getDigitalAssetByGenerationId(generationId: string): Promise<StudioDigitalAssetRecord | null>;
  listDigitalAssetsForUser(userId: string): Promise<StudioDigitalAssetRecord[]>;
  pulseForUser(userId: string): Promise<StudioPulse>;
};

export type StudioUsageBinding = {
  usage: AiTokenUsageRecord;
  ledgerDebitKey: string;
};
