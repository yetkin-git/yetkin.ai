import { requireSession } from "@/lib/kernel/auth/session";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { jsonFromUnknown } from "@/lib/kernel/http/json";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { resolvePaytrCheckoutUserIp } from "@/lib/kernel/payments/paytr/checkout";
import { completeJuniorCheckout } from "@/lib/junior/checkout";
import { placeJuniorPaytrOrder } from "@/lib/junior/checkout-paytr";
import { createPrismaJuniorStore } from "@/lib/junior/load";
import { readJuniorYearlyPrice } from "@/lib/junior/price";
import { juniorLockedResponse } from "@/lib/junior/surface-lock";

export const auth = "session" as const;

const JUNIOR_CHECKOUT_ROUTE = "/api/junior-pilot/checkout";

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const idempotency = requireRailV1IdempotencyKey(request, requestId);
    if (!idempotency.ok) {
      return idempotency.response;
    }
    const locked = juniorLockedResponse(requestId, request, user, "checkout");
    if (locked) {
      return locked;
    }
    const body: unknown = await request.json().catch(() => ({}));
    return settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: user.id,
        route: JUNIOR_CHECKOUT_ROUTE,
        key: idempotency.key,
        requestHash: hashIdempotencyPayload(body),
        requestId,
        request,
      },
      async () => {
        const result = await completeJuniorCheckout(
          createPrismaJuniorStore(),
          user.id,
          body,
          new Date(),
          {
            email: user.email,
            userIp: resolvePaytrCheckoutUserIp(request.headers),
            actor: {
              id: user.id,
              email: user.email,
              emailConfirmedAt: user.emailConfirmedAt ?? null,
            },
            idempotencyKey: idempotency.key,
            ports: {
              readPrice: () => readJuniorYearlyPrice(),
              placeOrder: placeJuniorPaytrOrder,
            },
          },
        );
        if (!result.ok) {
          return { status: result.status, body: { error: result.error } };
        }
        return {
          status: 200,
          body: {
            status: result.data.status,
            electiveQuota: result.data.electiveQuota,
            alreadyActive: result.data.alreadyActive,
            expiresAt: result.data.expiresAt,
            merchantOid: result.data.merchantOid,
            embedIframe: result.data.embedIframe,
            ...(result.data.embedIframe ? { iframeUrl: result.data.iframeUrl } : {}),
          },
        };
      },
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
