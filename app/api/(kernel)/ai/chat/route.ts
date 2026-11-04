import { assistantActorId } from "@/lib/kernel/ai/assistant-guest-quota";
import {
  answerAssistantChat,
  assistantChatRequestSchema,
} from "@/lib/kernel/ai/assistant-chat";
import { getSession } from "@/lib/kernel/auth/session";
import { isStaleRefreshTokenError } from "@/lib/kernel/auth/stale-refresh-token";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { logEvent } from "@/lib/kernel/observability/log";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
  resolveRequestIp,
} from "@/lib/kernel/security/http-rate-limit";

/**
 * Kariyer / Akademi asistanı.
 * Kenarda `public`. Oturum yoksa veya ölü yenileme jetonu
 * (`refresh_token_not_found`) oturumu null bıraktıysa kullanıcı anonim
 * ziyaretçidir; giriş duvarı yoktur. Kota `guest:<ip>` üzerinde günde 5 sorudur.
 * Geçerli üye kendi 5 soruluk kovasında kalır.
 */
export const auth = "public" as const;

async function readAssistantSession(request: Request) {
  try {
    return await getSession(request);
  } catch (error) {
    if (isStaleRefreshTokenError(error)) {
      return null;
    }
    throw error;
  }
}

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const session = await readAssistantSession(request);
    const actor = assistantActorId(session?.id, resolveRequestIp(request));
    const burst = await applyHttpRateLimit(
      request,
      HTTP_RATE_LIMITS.llmUser,
      actor.guest ? "guest" : actor.userId,
    );
    if (!burst.allowed) {
      return rateLimitedJsonResponse(burst, request);
    }

    const parsed = assistantChatRequestSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Soru gövdesi geçersiz.", 400, requestId, request);
    }

    const result = await answerAssistantChat({
      userId: actor.userId,
      message: parsed.data.message,
      history: parsed.data.history,
    });

    if (!result.ok) {
      logEvent({
        level: result.status === 429 ? "warn" : "error",
        event: "assistant.chat.denied",
        requestId,
        userId: actor.guest ? "guest" : actor.userId,
        route: "/api/ai/chat",
        status: result.status,
        reason: result.status === 429 ? "quota" : "invalid",
      });
      return jsonFail(result.error, result.status, requestId, request);
    }

    logEvent({
      level: result.source === "fail-safe" ? "warn" : "info",
      event: result.source === "fail-safe" ? "assistant.chat.fail_safe" : "assistant.chat.ok",
      requestId,
      userId: actor.guest ? "guest" : actor.userId,
      route: "/api/ai/chat",
      status: 200,
      reason: result.source,
    });
    return jsonOk(
      {
        reply: result.reply,
        remaining: result.remaining,
        limit: result.limit,
        ...(actor.guest ? { guest: true } : {}),
      },
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
