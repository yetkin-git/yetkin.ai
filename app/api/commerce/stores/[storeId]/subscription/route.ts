import { placeCommerceSubscriptionOrder, parseCommerceSubscriptionConsent } from "@/lib/commerce/subscription-checkout";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { jsonFail, jsonFromUnknown } from "@/lib/kernel/http/json";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { requireSession } from "@/lib/kernel/auth/session";
import { resolvePaytrCheckoutUserIp } from "@/lib/kernel/payments/paytr/checkout";

export const auth = "session" as const;

export async function POST(request: Request, context: { params: Promise<{ storeId: string }> }) {
  const requestId = resolveRequestId(request);
  const { storeId } = await context.params;
  try {
    const user = await requireSession(request);
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
