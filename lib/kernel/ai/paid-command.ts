import { randomUUID } from "node:crypto";
import { isIdempotencyKey } from "@/lib/kernel/http/idempotency-key";
import type { AmountMinor } from "@/lib/kernel/money/amount-minor";
import type { CurrencyCode } from "@/lib/kernel/money/currency";
import type { LlmProviderId, LlmUsage } from "@/lib/kernel/ai/types";

export const PAID_COMMAND_SCOPES = ["studio.generate", "studio.image", "devlabs.generate"] as const;

export type PaidCommandScope = (typeof PAID_COMMAND_SCOPES)[number];

export type PaidCommandStatus = "RESERVED" | "PROVIDER_DONE" | "SETTLED" | "FAILED";

export type PaidCommandRecord = {
  id: string;
  userId: string;
  scope: PaidCommandScope;
  commandKey: string;
  requestHash: string;
  status: PaidCommandStatus;
  estimatedMinor: AmountMinor;
  currencyCode: CurrencyCode;
  providerJson: string | null;
  resultId: string | null;
  createdAt: Date;
  updatedAt: Date;
  settledAt: Date | null;
};

export type PaidCommandBeginResult =
  | { kind: "created"; record: PaidCommandRecord }
  | { kind: "replay"; record: PaidCommandRecord }
  | { kind: "resume"; record: PaidCommandRecord }
  | { kind: "retry"; record: PaidCommandRecord }
  | { kind: "conflict" };

export type PaidCommandStore = {
  begin(input: {
    userId: string;
    scope: PaidCommandScope;
    commandKey: string;
    requestHash: string;
    estimatedMinor: AmountMinor;
    currencyCode: CurrencyCode;
    now?: Date;
  }): Promise<PaidCommandBeginResult>;
  saveProviderOutput(input: {
    userId: string;
    scope: PaidCommandScope;
    commandKey: string;
    providerJson: string;
    now?: Date;
  }): Promise<PaidCommandRecord>;
  markSettled(input: {
    userId: string;
    scope: PaidCommandScope;
    commandKey: string;
    resultId: string;
    now?: Date;
  }): Promise<void>;
  find(input: {
    userId: string;
    scope: PaidCommandScope;
    commandKey: string;
  }): Promise<PaidCommandRecord | null>;
};

export const PAID_COMMAND_KEY_REQUIRED = "Üretim komutu Idempotency-Key ister.";

export function requirePaidCommandKey(value: string | undefined): string {
  const key = value?.trim() ?? "";
  if (!key || !isIdempotencyKey(key)) {
    throw new Error(PAID_COMMAND_KEY_REQUIRED);
  }
  return key;
}

export type LlmTextProviderPayload = {
  kind: "llm-text";
  text: string;
  provider: LlmProviderId;
  model: string;
  usage: LlmUsage;
};

export type ImageProviderPayload = {
  kind: "image";
  mimeType: string;
  dataBase64: string;
  provider: LlmProviderId;
  model: string;
  usage: LlmUsage;
  storageKind?: "inline-base64" | "object-store";
  bucket?: string | null;
  objectPath?: string | null;
  byteSize?: number | null;
  contentHash?: string;
};

export function serializeProviderPayload(
  payload: LlmTextProviderPayload | ImageProviderPayload,
): string {
  return JSON.stringify(payload);
}

export function parseLlmTextProviderPayload(raw: string): LlmTextProviderPayload {
  const parsed: unknown = JSON.parse(raw);
  if (!isRecord(parsed) || parsed.kind !== "llm-text") {
    throw new Error("Üretim rezervi metin yükü bozuk.");
  }
  if (typeof parsed.text !== "string" || typeof parsed.provider !== "string" || typeof parsed.model !== "string") {
    throw new Error("Üretim rezervi metin yükü bozuk.");
  }
  return {
    kind: "llm-text",
    text: parsed.text,
    provider: requireLlmProviderId(parsed.provider),
    model: parsed.model,
    usage: requireUsage(parsed.usage),
  };
}

export function parseImageProviderPayload(raw: string): ImageProviderPayload {
  const parsed: unknown = JSON.parse(raw);
  if (!isRecord(parsed) || parsed.kind !== "image") {
    throw new Error("Üretim rezervi görsel yükü bozuk.");
  }
  if (
    typeof parsed.mimeType !== "string" ||
    typeof parsed.dataBase64 !== "string" ||
    typeof parsed.provider !== "string" ||
    typeof parsed.model !== "string"
  ) {
    throw new Error("Üretim rezervi görsel yükü bozuk.");
  }
  return {
    kind: "image",
    mimeType: parsed.mimeType,
    dataBase64: parsed.dataBase64,
    provider: requireLlmProviderId(parsed.provider),
    model: parsed.model,
    usage: requireUsage(parsed.usage),
    storageKind: parsed.storageKind === "object-store" ? "object-store" : "inline-base64",
    bucket: typeof parsed.bucket === "string" ? parsed.bucket : null,
    objectPath: typeof parsed.objectPath === "string" ? parsed.objectPath : null,
    byteSize: typeof parsed.byteSize === "number" ? parsed.byteSize : null,
    contentHash: typeof parsed.contentHash === "string" ? parsed.contentHash : undefined,
  };
}

export function newPaidCommandRecord(input: {
  userId: string;
  scope: PaidCommandScope;
  commandKey: string;
  requestHash: string;
  estimatedMinor: AmountMinor;
  currencyCode: CurrencyCode;
  now: Date;
}): PaidCommandRecord {
  return {
    id: randomUUID(),
    userId: input.userId,
    scope: input.scope,
    commandKey: input.commandKey,
    requestHash: input.requestHash,
    status: "RESERVED",
    estimatedMinor: input.estimatedMinor,
    currencyCode: input.currencyCode,
    providerJson: null,
    resultId: null,
    createdAt: input.now,
    updatedAt: input.now,
    settledAt: null,
  };
}

export function classifyExistingPaidCommand(
  existing: PaidCommandRecord,
  requestHash: string,
): PaidCommandBeginResult {
  if (existing.requestHash !== requestHash) {
    return { kind: "conflict" };
  }
  if (existing.status === "SETTLED") {
    return { kind: "replay", record: existing };
  }
  if (existing.status === "PROVIDER_DONE" && existing.providerJson) {
    return { kind: "resume", record: existing };
  }
  return { kind: "retry", record: existing };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

const LLM_PROVIDER_IDS = new Set<LlmProviderId>(["gemini", "openai", "anthropic", "sovereign"]);

function requireLlmProviderId(value: unknown): LlmProviderId {
  if (typeof value !== "string" || !LLM_PROVIDER_IDS.has(value as LlmProviderId)) {
    throw new Error("Üretim rezervi sağlayıcı kimliği bozuk.");
  }
  return value as LlmProviderId;
}

function requireUsage(value: unknown): LlmUsage {
  if (!isRecord(value)) {
    throw new Error("Üretim rezervi kullanım yükü bozuk.");
  }
  const promptTokens = value.promptTokens;
  const completionTokens = value.completionTokens;
  const totalTokens = value.totalTokens;
  if (
    typeof promptTokens !== "number" ||
    typeof completionTokens !== "number" ||
    typeof totalTokens !== "number"
  ) {
    throw new Error("Üretim rezervi kullanım yükü bozuk.");
  }
  return { promptTokens, completionTokens, totalTokens };
}
