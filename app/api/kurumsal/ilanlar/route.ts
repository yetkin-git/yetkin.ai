import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";
import { createKurumsalJobPosting, loadOwnerKurumsalBoard } from "@/lib/sales/kurumsal-screening-load";

/** İlan sahibi kokpiti. Başka üyenin adayı ve CV özeti okunmaz. */
export const auth = "session" as const;

export async function GET(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const jobs = await loadOwnerKurumsalBoard(user.id);
    return jsonOk({ jobs }, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const limit = await applyHttpRateLimit(
      request,
      HTTP_RATE_LIMITS.kurumsalIlanUser,
      user.id,
    );
    if (!limit.allowed) {
      return rateLimitedJsonResponse(limit, request);
    }
    const body: unknown = await request.json().catch(() => null);
    const job = await createKurumsalJobPosting({ ownerUserId: user.id, body });
    return jsonOk({ job }, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
