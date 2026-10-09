import { requireSession } from "@/lib/kernel/auth/session";
import { juniorLockedResponse } from "@/lib/junior/surface-lock";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { IDEMPOTENCY_KEY_HEADER } from "@/lib/kernel/http/idempotency-key";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { resolvePaytrCheckoutUserIp } from "@/lib/kernel/payments/paytr/checkout";
import { completeJuniorCheckout } from "@/lib/junior/checkout";
import { placeJuniorPaytrOrder } from "@/lib/junior/checkout-paytr";
import { createPrismaJuniorStore } from "@/lib/junior/load";
import { readJuniorYearlyPrice } from "@/lib/junior/price";

export const auth = "session" as const;

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const locked = juniorLockedResponse(requestId, request, user, "checkout");
    if (locked) {
      return locked;
    }
    const result = await completeJuniorCheckout(
      createPrismaJuniorStore(),
      user.id,
      await request.json().catch(() => ({})),
      new Date(),
      {
        email: user.email,
        userIp: resolvePaytrCheckoutUserIp(request.headers),
        actor: {
          id: user.id,
          email: user.email,
          emailConfirmedAt: user.emailConfirmedAt ?? null,
        },
        idempotencyKey: request.headers.get(IDEMPOTENCY_KEY_HEADER) ?? "",
        ports: {
          readPrice: () => readJuniorYearlyPrice(),
          placeOrder: placeJuniorPaytrOrder,
        },
      },
    );
    if (!result.ok) {
      return jsonFail(result.error, result.status, requestId, request);
    }
    return jsonOk(
      {
        status: result.data.status,
        electiveQuota: result.data.electiveQuota,
        alreadyActive: result.data.alreadyActive,
        expiresAt: result.data.expiresAt,
        merchantOid: result.data.merchantOid,
        embedIframe: result.data.embedIframe,
        ...(result.data.embedIframe ? { iframeUrl: result.data.iframeUrl } : {}),
      },
      200,
      requestId,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
