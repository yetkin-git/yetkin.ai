import { saveProductModelSettings } from "@/lib/kernel/admin/ai-model-write";
import { requireSuperAdmin } from "@/lib/kernel/auth/session";
import { listProductModelCatalog } from "@/lib/kernel/ai/gemini-model-catalog";
import {
  parseProductModelPatch,
  PRODUCT_MODEL_DEFAULTS,
  PRODUCT_MODEL_SLOTS,
  readProductModelSnapshot,
} from "@/lib/kernel/ai/product-models";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
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
    await requireSuperAdmin(request);
    const url = new URL(request.url);
    const refresh = url.searchParams.get("refresh") === "1";
    const [snapshot, catalog] = await Promise.all([
      readProductModelSnapshot(),
      listProductModelCatalog(refresh),
    ]);
    const response = jsonOk(
      {
        defaults: PRODUCT_MODEL_DEFAULTS,
        slots: PRODUCT_MODEL_SLOTS,
        stored: snapshot.stored,
        resolved: snapshot.resolved,
        updatedBy: snapshot.updatedBy,
        updatedAt: snapshot.updatedAt,
        models: catalog.models,
        source: catalog.source,
      },
      200,
      undefined,
      request,
    );
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}

export async function PATCH(request: Request) {
  try {
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.adminIp);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const session = await requireSuperAdmin(request);
    const body: unknown = await request.json().catch(() => null);
    const slots = parseProductModelPatch(body);
    await saveProductModelSettings(session.id, slots);
    const snapshot = await readProductModelSnapshot();
    return jsonOk(
      {
        stored: snapshot.stored,
        resolved: snapshot.resolved,
        updatedAt: snapshot.updatedAt,
      },
      200,
      undefined,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}
