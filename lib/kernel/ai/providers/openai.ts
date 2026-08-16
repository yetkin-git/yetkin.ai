import "server-only";

import type { LlmProviderAdapter, ProviderCompleteResult } from "@/lib/kernel/ai/types";

function readOpenAiApiKey(): string | null {
  const raw = process.env.OPENAI_API_KEY?.trim();
  return raw && raw.length > 8 ? raw : null;
}

export const openaiProvider: LlmProviderAdapter = {
  id: "openai",
  async complete(input, signal): Promise<ProviderCompleteResult> {
    const apiKey = readOpenAiApiKey();
    if (!apiKey) {
      throw new Error("OpenAI anahtarı yapılandırılamadı.");
    }
    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: input.system },
      ...(input.history ?? []).map((turn) => ({
        role: turn.role,
        content: turn.content,
      })),
      { role: "user", content: input.user },
    ];
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: input.model,
        messages,
        temperature: input.temperature,
        max_tokens: input.maxOutputTokens,
        response_format: input.responseJson ? { type: "json_object" } : undefined,
      }),
      signal,
    });
    if (!response.ok) {
      throw new Error(`OpenAI HTTP ${response.status}`);
    }
    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };
    return {
      text: payload.choices?.[0]?.message?.content ?? null,
      usage: {
        promptTokens: payload.usage?.prompt_tokens ?? 0,
        completionTokens: payload.usage?.completion_tokens ?? 0,
        totalTokens: payload.usage?.total_tokens ?? 0,
      },
    };
  },
};
