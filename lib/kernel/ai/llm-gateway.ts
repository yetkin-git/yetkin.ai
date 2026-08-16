import "server-only";

import {
  assertGatewayBudgetAllows,
  type BudgetShieldPort,
} from "@/lib/kernel/ai/budget-shield";
import { createPrismaBudgetShieldPort } from "@/lib/kernel/ai/prisma-budget-shield";
import { estimateLlmCostMinor } from "@/lib/kernel/ai/cost";
import {
  getDefaultModelId,
  isGeminiModelUnavailableError,
  selectFallbackModelId,
} from "@/lib/kernel/ai/model-roles";
import { anthropicProvider } from "@/lib/kernel/ai/providers/anthropic";
import { geminiProvider } from "@/lib/kernel/ai/providers/gemini";
import { openaiProvider } from "@/lib/kernel/ai/providers/openai";
import { sovereignProvider } from "@/lib/kernel/ai/providers/sovereign";
import type {
  InvokeLlmInput,
  InvokeImageInput,
  ImageGatewayResult,
  LlmGatewayResult,
  LlmProviderAdapter,
  LlmProviderId,
  LlmUsage,
} from "@/lib/kernel/ai/types";

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_IMAGE_TIMEOUT_MS = 60_000;
const DEFAULT_MAX_ATTEMPTS = 2;

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
 * Tek gümrük kapısı. Yumuşak hatada fırlatmaz — `null` döner.
 * Bütçe zırhı ağdan önce fail-closed çalışır.
 */
export async function invokeLlm(
  input: InvokeLlmInput,
  deps: InvokeLlmDeps = {},
): Promise<LlmGatewayResult | null> {
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

export { resolveGeminiGatewayClient } from "@/lib/kernel/ai/providers/gemini";
