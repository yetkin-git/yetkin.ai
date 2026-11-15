import { careerCoachRequestSchema } from "@/lib/career/coach-contract";
import { runCareerCoach } from "@/lib/career/coach";
import { loadCareerBoard } from "@/lib/career/load";
import { CAREER_COACH_SEN } from "@/lib/copy/sen-voice/career-coach";
import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { logEvent } from "@/lib/kernel/observability/log";
import {
  applyHttpRateLimit,
  consumeHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";

export const auth = "session" as const;

function academyBadgeTitles(
  stamps: readonly { sourceKind: string; title: string }[],
): string[] {
  return stamps
    .filter((stamp) => stamp.sourceKind === "ACADEMY_CERTIFICATE")
    .map((stamp) => stamp.title.trim())
    .filter((title) => title.length > 0);
}

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const burst = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.llmUser, user.id);
    if (!burst.allowed) {
      return rateLimitedJsonResponse(burst, request);
    }

    const parsed = careerCoachRequestSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail(CAREER_COACH_SEN.invalid, 400, requestId, request);
    }

    const daily = await consumeHttpRateLimit(user.id, HTTP_RATE_LIMITS.careerCoachUser);
    if (!daily.allowed) {
      return rateLimitedJsonResponse(daily, request);
    }

    const board = await loadCareerBoard(user.id);
    const verifiedBadges = academyBadgeTitles(board?.stamps ?? []);
    const result = await runCareerCoach({
      userId: user.id,
      request: parsed.data,
      verifiedBadges,
    });

    logEvent({
      level: result.source === "fallback" ? "warn" : "info",
      event: result.source === "fallback" ? "career.coach.fallback" : "career.coach.ok",
      requestId,
      userId: user.id,
      route: "/api/career/coach",
      status: 200,
      reason: result.mode,
    });

    if (result.mode === "profile") {
      return jsonOk(
        {
          mode: result.mode,
          source: result.source,
          note: result.note,
          verifiedBadgeCount: result.verifiedBadgeCount,
          dossier: result.dossier,
        },
        200,
        requestId,
        request,
      );
    }

    return jsonOk(
      {
        mode: result.mode,
        source: result.source,
        reply: result.reply,
        disclaimer: result.disclaimer,
      },
      200,
      requestId,
      request,
    );
  } catch (error) {
    logEvent({
      level: "error",
      event: "career.coach.failed",
      requestId,
      route: "/api/career/coach",
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
