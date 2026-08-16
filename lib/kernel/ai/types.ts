import type { AiModelRoleKey } from "@/lib/kernel/ai/model-roles";
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
  role?: AiModelRoleKey;
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
};
