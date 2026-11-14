import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { logEvent } from "@/lib/kernel/observability/log";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";
import { YETKINHIBE_COPY } from "@/lib/yetkinhibe/copy";
import { GrantCatalogUnavailableError } from "@/lib/yetkinhibe/grant-catalog-core";
import { loadYetkinhibeGrantCatalog } from "@/lib/yetkinhibe/grant-catalog-live";
import {
  grantMatchRequestSchema,
  readGrantMatchBodyText,
  toGrantMatchWire,
} from "@/lib/yetkinhibe/grant-match-api";
import { matchGrantsForProfile } from "@/lib/yetkinhibe/match-grants-for-profile";

/**
 * YetkinHibe ücretsiz eşleştirme (F3b, D-11, D-12). Web-only: dış v1 sözleşmesinde yer almaz.
 * Oturum zorunludur. Canlıda `Company` yoktur; kapı kullanıcı oturumudur (K-3, R13).
 * Profil yalnız bu istekte okunur. Veritabanına yazılmaz ve günlüğe alınmaz.
 * Oda kapalıyken kenar 410 döner (`yetkinhibe` kaydı, bayrak DRON_YETKINHIBE_OPEN).
 * Ücretli adım yoktur: AI, `Idempotency-Key` ve ödeme kapsamı F4'tedir.
 */
export const auth = "session" as const;

const ROUTE = "/api/yetkinhibe/grant/match";

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);

    const limited = await applyHttpRateLimit(
      request,
      HTTP_RATE_LIMITS.yetkinhibeMatchUser,
      user.id,
    );
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
      return jsonFail(YETKINHIBE_COPY.errors.invalidMatchProfile, 400, requestId, request);
    }

    const parsed = grantMatchRequestSchema.safeParse(raw);
    if (!parsed.success) {
      return jsonFail(YETKINHIBE_COPY.errors.invalidMatchProfile, 400, requestId, request);
    }

    const now = new Date();
    const calls = await loadYetkinhibeGrantCatalog(now);
    const matches = matchGrantsForProfile(parsed.data, calls);

    return jsonOk(
      {
        matches: matches.map(toGrantMatchWire),
        generatedAt: now.toISOString(),
      },
      200,
      requestId,
      request,
    );
  } catch (error) {
    if (error instanceof GrantCatalogUnavailableError) {
      logEvent({
        level: "error",
        event: "yetkinhibe.grant_match.unavailable",
        route: ROUTE,
        reason: error.reason,
        status: 503,
      });
      return jsonFail(YETKINHIBE_COPY.errors.catalogUnavailable, 503, requestId, request);
    }
    return jsonFromUnknown(error, 500, requestId, request);
  }
}
