import { requireSession } from "@/lib/kernel/auth/session";
import { juniorLockedResponse } from "@/lib/junior/surface-lock";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { resolvePaytrCheckoutUserIp } from "@/lib/kernel/payments/paytr/checkout";
import { completeJuniorCheckout } from "@/lib/junior/checkout";
import { createPrismaJuniorStore } from "@/lib/junior/load";

export const auth = "session" as const;

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  const locked = juniorLockedResponse(requestId, request);
  if (locked) {
    return locked;
  }
  try {
    const user = await requireSession(request);
    const result = await completeJuniorCheckout(
      createPrismaJuniorStore(),
      user.id,
      await request.json().catch(() => ({})),
      new Date(),
      {
        email: user.email,
        userIp: resolvePaytrCheckoutUserIp(request.headers),
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
