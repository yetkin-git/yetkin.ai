import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { logEvent } from "@/lib/kernel/observability/log";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";
import { isGrantNaceGroup, isProvinceCode } from "@/lib/yetkinhibe/grant-brief-axes";
import { GrantCatalogUnavailableError } from "@/lib/yetkinhibe/grant-catalog-core";
import { loadYetkinhibeGrantCatalog } from "@/lib/yetkinhibe/grant-catalog-live";
import { readGrantMatchBodyText } from "@/lib/yetkinhibe/grant-match-api";
import { YETKINHIBE_COPY } from "@/lib/yetkinhibe/copy";
import { matchPublicGrantEligibility } from "@/lib/yetkinhibe/public-eligibility";
import { z } from "zod";

/**
 * Anonim hibe ön uygunluğu. `/api/hibe` donmuş oda olduğu için tezgâh altında durur.
 * Motor `lib/yetkinhibe/*` deterministik eşlemesidir. LLM ve cüzdan yoktur.
 * YetkinHibe odası bu rotayla açılmaz.
 */
export const auth = "public" as const;

const ROUTE = "/api/tezgah/grant/match";

const bodySchema = z.strictObject({
  idea: z.string().trim().min(12).max(600),
  provinceCode: z.string().trim(),
  sectorCode: z.string().trim(),
});

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.llmIp);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }

    const text = await readGrantMatchBodyText(request);
    if (text === null) {
      return jsonFail(YETKINHIBE_COPY.errors.matchProfileTooLarge, 413, requestId, request);
    }
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      return jsonFail("İş fikrini, sektörü ve ili seç.", 400, requestId, request);
    }
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return jsonFail("İş fikrini, sektörü ve ili seç.", 400, requestId, request);
    }
    if (!isProvinceCode(parsed.data.provinceCode) || !isGrantNaceGroup(parsed.data.sectorCode)) {
      return jsonFail("İş fikrini, sektörü ve ili seç.", 400, requestId, request);
    }

    const calls = await loadYetkinhibeGrantCatalog(new Date());
    const match = matchPublicGrantEligibility({
      idea: parsed.data.idea,
      provinceCode: parsed.data.provinceCode,
      sectorCode: parsed.data.sectorCode,
      calls,
    });
    return jsonOk(match, 200, requestId, request);
  } catch (error) {
    if (error instanceof GrantCatalogUnavailableError) {
      logEvent({
        level: "error",
        event: "tezgah.grant_match.unavailable",
        route: ROUTE,
        reason: error.reason,
        status: 503,
      });
      return jsonFail(YETKINHIBE_COPY.errors.catalogUnavailable, 503, requestId, request);
    }
    return jsonFromUnknown(error, 500, requestId, request);
  }
}
