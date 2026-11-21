import "server-only";

import { getPrisma, withDbReadTimeout } from "@/lib/kernel/db";
import { BadRequestError } from "@/lib/kernel/http/errors";
import { normalizeGoogleModelId } from "@/lib/kernel/ai/model-roles";

/** Tek satır. Akademi mühür katmanları bu kimliği okumaz. */
export const PRODUCT_MODEL_SETTING_ID = "product" as const;

export const PRODUCT_MODEL_SLOTS = [
  "textEasy",
  "textDeep",
  "imageEasy",
  "imageDeep",
  "voiceEasy",
  "voiceDeep",
] as const;

export type ProductModelSlot = (typeof PRODUCT_MODEL_SLOTS)[number];

export const PRODUCT_MODEL_DEFAULTS: Record<ProductModelSlot, string> = {
  textEasy: "gemini-3.5-flash-lite",
  textDeep: "gemini-4-hydrogen",
  imageEasy: "gemini-3.1-flash-lite-image",
  imageDeep: "gemini-3.1-flash-image",
  voiceEasy: "gemini-3.8-flash-lite-tts",
  voiceDeep: "gemini-3.8-flash-tts",
};

/** `normalizeGoogleModelId` sonrası. Boş dize bu kalıba girmez; kayıt `null` olur. */
export const PRODUCT_MODEL_ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,80}$/;

const PRODUCT_MODEL_CACHE_MS = 20_000;
const PRODUCT_MODEL_READ_TIMEOUT_MS = 2_000;

const SLOT_COLUMN = {
  textEasy: "textEasyModelId",
  textDeep: "textDeepModelId",
  imageEasy: "imageEasyModelId",
  imageDeep: "imageDeepModelId",
  voiceEasy: "voiceEasyModelId",
  voiceDeep: "voiceDeepModelId",
} as const satisfies Record<ProductModelSlot, string>;

export type ProductModelSettingRow = {
  textEasyModelId: string | null;
  textDeepModelId: string | null;
  imageEasyModelId: string | null;
  imageDeepModelId: string | null;
  voiceEasyModelId: string | null;
  voiceDeepModelId: string | null;
  updatedBy: string | null;
  updatedAt: Date | null;
};

type ProductModelReader = () => Promise<ProductModelSettingRow | null>;

type ProductModelCache = {
  expiresAt: number;
  row: ProductModelSettingRow | null;
};

let cache: ProductModelCache | null = null;
let readerForTests: ProductModelReader | null = null;

export function invalidateProductModelCache(): void {
  cache = null;
}

/** Yalnız test. Üretim çağırmaz. */
export function setProductModelReaderForTests(reader: ProductModelReader | null): void {
  readerForTests = reader;
  invalidateProductModelCache();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function parseOptionalProductModelId(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  if (typeof value !== "string") {
    throw new BadRequestError("Model kimliği metin olmalı.");
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const normalized = normalizeGoogleModelId(trimmed);
  if (!PRODUCT_MODEL_ID_PATTERN.test(normalized)) {
    throw new BadRequestError("Model kimliği güvenli biçimde değil.");
  }
  return normalized;
}

export function parseProductModelPatch(body: unknown): Record<ProductModelSlot, string | null> {
  if (!isRecord(body)) {
    throw new BadRequestError("İstek gövdesi yok.");
  }
  const slots = {} as Record<ProductModelSlot, string | null>;
  for (const slot of PRODUCT_MODEL_SLOTS) {
    const key = SLOT_COLUMN[slot];
    if (!Object.prototype.hasOwnProperty.call(body, key)) {
      throw new BadRequestError("Altı yuva birlikte gönderilir.");
    }
    slots[slot] = parseOptionalProductModelId(body[key]);
  }
  return slots;
}

function emptyStored(): Record<ProductModelSlot, string | null> {
  return {
    textEasy: null,
    textDeep: null,
    imageEasy: null,
    imageDeep: null,
    voiceEasy: null,
    voiceDeep: null,
  };
}

function storedFromRow(row: ProductModelSettingRow | null): Record<ProductModelSlot, string | null> {
  const stored = emptyStored();
  if (!row) {
    return stored;
  }
  for (const slot of PRODUCT_MODEL_SLOTS) {
    const raw = row[SLOT_COLUMN[slot]];
    stored[slot] = typeof raw === "string" && raw.trim() ? raw : null;
  }
  return stored;
}

async function readSettingRow(): Promise<ProductModelSettingRow | null> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) {
    return cache.row;
  }
  try {
    const row = readerForTests
      ? await readerForTests()
      : await withDbReadTimeout(
          getPrisma().aiProductModelSetting.findUnique({
            where: { id: PRODUCT_MODEL_SETTING_ID },
            select: {
              textEasyModelId: true,
              textDeepModelId: true,
              imageEasyModelId: true,
              imageDeepModelId: true,
              voiceEasyModelId: true,
              voiceDeepModelId: true,
              updatedBy: true,
              updatedAt: true,
            },
          }),
          PRODUCT_MODEL_READ_TIMEOUT_MS,
          "ai_product_model_settings",
        );
    cache = { expiresAt: now + PRODUCT_MODEL_CACHE_MS, row };
    return row;
  } catch {
    cache = { expiresAt: now + PRODUCT_MODEL_CACHE_MS, row: null };
    return null;
  }
}

function acceptedModelId(raw: string | null, fallback: string): string {
  if (!raw) {
    return fallback;
  }
  const normalized = normalizeGoogleModelId(raw);
  return PRODUCT_MODEL_ID_PATTERN.test(normalized) ? normalized : fallback;
}

/**
 * Çağrı anı. Satır yok, kolon boş veya okuma hatası: yuvanın kod varsayılanı.
 * Süreç içi önbellek 20 sn. Yazma `invalidateProductModelCache` çağırır.
 */
export async function resolveProductModel(slot: ProductModelSlot): Promise<string> {
  const fallback = PRODUCT_MODEL_DEFAULTS[slot];
  const row = await readSettingRow();
  const raw = row ? row[SLOT_COLUMN[slot]] : null;
  return acceptedModelId(raw, fallback);
}

export async function readProductModelSnapshot(): Promise<{
  stored: Record<ProductModelSlot, string | null>;
  resolved: Record<ProductModelSlot, string>;
  updatedBy: string | null;
  updatedAt: string | null;
}> {
  const row = await readSettingRow();
  const stored = storedFromRow(row);
  const resolved = {} as Record<ProductModelSlot, string>;
  for (const slot of PRODUCT_MODEL_SLOTS) {
    resolved[slot] = acceptedModelId(stored[slot], PRODUCT_MODEL_DEFAULTS[slot]);
  }
  return {
    stored,
    resolved,
    updatedBy: row?.updatedBy ?? null,
    updatedAt: row?.updatedAt ? row.updatedAt.toISOString() : null,
  };
}
