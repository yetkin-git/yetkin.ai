import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { applyHttpRateLimit, rateLimitedJsonResponse } from "@/lib/kernel/security/http-rate-limit";
import { startKurumsalJobExam } from "@/lib/sales/kurumsal-screening-load";

/** Başvuru ve YetkinCV oturumu. Puan bu kapıda yazılmaz. */
export const auth = "session" as const;

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const requestId = resolveRequestId(request);
  const limit = await applyHttpRateLimit(request, {
    keyPrefix: "kurumsal-ilan-apply",
    limit: 8,
    windowMs: 10 * 60_000,
  });
  if (!limit.allowed) {
    return rateLimitedJsonResponse(limit, request);
  }
  try {
    const user = await requireSession(request);
    const { slug } = await context.params;
    const body: unknown = await request.json().catch(() => null);
    const started = await startKurumsalJobExam({
      slug,
      userId: user.id,
      sessionEmail: user.email,
      body,
    });
    return jsonOk(started, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
