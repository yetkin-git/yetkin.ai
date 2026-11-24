import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { logEvent } from "@/lib/kernel/observability/log";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";
import { YETKINHIBE_COPY } from "@/lib/yetkinhibe/copy";
import { GrantCatalogUnavailableError } from "@/lib/yetkinhibe/grant-catalog-core";
import { loadYetkinhibeGrantCatalog } from "@/lib/yetkinhibe/grant-catalog-live";

/**
 * YetkinHibe hibe kataloğu (F2). Web-only (D-11): dış v1 sözleşmesinde yer almaz.
 * Oda kapalıyken kenar 410 döner (`yetkinhibe` kaydı, bayrak DRON_YETKINHIBE_OPEN).
 * Okunamayan katalog 503 döner; sabit kataloğa düşülmez (R1, A5).
 */
export const auth = "public" as const;
export const dynamic = "force-dynamic";

const ROUTE = "/api/yetkinhibe/grant/catalog";

export async function GET(request: Request) {
  try {
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.yetkinhibeCatalogIp);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const calls = await loadYetkinhibeGrantCatalog();
    return jsonOk({ calls }, 200, undefined, request);
  } catch (error) {
    if (error instanceof GrantCatalogUnavailableError) {
      logEvent({
        level: "error",
        event: "yetkinhibe.grant_catalog.unavailable",
        route: ROUTE,
        reason: error.reason,
        status: 503,
      });
      return jsonFail(YETKINHIBE_COPY.errors.catalogUnavailable, 503, undefined, request);
    }
    return jsonFromUnknown(error, 500, undefined, request);
  }
}
