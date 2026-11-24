import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { loadCareerEvidence } from "@/lib/career/evidence";
import { buildCareerRoadmap } from "@/lib/career/roadmap";
import { buildCareerSwot } from "@/lib/career/swot";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";

/** Deterministik SWOT ve 30/60/90. Model çağrılmaz. Merit yazılmaz. */
export const auth = "session" as const;

export async function GET(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.careerUser, user.id);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const evidence = await loadCareerEvidence(user.id);
    return jsonOk(
      {
        swot: buildCareerSwot(evidence),
        roadmap: buildCareerRoadmap(evidence),
      },
      200,
      requestId,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
