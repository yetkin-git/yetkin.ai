import "server-only";

import type { LlmProviderAdapter, ProviderCompleteResult } from "@/lib/kernel/ai/types";

function readAnthropicApiKey(): string | null {
  const raw = process.env.ANTHROPIC_API_KEY?.trim();
  return raw && raw.length > 8 ? raw : null;
}

export const anthropicProvider: LlmProviderAdapter = {
  id: "anthropic",
  async complete(input, signal): Promise<ProviderCompleteResult> {
    const apiKey = readAnthropicApiKey();
    if (!apiKey) {
      throw new Error("Anthropic anahtarı yapılandırılamadı.");
    }
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: input.model,
        system: input.system,
        max_tokens: input.maxOutputTokens ?? 1024,
        temperature: input.temperature,
        messages: [
          ...(input.history ?? []).map((turn) => ({
            role: turn.role === "assistant" ? "assistant" : "user",
            content: turn.content,
          })),
          { role: "user", content: input.user },
        ],
      }),
      signal,
    });
    if (!response.ok) {
      throw new Error(`Anthropic HTTP ${response.status}`);
    }
    const payload = (await response.json()) as {
      content?: Array<{ type?: string; text?: string }>;
      usage?: { input_tokens?: number; output_tokens?: number };
    };
    const text =
      payload.content?.find((block) => block.type === "text")?.text ?? null;
    const promptTokens = payload.usage?.input_tokens ?? 0;
    const completionTokens = payload.usage?.output_tokens ?? 0;
    return {
      text,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
    };
  },
};
