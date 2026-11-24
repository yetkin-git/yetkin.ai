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
import {
  grantBriefMatchRequestSchema,
  readGrantMatchBodyText,
  toGrantBriefMatchWire,
} from "@/lib/yetkinhibe/grant-brief-match";
import { loadYetkinhibeGrantCatalog } from "@/lib/yetkinhibe/grant-catalog-live";
import { matchGrantProgramsForBrief } from "@/lib/yetkinhibe/match-grant-programs-for-brief";

/**
 * YetkinHibe ücretsiz eşleştirme. Tek motor `matchGrantProgramsForBrief`.
 * İl, kitle, NACE ve yatırım odağı zorunludur. Profil yazılmaz.
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

    const parsed = grantBriefMatchRequestSchema.safeParse(raw);
    if (!parsed.success) {
      return jsonFail(YETKINHIBE_COPY.errors.invalidMatchProfile, 400, requestId, request);
    }

    const now = new Date();
    const calls = await loadYetkinhibeGrantCatalog(now);
    const matched = matchGrantProgramsForBrief(
      parsed.data,
      calls.map((call) => ({
        id: call.id,
        title: call.title,
        sourceLabel: call.sourceLabel,
        officialInfoUrl: call.officialInfoUrl,
        status: call.status,
        remainingDays: call.remainingDays,
        poolAmountMinor: call.poolAmountMinor,
        maxSupportMinor: call.maxSupportMinor,
        supportRatioBps: call.supportRatioBps,
        sourceVerifiedAt: call.sourceVerifiedAt,
        eligibility: call.eligibility,
      })),
      now,
    );

    return jsonOk(
      {
        matches: matched.eligible.map((row) => toGrantBriefMatchWire(row)),
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
