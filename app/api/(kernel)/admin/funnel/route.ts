import { requireSuperAdmin } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { toFunnelBoardWire } from "@/lib/kernel/admin/funnel-display";
import { loadAdminFunnelBoard, FUNNEL_UNAVAILABLE } from "@/lib/kernel/admin/funnel-load";
import { parseFunnelRangeParam } from "@/lib/kernel/admin/funnel-window";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";

export const auth = "admin" as const;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.adminIp);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const session = await requireSuperAdmin(request);
    const url = new URL(request.url);
    const range = parseFunnelRangeParam(url.searchParams.get("range"));
    const board = await loadAdminFunnelBoard(session, range);
    if (board.access === "forbidden") {
      return jsonFail("Bu sığınak Super Admin kilidine bağlıdır.", 403, undefined, request);
    }
    if (board.access === "unavailable") {
      return jsonFail(FUNNEL_UNAVAILABLE, 503, undefined, request);
    }
    const response = jsonOk(toFunnelBoardWire(board.snapshot), 200, undefined, request);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}
