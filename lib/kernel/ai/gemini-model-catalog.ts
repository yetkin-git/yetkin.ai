import "server-only";

import { resolveGeminiGatewayClient } from "@/lib/kernel/ai/providers/gemini";
import { logEvent } from "@/lib/kernel/observability/log";
import {
  PRODUCT_MODEL_DEFAULTS,
  PRODUCT_MODEL_SLOTS,
  type ProductModelSlot,
} from "@/lib/kernel/ai/product-models";
import {
  ACADEMY_SEALED_MEDIA_MODEL,
  AI_MODEL_ROLE_DEFAULTS,
  GEMINI_HYDROGEN_MODEL,
} from "@/lib/kernel/ai/model-roles";

export type ProductModelKind = "text" | "image" | "voice" | "other";

export type ProductCatalogModel = {
  id: string;
  displayName: string;
  methods: string[];
  kind: ProductModelKind;
};

const CATALOG_CACHE_MS = 10 * 60_000;
const CATALOG_TIMEOUT_MS = 8_000;

const SLOT_KIND: Record<ProductModelSlot, ProductModelKind> = {
  textEasy: "text",
  textDeep: "text",
  imageEasy: "image",
  imageDeep: "image",
  voiceEasy: "voice",
  voiceDeep: "voice",
};

const SLOT_LABEL: Record<ProductModelSlot, string> = {
  textEasy: "Kolay ve hızlı metin",
  textDeep: "Kapsamlı metin",
  imageEasy: "Kolay ve hızlı görsel",
  imageDeep: "Yüksek kalite görsel",
  voiceEasy: "Kolay ve hızlı seslendirme",
  voiceDeep: "Yüksek kalite seslendirme",
};

type RawListedModel = {
  name?: string;
  displayName?: string;
  supportedGenerationMethods?: string[];
  supportedActions?: string[];
};

type CatalogCache = {
  expiresAt: number;
  models: ProductCatalogModel[];
};

let catalogCache: CatalogCache | null = null;

export function invalidateProductModelCatalogCache(): void {
  catalogCache = null;
}

export function classifyProductModel(id: string, methods: readonly string[]): ProductModelKind {
  const haystack = `${id} ${methods.join(" ")}`.toLowerCase();
  if (haystack.includes("tts") || haystack.includes("speech")) {
    return "voice";
  }
  if (
    id.toLowerCase().includes("image") ||
    id.toLowerCase().includes("imagen") ||
    methods.some((method) => method.toLowerCase().includes("image"))
  ) {
    return "image";
  }
  if (
    methods.some((method) => method.toLowerCase().includes("generatecontent")) ||
    id.startsWith("gemini") ||
    id.startsWith("gemma")
  ) {
    return "text";
  }
  return "other";
}

function methodsOf(model: RawListedModel): string[] {
  const raw = model.supportedGenerationMethods ?? model.supportedActions ?? [];
  return raw.filter((method): method is string => typeof method === "string" && method.trim().length > 0);
}

function catalogModel(id: string, displayName: string, methods: string[] = []): ProductCatalogModel | null {
  const trimmed = id.trim().replace(/^models\//, "");
  if (!trimmed) {
    return null;
  }
  return {
    id: trimmed,
    displayName: displayName.trim() || trimmed,
    methods,
    kind: classifyProductModel(trimmed, methods),
  };
}

/** Seçiciler boş kalmasın diye kodda duran güncel kimlikler. */
export function fallbackProductModelCatalog(): ProductCatalogModel[] {
  const rows: ProductCatalogModel[] = [];
  const seen = new Set<string>();
  const push = (id: string, displayName: string) => {
    const model = catalogModel(id, displayName);
    if (!model || seen.has(model.id)) {
      return;
    }
    seen.add(model.id);
    rows.push(model);
  };
  for (const slot of PRODUCT_MODEL_SLOTS) {
    push(PRODUCT_MODEL_DEFAULTS[slot], SLOT_LABEL[slot]);
  }
  push(GEMINI_HYDROGEN_MODEL, "Hydrogen");
  for (const id of Object.values(AI_MODEL_ROLE_DEFAULTS)) {
    push(id, id);
  }
  for (const id of Object.values(ACADEMY_SEALED_MEDIA_MODEL)) {
    push(id, id);
  }
  return rows;
}

function mergeWithDefaults(models: ProductCatalogModel[]): ProductCatalogModel[] {
  const seen = new Set(models.map((model) => model.id));
  const extra = fallbackProductModelCatalog().filter((model) => !seen.has(model.id));
  return [...models, ...extra];
}

async function collectListedModels(): Promise<ProductCatalogModel[]> {
  const client = resolveGeminiGatewayClient();
  if (!client) {
    throw new Error("gemini-client-missing");
  }
  const listed = await client.models.list({ config: { pageSize: 100 } });
  const raw: RawListedModel[] = [];
  const iterable = listed as AsyncIterable<RawListedModel>;
  if (typeof iterable[Symbol.asyncIterator] !== "function") {
    throw new Error("gemini-model-list-shape");
  }
  for await (const model of iterable) {
    raw.push(model);
    if (raw.length >= 300) {
      break;
    }
  }
  const models: ProductCatalogModel[] = [];
  const seen = new Set<string>();
  for (const model of raw) {
    const id = typeof model.name === "string" ? model.name : "";
    const row = catalogModel(id, typeof model.displayName === "string" ? model.displayName : id, methodsOf(model));
    if (!row || seen.has(row.id)) {
      continue;
    }
    seen.add(row.id);
    models.push(row);
  }
  if (models.length === 0) {
    throw new Error("gemini-model-list-empty");
  }
  return models;
}

async function withCatalogTimeout<T>(work: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error("gemini-model-list-timeout")), CATALOG_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

/**
 * Google model listesi. Anahtar bu fonksiyondan çıkmaz.
 * Liste başarısızsa kod varsayılanları ve bilinen güncel kimlikler döner.
 */
export async function listProductModelCatalog(refresh: boolean): Promise<{
  models: ProductCatalogModel[];
  source: "google" | "fallback";
}> {
  const now = Date.now();
  if (!refresh && catalogCache && catalogCache.expiresAt > now) {
    return { models: catalogCache.models, source: "google" };
  }
  try {
    const models = mergeWithDefaults(await withCatalogTimeout(collectListedModels()));
    catalogCache = { expiresAt: now + CATALOG_CACHE_MS, models };
    return { models, source: "google" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const reason =
      message === "gemini-client-missing" ||
      message === "gemini-model-list-shape" ||
      message === "gemini-model-list-empty" ||
      message === "gemini-model-list-timeout"
        ? message
        : "list-failed";
    logEvent({
      level: "error",
      event: "admin.ai_models.list_failed",
      errorName: error instanceof Error ? error.name : "unknown",
      reason,
    });
    return { models: fallbackProductModelCatalog(), source: "fallback" };
  }
}

export function productModelKind(slot: ProductModelSlot): ProductModelKind {
  return SLOT_KIND[slot];
}
