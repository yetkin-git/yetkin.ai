import type { AiLiveModelRoleKey } from "@/lib/kernel/ai/model-roles";
import type { AiTokenSource } from "@/lib/kernel/ai/sources";
import type { LlmGatewayDenialReason } from "@/lib/kernel/ai/budget-shield";

export type LlmProviderId = "gemini" | "openai" | "anthropic" | "sovereign";

export type LlmChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export type LlmInlineMedia = {
  mimeType: string;
  dataBase64: string;
};

export type LlmUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export type InvokeLlmInput = {
  provider?: LlmProviderId;
  role?: AiLiveModelRoleKey;
  model?: string;
  system: string;
  user: string;
  inlineMedia?: LlmInlineMedia[];
  history?: LlmChatTurn[];
  temperature?: number;
  maxOutputTokens?: number;
  responseJson?: boolean;
  timeoutMs?: number;
  maxAttempts?: number;
  rateLimit?: {
    identifier: string;
    scope?: string;
    limit?: number;
    windowMs?: number;
  };
  billing?: {
    userId?: string | null;
    source: AiTokenSource;
    recordUsage?: boolean;
  };
};

export type LlmGatewayResult = {
  text: string;
  model: string;
  provider: LlmProviderId;
  usage: LlmUsage;
};

export type InvokeImageInput = {
  provider?: LlmProviderId;
  role?: "IMAGE_GEN";
  model?: string;
  prompt: string;
  timeoutMs?: number;
  maxAttempts?: number;
  rateLimit?: {
    identifier: string;
    scope?: string;
    limit?: number;
    windowMs?: number;
  };
  billing?: {
    userId?: string | null;
    source: AiTokenSource;
    recordUsage?: boolean;
  };
};

export type ImageGatewayResult = {
  mimeType: string;
  dataBase64: string;
  model: string;
  provider: LlmProviderId;
  usage: LlmUsage;
};

export type InvokeSpeechInput = {
  provider?: LlmProviderId;
  role?: "VOICE_TTS";
  model?: string;
  /**
   * Saf konuşma metni (SSOT transcript). Sistem/anayasa/yönerge yok.
   * Serbest üretim yok — çağıran katman ekran metnini basar.
   */
  text: string;
  /**
   * Stil yönergesi — sağlayıcı systemInstruction.
   * Seslendirilecek `text` parametresine asla birleştirilmez.
   */
  instruction?: string;
  voiceName?: string;
  languageCode?: string;
  timeoutMs?: number;
  maxAttempts?: number;
  rateLimit?: {
    identifier: string;
    scope?: string;
    limit?: number;
    windowMs?: number;
  };
  billing?: {
    userId?: string | null;
    source: AiTokenSource;
    recordUsage?: boolean;
  };
};

export type SpeechGatewayResult = {
  mimeType: string;
  dataBase64: string;
  model: string;
  provider: LlmProviderId;
  usage: LlmUsage;
};

/** generateSpeech yumuşak hata — adapter yokluğu `null` kalır. */
export type SpeechGatewayFail = {
  ok: false;
  reason: string;
};

export type SpeechGatewayOutcome = SpeechGatewayResult | SpeechGatewayFail;

export function isSpeechGatewayFail(
  value: SpeechGatewayOutcome | null | undefined,
): value is SpeechGatewayFail {
  return Boolean(value && typeof value === "object" && "ok" in value && value.ok === false);
}

export function isSpeechGatewaySuccess(
  value: SpeechGatewayOutcome | null | undefined,
): value is SpeechGatewayResult {
  if (!value || typeof value !== "object") {
    return false;
  }
  if ("ok" in value && value.ok === false) {
    return false;
  }
  return "dataBase64" in value && typeof value.dataBase64 === "string" && value.dataBase64.trim().length > 0;
}

export type ProviderGenerateSpeechInput = {
  model: string;
  /** Saf konuşma SSOT — yönerge yok. */
  text: string;
  /** Stil — systemInstruction; ses metnine eklenmez. */
  instruction?: string;
  voiceName?: string;
  languageCode?: string;
  /** HTTP tavanı (ms). Boşsa sağlayıcı varsayılanı. */
  timeoutMs?: number;
};

export type ProviderGenerateSpeechResult = {
  mimeType: string;
  dataBase64: string;
  usage: LlmUsage;
};

export type LlmGatewayDenied = {
  ok: false;
  reason: LlmGatewayDenialReason;
};

export type ProviderCompleteInput = {
  model: string;
  system: string;
  user: string;
  history?: LlmChatTurn[];
  inlineMedia?: LlmInlineMedia[];
  temperature?: number;
  maxOutputTokens?: number;
  responseJson?: boolean;
};

export type ProviderCompleteResult = {
  text: string | null;
  usage: LlmUsage;
};

export type ProviderGenerateImageInput = {
  model: string;
  prompt: string;
};

export type ProviderGenerateImageResult = {
  mimeType: string;
  dataBase64: string;
  usage: LlmUsage;
};

export type LlmProviderAdapter = {
  readonly id: LlmProviderId;
  complete(
    input: ProviderCompleteInput,
    signal: AbortSignal,
  ): Promise<ProviderCompleteResult>;
  generateImage?(
    input: ProviderGenerateImageInput,
    signal: AbortSignal,
  ): Promise<ProviderGenerateImageResult>;
  generateSpeech?(
    input: ProviderGenerateSpeechInput,
    signal: AbortSignal,
  ): Promise<ProviderGenerateSpeechResult>;
  /** VIDEO_GEN factory yok — anayasa kesmesi. */
  generateVideo?: never;
  generateAudio?: never;
};
