import "server-only";

import { z } from "zod";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { ASSISTANT_SEN } from "@/lib/copy/sen-voice/assistant";
import { invokeLlm, type InvokeLlmDeps } from "@/lib/kernel/ai/llm-gateway";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import type { LlmChatTurn } from "@/lib/kernel/ai/types";
import { ASSISTANT_CHAT_PATH } from "@/lib/kernel/ai/assistant-chat-client";
import {
  consumeHttpRateLimit,
  HTTP_RATE_LIMITS,
} from "@/lib/kernel/security/http-rate-limit";

export { ASSISTANT_CHAT_PATH };
export const ASSISTANT_CHAT_MESSAGE_LIMIT = HTTP_RATE_LIMITS.aiChatUser.limit;
export const ASSISTANT_CHAT_LIMIT_ERROR = ASSISTANT_SEN.limitReached;
export const ASSISTANT_CHAT_MAX_MESSAGE_CHARS = 2_000;
export const ASSISTANT_CHAT_MAX_HISTORY = 8;

const PROVIDER_LEAK_RE =
  /\b(google|gemini|openai|chatgpt|claude|anthropic|gpt-4|gpt-5|gemma|imagen)\b/gi;

const historyTurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(ASSISTANT_CHAT_MAX_MESSAGE_CHARS),
});

export const assistantChatRequestSchema = z.object({
  message: z.string().trim().min(1).max(ASSISTANT_CHAT_MAX_MESSAGE_CHARS),
  history: z.array(historyTurnSchema).max(ASSISTANT_CHAT_MAX_HISTORY).optional(),
});

export type AssistantChatRequest = z.infer<typeof assistantChatRequestSchema>;

export type AssistantChatQuotaPort = {
  consume(userId: string): { allowed: boolean; remaining: number; limit: number };
};

export type AssistantChatOk = {
  ok: true;
  reply: string;
  remaining: number;
  limit: number;
};

export type AssistantChatFail = {
  ok: false;
  error: string;
  status: 400 | 429 | 503;
  remaining: number;
  limit: number;
};

export type AssistantChatResult = AssistantChatOk | AssistantChatFail;

export type AnswerAssistantChatDeps = InvokeLlmDeps & {
  quota?: AssistantChatQuotaPort;
  invoke?: typeof invokeLlm;
};

export function createHttpAssistantChatQuota(): AssistantChatQuotaPort {
  return {
    consume(userId) {
      const decision = consumeHttpRateLimit(userId, HTTP_RATE_LIMITS.aiChatUser);
      return {
        allowed: decision.allowed,
        remaining: decision.remaining,
        limit: decision.limit,
      };
    },
  };
}

export function scrubAssistantProviderLeak(text: string): string {
  return text.replace(PROVIDER_LEAK_RE, YETKIN_BRAND);
}

function normalizeHistory(history: AssistantChatRequest["history"]): LlmChatTurn[] {
  if (!history?.length) {
    return [];
  }
  return history.map((turn) => ({
    role: turn.role,
    content: turn.content,
  }));
}

export async function answerAssistantChat(
  input: {
    userId: string;
    message: string;
    history?: AssistantChatRequest["history"];
  },
  deps: AnswerAssistantChatDeps = {},
): Promise<AssistantChatResult> {
  const parsed = assistantChatRequestSchema.safeParse({
    message: input.message,
    history: input.history,
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: ASSISTANT_SEN.empty,
      status: 400,
      remaining: ASSISTANT_CHAT_MESSAGE_LIMIT,
      limit: ASSISTANT_CHAT_MESSAGE_LIMIT,
    };
  }

  const quota = deps.quota ?? createHttpAssistantChatQuota();
  const slot = quota.consume(input.userId);
  if (!slot.allowed) {
    return {
      ok: false,
      error: ASSISTANT_CHAT_LIMIT_ERROR,
      status: 429,
      remaining: 0,
      limit: slot.limit,
    };
  }

  const invoke = deps.invoke ?? invokeLlm;
  const llm = await invoke(
    {
      role: "LITE_STREAM",
      system: ASSISTANT_SEN.system,
      user: parsed.data.message,
      history: normalizeHistory(parsed.data.history),
      temperature: 0.3,
      maxOutputTokens: 512,
      rateLimit: {
        identifier: input.userId,
        scope: "assistant-chat",
        limit: ASSISTANT_CHAT_MESSAGE_LIMIT,
        windowMs: HTTP_RATE_LIMITS.aiChatUser.windowMs,
      },
      billing: {
        userId: input.userId,
        source: AI_TOKEN_SOURCES.SUPPORT,
        recordUsage: false,
      },
    },
    deps,
  );

  if (!llm?.text) {
    return {
      ok: false,
      error: ASSISTANT_SEN.unavailable,
      status: 503,
      remaining: slot.remaining,
      limit: slot.limit,
    };
  }

  return {
    ok: true,
    reply: scrubAssistantProviderLeak(llm.text.trim()),
    remaining: slot.remaining,
    limit: slot.limit,
  };
}
