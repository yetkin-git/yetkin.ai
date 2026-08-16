import "server-only";

import { GoogleGenAI } from "@google/genai";
import type {
  LlmProviderAdapter,
  ProviderCompleteResult,
  ProviderGenerateImageResult,
} from "@/lib/kernel/ai/types";

function readGeminiApiKey(): string | null {
  const raw = process.env.GEMINI_API_KEY?.trim();
  return raw && raw.length > 8 ? raw : null;
}

let cachedClient: GoogleGenAI | null = null;

export function resolveGeminiGatewayClient(): GoogleGenAI | null {
  const apiKey = readGeminiApiKey();
  if (!apiKey) {
    return null;
  }
  cachedClient ??= new GoogleGenAI({ apiKey });
  return cachedClient;
}

export const geminiProvider: LlmProviderAdapter = {
  id: "gemini",
  async complete(input, signal): Promise<ProviderCompleteResult> {
    const client = resolveGeminiGatewayClient();
    if (!client) {
      throw new Error("Gemini client yapılandırılamadı.");
    }
    const response = await client.models.generateContent({
      model: input.model,
      contents: input.inlineMedia?.length
        ? [
            {
              role: "user",
              parts: [
                { text: input.user },
                ...input.inlineMedia.map((media) => ({
                  inlineData: {
                    mimeType: media.mimeType,
                    data: media.dataBase64,
                  },
                })),
              ],
            },
          ]
        : input.user,
      config: {
        systemInstruction: input.system,
        temperature: input.temperature,
        maxOutputTokens: input.maxOutputTokens,
        responseMimeType: input.responseJson ? "application/json" : undefined,
        abortSignal: signal,
      },
    });
    const usage = response.usageMetadata;
    return {
      text: response.text ?? null,
      usage: {
        promptTokens: usage?.promptTokenCount ?? 0,
        completionTokens: usage?.candidatesTokenCount ?? 0,
        totalTokens: usage?.totalTokenCount ?? 0,
      },
    };
  },
  async generateImage(input, signal): Promise<ProviderGenerateImageResult> {
    const client = resolveGeminiGatewayClient();
    if (!client) {
      throw new Error("Gemini client yapılandırılamadı.");
    }
    const response = await client.models.generateImages({
      model: input.model,
      prompt: input.prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: "16:9",
        abortSignal: signal,
      },
    });
    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!imageBytes) {
      throw new Error("Boş görsel yanıtı.");
    }
    const promptTokens = Math.max(1, Math.trunc(input.prompt.length / 4));
    return {
      mimeType: "image/png",
      dataBase64: imageBytes,
      usage: {
        promptTokens,
        completionTokens: 1,
        totalTokens: promptTokens + 1,
      },
    };
  },
};
