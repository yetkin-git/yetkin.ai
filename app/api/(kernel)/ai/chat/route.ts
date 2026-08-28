import { requireSession } from "@/lib/kernel/auth/session";
import {
  answerAssistantChat,
  assistantChatRequestSchema,
} from "@/lib/kernel/ai/assistant-chat";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { logEvent } from "@/lib/kernel/observability/log";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";

export const auth = "session" as const;

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const burst = applyHttpRateLimit(request, HTTP_RATE_LIMITS.llmUser, user.id);
    if (!burst.allowed) {
      return rateLimitedJsonResponse(burst, request);
    }

    const parsed = assistantChatRequestSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Soru gövdesi geçersiz.", 400, requestId, request);
    }

    const result = await answerAssistantChat({
      userId: user.id,
      message: parsed.data.message,
      history: parsed.data.history,
    });

    if (!result.ok) {
      logEvent({
        level: result.status === 429 ? "warn" : "error",
        event: "assistant.chat.denied",
        requestId,
        userId: user.id,
        route: "/api/ai/chat",
        status: result.status,
        reason: result.status === 429 ? "quota" : "gateway",
        errorName: result.status === 503 ? "ServiceUnavailableError" : undefined,
      });
      return jsonFail(result.error, result.status, requestId, request);
    }

    logEvent({
      level: "info",
      event: "assistant.chat.ok",
      requestId,
      userId: user.id,
      route: "/api/ai/chat",
      status: 200,
    });
    return jsonOk(
      { reply: result.reply, remaining: result.remaining, limit: result.limit },
      200,
      requestId,
      request,
    );
  } catch (error) {
    logEvent({
      level: "error",
      event: "assistant.chat.failed",
      requestId,
      route: "/api/ai/chat",
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
