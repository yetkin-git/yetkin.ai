import { parseCareerCvDraft } from "@/lib/career/cv-model";
import { loadCareerCv, upsertCareerCv } from "@/lib/career/cv-store";
import { requireSession } from "@/lib/kernel/auth/session";
import { BadRequestError } from "@/lib/kernel/http/errors";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";

/** Yapılandırılmış CV okuma/yazma. */
export const auth = "session" as const;

export async function GET(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.careerUser, user.id);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const cv = await loadCareerCv(user.id);
    return jsonOk({ cv }, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

export async function PUT(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.careerUser, user.id);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const body: unknown = await request.json().catch(() => null);
    const parsed = parseCareerCvDraft(body);
    if (!parsed.ok) {
      throw new BadRequestError(parsed.error);
    }
    const cv = await upsertCareerCv(user.id, parsed.value);
    return jsonOk({ cv }, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
