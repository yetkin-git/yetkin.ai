import { verifyYetkinCvSealByHash } from "@/lib/career/yetkincv-store";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";

/** Kamuya açık üçüncü taraf mühür doğrulama. Oturum istenmez. */
export const auth = "public" as const;

export async function GET(
  request: Request,
  context: { params: Promise<{ hash: string }> },
) {
  const requestId = resolveRequestId(request);
  const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.careerVerifyIp);
  if (!limited.allowed) {
    return rateLimitedJsonResponse(limited, request);
  }
  try {
    const { hash } = await context.params;
    const result = await verifyYetkinCvSealByHash(hash);
    if (!result) {
      return jsonFail("Mühür bulunamadı.", 404, requestId, request);
    }
    return jsonOk(
      {
        valid: result.valid,
        issuedAt: result.issuedAt,
        roleKey: result.roleKey,
        verticalKey: result.verticalKey,
        score: result.score,
        hmacValid: result.hmacValid,
        signatureState: result.signatureState,
        signature: result.signature,
      },
      200,
      requestId,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
