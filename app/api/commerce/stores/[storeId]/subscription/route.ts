import { cancelCommerceSubscriptionAtPeriodEnd } from "@/lib/commerce/subscription-cancel";
import { placeCommerceSubscriptionOrder, parseCommerceSubscriptionConsent } from "@/lib/commerce/subscription-checkout";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { requireSession } from "@/lib/kernel/auth/session";
import { resolvePaytrCheckoutUserIp } from "@/lib/kernel/payments/paytr/checkout";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";

export const auth = "session" as const;

export async function POST(request: Request, context: { params: Promise<{ storeId: string }> }) {
  const requestId = resolveRequestId(request);
  const { storeId } = await context.params;
  try {
    const user = await requireSession(request);
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.checkoutUser, user.id);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const idempotency = requireRailV1IdempotencyKey(request, requestId);
    if (!idempotency.ok) {
      return idempotency.response;
    }
    const body: unknown = await request.json().catch(() => null);
    const consent = parseCommerceSubscriptionConsent(body);
    if (!consent) {
      return jsonFail("Mesafeli satış ve anında ifa rızası zorunludur.", 422, requestId, request);
    }
    return settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: user.id,
        route: `/api/commerce/stores/${storeId}/subscription`,
        key: idempotency.key,
        requestHash: hashIdempotencyPayload(body),
        requestId,
        request,
      },
      async () => {
        const result = await placeCommerceSubscriptionOrder({
          userId: user.id,
          email: user.email,
          storeId,
          idempotencyKey: idempotency.key,
          userIp: resolvePaytrCheckoutUserIp(request.headers),
          consent,
        });
        if (!result.ok) {
          return { status: result.status, body: { error: result.error } };
        }
        if (result.kind === "settled") {
          return { status: 200, body: { kind: "settled", merchantOid: result.merchantOid, expiresAt: result.expiresAt } };
        }
        return { status: 200, body: { kind: "iframe", merchantOid: result.merchantOid, iframeUrl: result.iframeUrl } };
      },
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

/** Dönem sonunda yenilemeyi durdurur. Hizmet anında kesilmez. */
export async function DELETE(request: Request, context: { params: Promise<{ storeId: string }> }) {
  const requestId = resolveRequestId(request);
  const { storeId } = await context.params;
  try {
    const user = await requireSession(request);
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.checkoutUser, user.id);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const result = await cancelCommerceSubscriptionAtPeriodEnd(user.id, storeId);
    if (!result.ok) {
      return jsonFail(result.error, result.status, requestId, request);
    }
    return jsonOk({ cancelAtPeriodEnd: true, periodEnd: result.periodEnd }, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
