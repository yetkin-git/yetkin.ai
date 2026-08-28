import "server-only";

import { GoogleGenAI } from "@google/genai";
import { logEvent } from "@/lib/kernel/observability/log";
import type {
  LlmProviderAdapter,
  ProviderCompleteResult,
  ProviderGenerateImageResult,
  ProviderGenerateSpeechResult,
} from "@/lib/kernel/ai/types";
import {
  collectGeminiInlineAudioParts,
  mergeGeminiInlineAudioToWav,
} from "@/lib/kernel/ai/pcm-wav";
import {
  canonicalizeGeminiTtsLanguageCode,
  canonicalizeGeminiTtsVoiceName,
  isGeminiTtsLanguageConfigError,
  isGeminiTtsTextAttemptError,
  isGeminiTtsVoiceConfigError,
  sealGeminiTtsAudioOnlyInstruction,
  summarizeGeminiTtsError,
  VoiceBindingUnavailableError,
} from "@/lib/kernel/ai/tts-voices";

const MIN_GEMINI_KEY_CHARS = 8;

/**
 * @google/genai varsayılanı 5 deneme + 429 RetryInfo (≈38 sn kilit).
 * Kota tespitinde milisaniye cevap: tek HTTP, retry kodu yok.
 */
export const GEMINI_FAST_FAIL_HTTP_OPTIONS = {
  retryOptions: {
    attempts: 1,
    httpStatusCodes: [] as number[],
  },
};

/** TTS ConnectTimeoutError — 2.3 dk UND_ERR_CONNECT_TIMEOUT kilidi yok. */
export const GEMINI_TTS_CONNECT_TIMEOUT_MS = 500;

export const GEMINI_TTS_FAST_FAIL_HTTP_OPTIONS = {
  timeout: GEMINI_TTS_CONNECT_TIMEOUT_MS,
  retryOptions: {
    attempts: 1,
    httpStatusCodes: [] as number[],
  },
};

function isDevGatewayLog(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * dotenv/Next tırnakları genelde düşürür; yine de BOM, CR ve sarmal tırnak
 * Google'a sızmasın. process.env.GEMINI_API_KEY buradan okunur.
 */
export function sanitizeGeminiApiKey(raw: string | undefined | null): string | null {
  if (raw == null) {
    return null;
  }
  let value = raw.replace(/^\uFEFF/, "").replace(/\r/g, "").trim();
  const quote = value[0];
  if (
    (quote === '"' || quote === "'" || quote === "`") &&
    value.length >= 2 &&
    value.endsWith(quote)
  ) {
    value = value.slice(1, -1).replace(/^\uFEFF/, "").replace(/\r/g, "").trim();
  }
  return value.length > MIN_GEMINI_KEY_CHARS ? value : null;
}

export function describeGeminiApiKeyIssue(raw: string | undefined | null): string {
  if (raw == null) {
    return "missing-gemini-key";
  }
  const trimmed = raw.replace(/^\uFEFF/, "").replace(/\r/g, "").trim();
  if (!trimmed) {
    return "missing-gemini-key";
  }
  const quote = trimmed[0];
  if (
    (quote === '"' || quote === "'" || quote === "`") &&
    trimmed.endsWith(quote)
  ) {
    return "quoted-gemini-key";
  }
  if (trimmed.length <= MIN_GEMINI_KEY_CHARS) {
    return "gemini-key-too-short";
  }
  return "gemini-key-unusable";
}

function logDevGemini(reason: string, errorName?: string): void {
  if (!isDevGatewayLog()) {
    return;
  }
  logEvent({
    level: "error",
    event: "llm.gemini.key",
    reason,
    errorName,
  });
}

function readGeminiApiKey(): string | null {
  return sanitizeGeminiApiKey(process.env.GEMINI_API_KEY);
}

let cachedClient: GoogleGenAI | null = null;
let cachedFingerprint: string | null = null;

function geminiClientFingerprint(apiKey: string): string {
  return `${apiKey.length}:${apiKey.slice(0, 3)}`;
}

export function resolveGeminiGatewayClient(): GoogleGenAI | null {
  const apiKey = readGeminiApiKey();
  if (!apiKey) {
    cachedClient = null;
    cachedFingerprint = null;
    logDevGemini(describeGeminiApiKeyIssue(process.env.GEMINI_API_KEY));
    return null;
  }
  const fingerprint = geminiClientFingerprint(apiKey);
  if (cachedClient && cachedFingerprint === fingerprint) {
    return cachedClient;
  }
  cachedClient = new GoogleGenAI({
    apiKey,
    httpOptions: GEMINI_FAST_FAIL_HTTP_OPTIONS,
  });
  cachedFingerprint = fingerprint;
  return cachedClient;
}

function requireGeminiClient(): GoogleGenAI {
  const client = resolveGeminiGatewayClient();
  if (!client) {
    throw new Error("Gemini client yapılandırılamadı.");
  }
  return client;
}

export const geminiProvider: LlmProviderAdapter = {
  id: "gemini",
  async complete(input, signal): Promise<ProviderCompleteResult> {
    const client = requireGeminiClient();
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
        httpOptions: GEMINI_FAST_FAIL_HTTP_OPTIONS,
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
    const client = requireGeminiClient();
    const response = await client.models.generateImages({
      model: input.model,
      prompt: input.prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: "16:9",
        abortSignal: signal,
        httpOptions: GEMINI_FAST_FAIL_HTTP_OPTIONS,
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
  async generateSpeech(input, signal): Promise<ProviderGenerateSpeechResult> {
    const client = requireGeminiClient();
    const voiceName = canonicalizeGeminiTtsVoiceName(input.voiceName);
    let languageCode = canonicalizeGeminiTtsLanguageCode(input.languageCode);
    async function requestBoundSpeech(): Promise<GeminiSpeechResponse> {
      try {
        return await requestGeminiSpeech({
          client,
          model: input.model,
          text: input.text,
          instruction: input.instruction,
          voiceName,
          languageCode,
          signal,
        });
      } catch (error) {
        if (isGeminiTtsVoiceConfigError(error)) {
          logEvent({
            level: "error",
            event: "llm.gemini.voice_binding_unavailable",
            reason: `voice=${voiceName}:${summarizeGeminiTtsError(error)}`,
            action: "VOICE_BINDING_UNAVAILABLE",
            route: "generateSpeech",
          });
          throw new VoiceBindingUnavailableError();
        }
        throw error;
      }
    }
    let response = await requestBoundSpeech();
    try {
      return wavFromGeminiSpeechResponse(response, input.text);
    } catch (firstError) {
      let error: unknown = firstError;
      if (isGeminiTtsLanguageConfigError(error) && languageCode) {
        languageCode = undefined;
        logEvent({
          level: "warn",
          event: "llm.gemini.speech_language_fallback",
          reason: `omit-language:${summarizeGeminiTtsError(error)}`,
          route: "generateSpeech",
        });
        response = await requestBoundSpeech();
        try {
          return wavFromGeminiSpeechResponse(response, input.text);
        } catch (retryError) {
          error = retryError;
        }
      }
      if (isGeminiTtsVoiceConfigError(error)) {
        logEvent({
          level: "error",
          event: "llm.gemini.voice_binding_unavailable",
          reason: `voice=${voiceName}:${summarizeGeminiTtsError(error)}`,
          action: "VOICE_BINDING_UNAVAILABLE",
          route: "generateSpeech",
        });
        throw new VoiceBindingUnavailableError();
      }
      logEvent({
        level: "error",
        event: "llm.gemini.speech_failed",
        reason: `voice=${voiceName}:${summarizeGeminiTtsError(error)}`,
        errorName: error instanceof Error ? error.name : "unknown",
        route: "generateSpeech",
      });
      throw error;
    }
  },
};

type GeminiSpeechContentPart = {
  inlineData?: { data?: string; mimeType?: string | null };
  inline_data?: { data?: string; mimeType?: string | null; mime_type?: string | null };
  text?: string;
};

type GeminiSpeechResponse = {
  candidates?: Array<{
    finishReason?: string;
    content?: { parts?: Array<GeminiSpeechContentPart | null> } | null;
  } | null>;
  parts?: Array<GeminiSpeechContentPart | null>;
  promptFeedback?: { blockReason?: string };
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
};

function geminiSpeechConfig(voiceName: string, languageCode?: string) {
  const speechConfig: {
    languageCode?: string;
    voiceConfig: { prebuiltVoiceConfig: { voiceName: string } };
  } = {
    voiceConfig: {
      prebuiltVoiceConfig: { voiceName },
    },
  };
  if (languageCode) {
    speechConfig.languageCode = languageCode;
  }
  return speechConfig;
}

async function invokeGeminiSpeech(input: {
  client: GoogleGenAI;
  model: string;
  text: string;
  instruction?: string;
  voiceName: string;
  languageCode?: string;
  signal: AbortSignal;
}): Promise<GeminiSpeechResponse> {
  // Gemini TTS (AUDIO) systemInstruction kabul etmez — 400 INVALID_ARGUMENT.
  // Stil mührü konuşma metnine de birleştirilmez (NO META-INSTRUCTION IN AUDIO).
  void input.instruction;
  const response = await input.client.models.generateContent({
    model: input.model,
    contents: [
      {
        role: "user",
        parts: [{ text: input.text }],
      },
    ],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: geminiSpeechConfig(input.voiceName, input.languageCode),
      abortSignal: input.signal,
      httpOptions: GEMINI_TTS_FAST_FAIL_HTTP_OPTIONS,
    },
  });
  return response as GeminiSpeechResponse;
}

async function requestGeminiSpeech(input: {
  client: GoogleGenAI;
  model: string;
  text: string;
  instruction?: string;
  voiceName: string;
  languageCode?: string;
  signal: AbortSignal;
}): Promise<GeminiSpeechResponse> {
  // Mühür SSOT durur; TTS isteğine systemInstruction olarak basılmaz.
  void sealGeminiTtsAudioOnlyInstruction(input.instruction);
  try {
    return await invokeGeminiSpeech({ ...input, instruction: undefined });
  } catch (error) {
    console.error("TTS GENERATION ERROR:", error);
    if (!isGeminiTtsTextAttemptError(error)) {
      throw error;
    }
    logEvent({
      level: "warn",
      event: "llm.gemini.speech_instruction_fallback",
      reason: summarizeGeminiTtsError(error),
      route: "generateSpeech",
    });
    return invokeGeminiSpeech({ ...input, instruction: undefined });
  }
}

function wavFromGeminiSpeechResponse(
  response: GeminiSpeechResponse,
  text: string,
): ProviderGenerateSpeechResult {
  const blockReason = response.promptFeedback?.blockReason;
  if (blockReason) {
    throw new Error(`Boş ses yanıtı. blockReason=${blockReason}`);
  }
  const candidateParts = response.candidates?.[0]?.content?.parts ?? [];
  const topParts = response.parts ?? [];
  const audioParts = collectGeminiInlineAudioParts([...candidateParts, ...topParts]);
  if (audioParts.length === 0) {
    const finishReason = response.candidates?.[0]?.finishReason;
    throw new Error(
      finishReason ? `Boş ses yanıtı. finishReason=${finishReason}` : "Boş ses yanıtı.",
    );
  }
  const wav = mergeGeminiInlineAudioToWav(audioParts);
  const promptTokens = Math.max(1, Math.trunc(text.length / 4));
  const usage = response.usageMetadata;
  return {
    mimeType: "audio/wav",
    dataBase64: wav.toString("base64"),
    usage: {
      promptTokens: usage?.promptTokenCount ?? promptTokens,
      completionTokens: usage?.candidatesTokenCount ?? 1,
      totalTokens: usage?.totalTokenCount ?? promptTokens + 1,
    },
  };
}
