import { requireSession } from "@/lib/kernel/auth/session";
import { BadRequestError } from "@/lib/kernel/http/errors";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";
import { setKurumsalJobActive } from "@/lib/sales/kurumsal-screening-load";

/**
 * İlan sahibi durum yönetimi (F1.5 / Y-02).
 * `isActive: false` kapatır; `true` yalnız son başvuru tarihi geçmemişse yeniden açar.
 * Sahiplik: `ownerUserId` filtresi — çapraz işveren 404.
 */
export const auth = "session" as const;

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    // Kova **kullanıcı** bazlıdır: paylaşılan NAT IP'si bir işverenin kotasını
    // diğerine kapatmasın (O-03 / F2.8 ile aynı desen).
    const limit = await applyHttpRateLimit(
      request,
      HTTP_RATE_LIMITS.kurumsalIlanUser,
      user.id,
    );
    if (!limit.allowed) {
      return rateLimitedJsonResponse(limit, request);
    }
    const { id } = await context.params;
    const body: unknown = await request.json().catch(() => null);
    const record = body != null && typeof body === "object" && !Array.isArray(body) ? body : null;
    if (!record || typeof (record as { isActive?: unknown }).isActive !== "boolean") {
      throw new BadRequestError("isActive alanı boolean olmalı.");
    }
    const job = await setKurumsalJobActive({
      ownerUserId: user.id,
      jobId: id,
      isActive: (record as { isActive: boolean }).isActive,
    });
    return jsonOk({ job }, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
