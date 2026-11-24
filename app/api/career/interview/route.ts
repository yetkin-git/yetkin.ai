import {
  listInterviewInvitesForTalent,
  respondToInterviewInvite,
} from "@/lib/career/interview-invite";
import { requireSession } from "@/lib/kernel/auth/session";
import { BadRequestError } from "@/lib/kernel/http/errors";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";

/** Aday görüşme davetleri. İşveren e-postası yalnız adaya; aday e-postası basılmaz. */
export const auth = "session" as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function GET(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.careerUser, user.id);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const invites = await listInterviewInvitesForTalent(user.id);
    return jsonOk({ invites }, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.careerUser, user.id);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const body: unknown = await request.json().catch(() => null);
    if (!isRecord(body)) {
      throw new BadRequestError("İstek gövdesi okunamadı.");
    }
    const inviteId = typeof body.inviteId === "string" ? body.inviteId.trim() : "";
    const decision = body.decision === "ACCEPTED" || body.decision === "DECLINED" ? body.decision : null;
    if (!inviteId || !/^[A-Za-z0-9_-]{8,40}$/.test(inviteId)) {
      throw new BadRequestError("Davet bulunamadı.");
    }
    if (!decision) {
      throw new BadRequestError("Karar ACCEPTED veya DECLINED olmalı.");
    }
    const invite = await respondToInterviewInvite({
      talentUserId: user.id,
      inviteId,
      decision,
    });
    // Aday e-postası yanıta yazılmaz.
    return jsonOk(
      {
        id: invite.id,
        status: invite.status,
        respondedAt: invite.respondedAt,
        requesterName: invite.requesterName,
      },
      200,
      requestId,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
