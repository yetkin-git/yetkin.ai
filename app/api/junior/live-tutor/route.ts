import { getSession } from "@/lib/kernel/auth/session";
import {
  answerJuniorLiveTutor,
  juniorLiveTutorRequestSchema,
} from "@/lib/junior/live-tutor";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { logEvent } from "@/lib/kernel/observability/log";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";

/**
 * Selim Öğretmen canlı ders koçu.
 * Oturum varsa LLM; misafirde pedagojik yerel yanıt (sıfır risk önizleme).
 */
export const auth = "public" as const;

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const burst = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.llmIp);
    if (!burst.allowed) {
      return rateLimitedJsonResponse(burst, request);
    }

    const parsed = juniorLiveTutorRequestSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Soru gövdesi geçersiz.", 400, requestId, request);
    }

    const session = await getSession(request);
    const localOnly = !session;
    const userId = session?.id ?? `guest:${requestId}`;

    if (session) {
      const userBurst = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.llmUser, session.id);
      if (!userBurst.allowed) {
        return rateLimitedJsonResponse(userBurst, request);
      }
    }

    const result = await answerJuniorLiveTutor(
      {
        userId,
        lessonKey: parsed.data.lessonKey,
        message: parsed.data.message,
        history: parsed.data.history,
        activeSceneTitle: parsed.data.activeSceneTitle,
        activeSceneSubtitle: parsed.data.activeSceneSubtitle,
        cueIndex: parsed.data.cueIndex,
      },
      { localOnly },
    );

    if (!result.ok) {
      logEvent({
        level: result.status === 429 ? "warn" : "error",
        event: "junior.live_tutor.denied",
        requestId,
        userId: session?.id,
        route: "/api/junior/live-tutor",
        status: result.status,
        reason: result.status === 429 ? "quota" : "invalid",
      });
      return jsonFail(result.error, result.status, requestId, request);
    }

    logEvent({
      level: result.source === "fail-safe" ? "warn" : "info",
      event: "junior.live_tutor.ok",
      requestId,
      userId: session?.id,
      route: "/api/junior/live-tutor",
      status: 200,
      reason: result.source,
    });
    return jsonOk(
      {
        reply: result.reply,
        remaining: result.remaining,
        limit: result.limit,
        source: result.source,
        guest: localOnly,
      },
      200,
      requestId,
      request,
    );
  } catch (error) {
    logEvent({
      level: "error",
      event: "junior.live_tutor.failed",
      requestId,
      route: "/api/junior/live-tutor",
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
