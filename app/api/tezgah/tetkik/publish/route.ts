import { applyHttpRateLimit, HTTP_RATE_LIMITS, rateLimitedJsonResponse } from "@/lib/kernel/security/http-rate-limit";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import {
  measureDeterministicTetkik,
  persistPublicTetkikReport,
  publicTetkikPath,
  TETKIK_PUBLIC_STORE_FAIL,
} from "@/lib/tezgah/tetkik/public-report";
import { z } from "zod";

/**
 * Kamuya açık tetkik. Skor deterministik motordadır. LLM çağrılmaz.
 * Kalıcı hash paylaşım adresidir. Cüzdan yazılmaz.
 */
export const auth = "public" as const;

const bodySchema = z.strictObject({
  url: z.string().trim().min(4).max(300),
});

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.tetkikPublicIp);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Adresi kısa ve net yaz.", 400, requestId, request);
    }
    const measured = await measureDeterministicTetkik(parsed.data.url);
    if (!measured.ok) {
      return jsonFail(measured.error, measured.status, requestId, request);
    }
    const saved = await persistPublicTetkikReport(measured.snapshot);
    if (!saved) {
      return jsonFail(TETKIK_PUBLIC_STORE_FAIL, 503, requestId, request);
    }
    return jsonOk(
      {
        hash: saved.id,
        path: publicTetkikPath(saved.id),
        score: measured.snapshot.score,
      },
      200,
      requestId,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
