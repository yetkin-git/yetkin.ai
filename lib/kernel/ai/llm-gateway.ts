import "server-only";

import {
  assertGatewayBudgetAllows,
  type BudgetShieldPort,
} from "@/lib/kernel/ai/budget-shield";
import { createPrismaBudgetShieldPort } from "@/lib/kernel/ai/prisma-budget-shield";
import { estimateLlmCostMinor } from "@/lib/kernel/ai/cost";
import {
  assertLiveAiModelRole,
  getDefaultModelId,
  isGeminiModelUnavailableError,
  selectFallbackModelId,
  VOICE_TTS_FALLBACK_MODEL_ID,
} from "@/lib/kernel/ai/model-roles";
import { logEvent } from "@/lib/kernel/observability/log";
import { anthropicProvider } from "@/lib/kernel/ai/providers/anthropic";
import { geminiProvider } from "@/lib/kernel/ai/providers/gemini";
import { openaiProvider } from "@/lib/kernel/ai/providers/openai";
import { sovereignProvider } from "@/lib/kernel/ai/providers/sovereign";
import { isGeminiTtsTextAttemptError, summarizeGeminiTtsError } from "@/lib/kernel/ai/tts-voices";
import type {
  InvokeLlmInput,
  InvokeImageInput,
  InvokeSpeechInput,
  ImageGatewayResult,
  SpeechGatewayOutcome,
  LlmGatewayResult,
  LlmProviderAdapter,
  LlmProviderId,
  LlmUsage,
} from "@/lib/kernel/ai/types";

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_IMAGE_TIMEOUT_MS = 60_000;
/** Gemini TTS — uzun dilimler AbortError basmasın diye metin/image üstünde tutulur. */
const DEFAULT_SPEECH_TIMEOUT_MS = 120_000;
const DEFAULT_MAX_ATTEMPTS = 2;
/** generateSpeech AbortError / geçici üst katman için ek deneme. */
const DEFAULT_SPEECH_MAX_ATTEMPTS = 3;
/** 50x (gemini-upstream) — kota gibi agresif döngü yok; bir yeniden deneme. */
const SPEECH_UPSTREAM_MAX_ATTEMPTS = 2;
/** Kota (429) sonrası generateSpeech Gemini'yi bu süre vurmaz. */
const SPEECH_QUOTA_COOLDOWN_MS = 10 * 60 * 1000;

let speechQuotaCooldownUntil = 0;
let speechQuotaLogged = false;

export function isSpeechQuotaCooldownActive(now = Date.now()): boolean {
  return now < speechQuotaCooldownUntil;
}

export function resetSpeechGatewayCooldownForTests(): void {
  speechQuotaCooldownUntil = 0;
  speechQuotaLogged = false;
}

function tripSpeechQuotaCooldown(now = Date.now()): void {
  speechQuotaCooldownUntil = now + SPEECH_QUOTA_COOLDOWN_MS;
}

function logGenerateSpeechFailure(input: { reason: string; errorName?: string; error?: unknown }): void {
  if (input.error) {
    console.error("TTS GENERATION ERROR:", input.error);
  }
  const detail = input.error ? summarizeGeminiTtsError(input.error) : "";
  const reason = detail ? `${input.reason}:${detail}`.slice(0, 480) : input.reason;
  if (input.reason === "gemini-quota") {
    if (process.env.NODE_ENV === "production" && !speechQuotaLogged) {
      speechQuotaLogged = true;
      logEvent({
        level: "warn",
        event: "llm.gateway.provider_failed",
        reason,
        errorName: input.errorName,
        route: "generateSpeech",
      });
    }
    return;
  }
  logEvent({
    level: input.reason === "gemini-upstream" ? "warn" : "error",
    event: "llm.gateway.provider_failed",
    reason,
    errorName: input.errorName,
    route: "generateSpeech",
  });
}

function shouldRetrySpeechAttempt(input: {
  attempt: number;
  maxAttempts: number;
  error: unknown;
  reason: string;
}): boolean {
  if (input.attempt >= input.maxAttempts) {
    return false;
  }
  if (
    input.reason === "gemini-quota" ||
    input.reason === "user-quota" ||
    input.reason === "rate-limit" ||
    input.reason === "platform-cap" ||
    input.reason === "gemini-bad-request" ||
    input.reason === "gemini-auth-failed" ||
    input.reason === "missing-or-invalid-api-key" ||
    input.reason === "VOICE_BINDING_UNAVAILABLE"
  ) {
    return false;
  }
  if (isGeminiConnectTimeoutError(input.error)) {
    return false;
  }
  if (isAbortError(input.error) || input.reason === "gemini-timeout") {
    return true;
  }
  if (input.reason === "gemini-upstream") {
    if (isGeminiTtsTextAttemptError(input.error)) {
      return false;
    }
    return input.attempt < SPEECH_UPSTREAM_MAX_ATTEMPTS;
  }
  return false;
}

/**
 * VOICE_TTS pedagoji mührü — harf harf kısaltma okuma yasak.
 * Academy yönergesi ile aynı cümle; yalnız `instruction` (systemInstruction) kanalına enjekte edilir.
 * Seslendirilecek `text` parametresine asla eklenmez (NO META-INSTRUCTION IN AUDIO).
 */
export const VOICE_TTS_NO_LETTER_SPELLING_RULE =
  "Kullanıcıya ders anlatırken kesinlikle sadece harf kısaltması (örneğin 'le-le-me' veya 'el-el-em') söyleme. Her zaman terimin tam Türkçe anlamını oku.";

/** Pedagoji mührünü stil `instruction` kanalına basar; konuşma `text`'ine basmaz. */
function sealVoiceTtsPedagogyPrompt(instruction?: string): string {
  const base = instruction?.trim() ?? "";
  if (base.includes(VOICE_TTS_NO_LETTER_SPELLING_RULE)) {
    return base;
  }
  if (!base) {
    return VOICE_TTS_NO_LETTER_SPELLING_RULE;
  }
  return `${VOICE_TTS_NO_LETTER_SPELLING_RULE}\n\n${base}`;
}

const PROVIDERS: Record<LlmProviderId, LlmProviderAdapter> = {
  gemini: geminiProvider,
  openai: openaiProvider,
  anthropic: anthropicProvider,
  sovereign: sovereignProvider,
};

export type UsageRecorder = (input: {
  userId: string;
  source: string;
  provider: LlmProviderId;
  model: string;
  roleKey: string | null;
  usage: LlmUsage;
  costMinor: number;
}) => Promise<void>;

export type InvokeLlmDeps = {
  providers?: Partial<Record<LlmProviderId, LlmProviderAdapter>>;
  budgetPort?: BudgetShieldPort;
  recordUsage?: UsageRecorder;
};

class RetriableLlmError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RetriableLlmError";
  }
}

class NonRetriableLlmError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NonRetriableLlmError";
  }
}

function jitterMs(attempt: number): number {
  return 200 * attempt + Math.floor(Math.random() * 200);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function resolveModel(input: InvokeLlmInput): { model: string; roleKey: string | null } | null {
  if (input.role) {
    assertLiveAiModelRole(input.role);
    return { model: getDefaultModelId(input.role), roleKey: input.role };
  }
  const explicit = input.model?.trim();
  if (!explicit) {
    return null;
  }
  return { model: explicit, roleKey: null };
}

export function normalizeUsage(raw: LlmUsage, input: InvokeLlmInput, text: string): LlmUsage {
  if (raw.totalTokens > 0 || raw.promptTokens > 0 || raw.completionTokens > 0) {
    const promptTokens = Math.max(0, Math.trunc(raw.promptTokens));
    const completionTokens = Math.max(0, Math.trunc(raw.completionTokens));
    return {
      promptTokens,
      completionTokens,
      totalTokens:
        raw.totalTokens > 0 ? Math.trunc(raw.totalTokens) : promptTokens + completionTokens,
    };
  }
  const promptTokens = Math.max(1, Math.trunc((input.system.length + input.user.length) / 4));
  const completionTokens = Math.max(1, Math.trunc(text.length / 4));
  return {
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
  };
}

function isRetriableStatusMessage(message: string): boolean {
  return /\b(429|500|502|503|504)\b|timeout|temporar/i.test(message);
}

/**
 * Tek gümrük kapısı. VIDEO_GEN mühürlü-ölü — AiGatewayForbiddenError.
 * Diğer yumuşak hatalarda fırlatmaz — `null` döner.
 * Bütçe zırhı ağdan önce fail-closed çalışır.
 */
export async function invokeLlm(
  input: InvokeLlmInput,
  deps: InvokeLlmDeps = {},
): Promise<LlmGatewayResult | null> {
  if (input.role) {
    assertLiveAiModelRole(input.role);
  }
  const providerId = input.provider ?? "gemini";
  const adapter = deps.providers?.[providerId] ?? PROVIDERS[providerId];
  // Üretim varsayılanı Postgres AiTokenUsage — çağrı başına boş bellek kovası yok.
  const budgetPort = deps.budgetPort ?? createPrismaBudgetShieldPort();

  const resolved = resolveModel(input);
  if (!resolved) {
    return null;
  }

  const budget = await assertGatewayBudgetAllows(
    {
      identifier: input.rateLimit?.identifier,
      userId: input.billing?.userId,
      source: input.billing?.source,
      rateLimit: input.rateLimit,
    },
    budgetPort,
  );
  if (!budget.allowed) {
    return null;
  }

  const timeoutMs = input.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxAttempts = input.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  let model = resolved.model;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const completed = await adapter.complete(
        {
          model,
          system: input.system,
          user: input.user,
          history: input.history,
          inlineMedia: input.inlineMedia,
          temperature: input.temperature,
          maxOutputTokens: input.maxOutputTokens,
          responseJson: input.responseJson,
        },
        controller.signal,
      );
      const text = completed.text?.trim() ?? "";
      if (!text) {
        throw new RetriableLlmError("Boş sağlayıcı yanıtı.");
      }
      const usage = normalizeUsage(completed.usage, input, text);
      const billing = input.billing;
      if (billing?.userId && billing.recordUsage !== false && deps.recordUsage) {
        try {
          await deps.recordUsage({
            userId: billing.userId,
            source: billing.source,
            provider: providerId,
            model,
            roleKey: resolved.roleKey,
            usage,
            costMinor: estimateLlmCostMinor(usage),
          });
        } catch {
          // Muhasebe yazımı çağrıyı bloklamaz.
        }
      }
      return { text, model, provider: providerId, usage };
    } catch (error) {
      lastError = error;
      if (error instanceof NonRetriableLlmError) {
        return null;
      }
      if (providerId === "gemini" && isGeminiModelUnavailableError(error) && input.role) {
        const fallback = selectFallbackModelId({
          assignedModelId: model,
          previousStableModelId: "",
          defaultModelId: getDefaultModelId(input.role),
        });
        if (fallback && fallback !== model) {
          model = fallback;
          continue;
        }
      }
      const message = error instanceof Error ? error.message : String(error);
      if (attempt < maxAttempts && isRetriableStatusMessage(message)) {
        await sleep(jitterMs(attempt));
        continue;
      }
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  void lastError;
  return null;
}

export function estimateImagePromptUsage(prompt: string): LlmUsage {
  const promptTokens = Math.max(1, Math.trunc(prompt.length / 4));
  const completionTokens = 1;
  return {
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
  };
}

/**
 * Görsel gümrük kapısı. Yumuşak hatada fırlatmaz — `null` döner.
 * Sağlayıcı yalnız adapter.generateImage üzerinden; Studio client kurmaz.
 */
export async function generateImage(
  input: InvokeImageInput,
  deps: InvokeLlmDeps = {},
): Promise<ImageGatewayResult | null> {
  const providerId = input.provider ?? "gemini";
  const adapter = deps.providers?.[providerId] ?? PROVIDERS[providerId];
  const generate = adapter.generateImage?.bind(adapter);
  if (!generate) {
    return null;
  }
  const budgetPort = deps.budgetPort ?? createPrismaBudgetShieldPort();

  const prompt = input.prompt.trim();
  if (!prompt) {
    return null;
  }

  const model = input.model?.trim() || getDefaultModelId("IMAGE_GEN");
  const budget = await assertGatewayBudgetAllows(
    {
      identifier: input.rateLimit?.identifier,
      userId: input.billing?.userId,
      source: input.billing?.source,
      rateLimit: input.rateLimit,
    },
    budgetPort,
  );
  if (!budget.allowed) {
    return null;
  }

  const timeoutMs = input.timeoutMs ?? DEFAULT_IMAGE_TIMEOUT_MS;
  const maxAttempts = input.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const completed = await generate(
        { model, prompt },
        controller.signal,
      );
      const dataBase64 = completed.dataBase64?.trim() ?? "";
      if (!dataBase64) {
        throw new RetriableLlmError("Boş görsel yanıtı.");
      }
      const usage =
        completed.usage.totalTokens > 0 ||
        completed.usage.promptTokens > 0 ||
        completed.usage.completionTokens > 0
          ? {
              promptTokens: Math.max(0, Math.trunc(completed.usage.promptTokens)),
              completionTokens: Math.max(0, Math.trunc(completed.usage.completionTokens)),
              totalTokens:
                completed.usage.totalTokens > 0
                  ? Math.trunc(completed.usage.totalTokens)
                  : Math.max(0, Math.trunc(completed.usage.promptTokens)) +
                    Math.max(0, Math.trunc(completed.usage.completionTokens)),
            }
          : estimateImagePromptUsage(prompt);
      const billing = input.billing;
      if (billing?.userId && billing.recordUsage !== false && deps.recordUsage) {
        try {
          await deps.recordUsage({
            userId: billing.userId,
            source: billing.source,
            provider: providerId,
            model,
            roleKey: "IMAGE_GEN",
            usage,
            costMinor: estimateLlmCostMinor(usage),
          });
        } catch {
          // Muhasebe yazımı çağrıyı bloklamaz.
        }
      }
      return {
        mimeType: completed.mimeType.trim() || "image/png",
        dataBase64,
        model,
        provider: providerId,
        usage,
      };
    } catch (error) {
      lastError = error;
      if (error instanceof NonRetriableLlmError) {
        return null;
      }
      const message = error instanceof Error ? error.message : String(error);
      if (attempt < maxAttempts && isRetriableStatusMessage(message)) {
        await sleep(jitterMs(attempt));
        continue;
      }
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  void lastError;
  return null;
}

function isAbortError(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "name" in error && (error as { name: string }).name === "AbortError");
}

function collectErrorTokens(error: unknown, depth = 0): string {
  if (error == null || depth > 4) {
    return "";
  }
  if (typeof error === "string") {
    return error;
  }
  if (typeof error !== "object") {
    return String(error);
  }
  const rec = error as { name?: unknown; message?: unknown; code?: unknown; cause?: unknown };
  return [rec.name, rec.message, rec.code, collectErrorTokens(rec.cause, depth + 1)]
    .filter((part): part is string => typeof part === "string" && part.length > 0)
    .join(" ");
}

/** undici ConnectTimeoutError / UND_ERR_CONNECT_TIMEOUT — yeniden deneme yok. */
export function isGeminiConnectTimeoutError(error: unknown): boolean {
  return /ConnectTimeoutError|UND_ERR_CONNECT_TIMEOUT|connect timeout/i.test(collectErrorTokens(error));
}

export function classifyLlmProviderFailure(error: unknown): string {
  if (isGeminiConnectTimeoutError(error)) {
    return "gemini-timeout";
  }
  if (isAbortError(error)) {
    return "gemini-timeout";
  }
  const status =
    error && typeof error === "object" && "status" in error
      ? Number((error as { status?: unknown }).status)
      : Number.NaN;
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (message === "VOICE_BINDING_UNAVAILABLE") {
    return "VOICE_BINDING_UNAVAILABLE";
  }
  if (/Gemini client yapılandırılamadı|missing-or-invalid-api-key|api key.*(missing|invalid)/i.test(message)) {
    return "missing-or-invalid-api-key";
  }
  if (/\b401\b|UNAUTHENTICATED|API key not valid/i.test(message) || status === 401) {
    return "gemini-auth-failed";
  }
  if (status === 429 || /RESOURCE_EXHAUSTED|\b429\b|quota/i.test(message)) {
    return "gemini-quota";
  }
  if (status === 400 || /\bINVALID_ARGUMENT\b|\b400\b/.test(message)) {
    return "gemini-bad-request";
  }
  if (status === 404 || /NOT_FOUND|model .+ not found|does not exist/i.test(message)) {
    return "gemini-model-not-found";
  }
  if (status === 403 || /forbidden/i.test(message)) {
    return "gemini-forbidden";
  }
  if (/timeout/i.test(message)) {
    return "gemini-timeout";
  }
  return "gemini-upstream";
}

function speechGatewayFail(reason: string): SpeechGatewayOutcome {
  return { ok: false, reason };
}

/**
 * Ses gümrük kapısı (VOICE_TTS). Adapter yoksa `null`; yumuşak sağlayıcı
 * hatasında `{ ok: false, reason }` — dikey GoogleGenAI kurmaz.
 * Disk yazılmaz — PCM bellekten WAV tamponuna sarılır.
 */
export async function generateSpeech(
  input: InvokeSpeechInput,
  deps: InvokeLlmDeps = {},
): Promise<SpeechGatewayOutcome | null> {
  const providerId = input.provider ?? "gemini";
  const adapter = deps.providers?.[providerId] ?? PROVIDERS[providerId];
  const generate = adapter.generateSpeech?.bind(adapter);
  if (!generate) {
    return null;
  }
  const budgetPort = deps.budgetPort ?? createPrismaBudgetShieldPort();

  if (isSpeechQuotaCooldownActive()) {
    return speechGatewayFail("gemini-quota");
  }

  const trimmed = input.text.trim();
  if (!trimmed) {
    return speechGatewayFail("empty-text");
  }
  // SSOT: yalnız temiz konuşma metni. Pedagoji mührü instruction kanalındadır.
  const text = trimmed;
  const instruction = sealVoiceTtsPedagogyPrompt(input.instruction);

  let model = input.model?.trim() || getDefaultModelId("VOICE_TTS");
  const budget = await assertGatewayBudgetAllows(
    {
      identifier: input.rateLimit?.identifier,
      userId: input.billing?.userId,
      source: input.billing?.source,
      rateLimit: input.rateLimit,
    },
    budgetPort,
  );
  if (!budget.allowed) {
    return speechGatewayFail(budget.reason ?? "rate-limit");
  }

  const timeoutMs = input.timeoutMs ?? DEFAULT_SPEECH_TIMEOUT_MS;
  const maxAttempts = input.maxAttempts ?? DEFAULT_SPEECH_MAX_ATTEMPTS;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const completed = await generate(
        {
          model,
          text,
          instruction,
          voiceName: input.voiceName,
          languageCode: input.languageCode,
          timeoutMs,
        },
        controller.signal,
      );
      const dataBase64 = completed.dataBase64?.trim() ?? "";
      if (!dataBase64) {
        throw new RetriableLlmError("Boş ses yanıtı.");
      }
      const usage =
        completed.usage.totalTokens > 0 ||
        completed.usage.promptTokens > 0 ||
        completed.usage.completionTokens > 0
          ? {
              promptTokens: Math.max(0, Math.trunc(completed.usage.promptTokens)),
              completionTokens: Math.max(0, Math.trunc(completed.usage.completionTokens)),
              totalTokens:
                completed.usage.totalTokens > 0
                  ? Math.trunc(completed.usage.totalTokens)
                  : Math.max(0, Math.trunc(completed.usage.promptTokens)) +
                    Math.max(0, Math.trunc(completed.usage.completionTokens)),
            }
          : {
              promptTokens: Math.max(1, Math.trunc(text.length / 4)),
              completionTokens: 1,
              totalTokens: Math.max(1, Math.trunc(text.length / 4)) + 1,
            };
      const billing = input.billing;
      if (billing?.userId && billing.recordUsage !== false && deps.recordUsage) {
        try {
          await deps.recordUsage({
            userId: billing.userId,
            source: billing.source,
            provider: providerId,
            model,
            roleKey: "VOICE_TTS",
            usage,
            costMinor: estimateLlmCostMinor(usage),
          });
        } catch {
          // Muhasebe yazımı çağrıyı bloklamaz.
        }
      }
      return {
        mimeType: completed.mimeType.trim() || "audio/wav",
        dataBase64,
        model,
        provider: providerId,
        usage,
      };
    } catch (error) {
      lastError = error;
      if (providerId === "gemini" && isGeminiModelUnavailableError(error)) {
        const fallback = selectFallbackModelId({
          assignedModelId: model,
          previousStableModelId: "",
          defaultModelId: VOICE_TTS_FALLBACK_MODEL_ID,
        });
        if (fallback && fallback !== model) {
          model = fallback;
          continue;
        }
      }
      const reason = classifyLlmProviderFailure(error);
      if (reason === "gemini-quota") {
        tripSpeechQuotaCooldown();
        logGenerateSpeechFailure({
          reason,
          errorName: error instanceof Error ? error.name : "unknown",
          error,
        });
        return speechGatewayFail(reason);
      }
      if (shouldRetrySpeechAttempt({ attempt, maxAttempts, error, reason })) {
        await sleep(jitterMs(attempt));
        continue;
      }
      logGenerateSpeechFailure({
        reason,
        errorName: error instanceof Error ? error.name : "unknown",
        error,
      });
      return speechGatewayFail(reason);
    } finally {
      clearTimeout(timer);
    }
  }

  void lastError;
  const reason = classifyLlmProviderFailure(lastError);
  if (reason === "gemini-quota") {
    tripSpeechQuotaCooldown();
  }
  logGenerateSpeechFailure({ reason, error: lastError });
  return speechGatewayFail(reason);
}

export { resolveGeminiGatewayClient, sanitizeGeminiApiKey } from "@/lib/kernel/ai/providers/gemini";
