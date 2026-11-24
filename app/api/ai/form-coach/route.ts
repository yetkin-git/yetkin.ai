import { coachFormField, formCoachRequestSchema } from "@/lib/kernel/ai/form-coach";
import { assistantActorId } from "@/lib/kernel/ai/assistant-guest-actor";
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
 * Form alanı koçu. Kenarda `public`.
 * Oturum yoksa veya ölü yenileme jetonu oturumu null bıraktıysa `guest:<ip>` kovası.
 * LITE_STREAM; en fazla 500 karakter girdi.
 */
export const auth = "public" as const;

async function readFormCoachSession(request: Request) {
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
    const session = await readFormCoachSession(request);
    const actor = assistantActorId(session?.id, resolveRequestIp(request));
    const burst = await applyHttpRateLimit(
      request,
      HTTP_RATE_LIMITS.formCoachIp,
      actor.guest ? "guest" : actor.userId,
    );
    if (!burst.allowed) {
      return rateLimitedJsonResponse(burst, request);
    }

    const parsed = formCoachRequestSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Koçluk gövdesi geçersiz.", 400, requestId, request);
    }

    const result = await coachFormField({
      userId: actor.userId,
      text: parsed.data.text,
      context: parsed.data.context,
    });

    if (!result.ok) {
      logEvent({
        level: result.status === 429 ? "warn" : "error",
        event: "form.coach.denied",
        requestId,
        userId: actor.guest ? "guest" : actor.userId,
        route: "/api/ai/form-coach",
        status: result.status,
        reason: result.status === 429 ? "quota" : "invalid",
      });
      return jsonFail(result.error, result.status, requestId, request);
    }

    logEvent({
      level: result.source === "fail-safe" ? "warn" : "info",
      event: result.source === "fail-safe" ? "form.coach.fail_safe" : "form.coach.ok",
      requestId,
      userId: actor.guest ? "guest" : actor.userId,
      route: "/api/ai/form-coach",
      status: 200,
      reason: result.source,
    });

    return jsonOk(
      {
        tip: result.tip,
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
      event: "form.coach.failed",
      requestId,
      route: "/api/ai/form-coach",
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
