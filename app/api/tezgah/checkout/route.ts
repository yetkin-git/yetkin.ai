import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { checkoutLegalConsentSchema } from "@/lib/kernel/legal/checkout-consent";
import { resolvePaytrCheckoutUserIp } from "@/lib/kernel/payments/paytr/checkout";
import { placeTezgahCheckout, type TezgahCheckoutKind } from "@/lib/tezgah/checkout";

/** Tezgâh Pro veya 10 kredi. Katalog satırı yoksa 422. Tutar istekten okunmaz. */
export const auth = "session" as const;

function kindOf(value: unknown): TezgahCheckoutKind | null {
  if (value === "pro" || value === "credit-pack") {
    return value;
  }
  return null;
}

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const idempotency = requireRailV1IdempotencyKey(request, requestId);
    if (!idempotency.ok) {
      return idempotency.response;
    }
    const body: unknown = await request.json().catch(() => null);
    const record = body != null && typeof body === "object" && !Array.isArray(body) ? body : null;
    const kind = kindOf(record && "kind" in record ? record.kind : null);
    const consent = checkoutLegalConsentSchema.safeParse(record);
    if (!kind || !consent.success) {
      return jsonFail("Paket ve kasa rızası zorunludur.", 422, requestId, request);
    }
    const placed = await placeTezgahCheckout({
      userId: user.id,
      email: user.email,
      kind,
      idempotencyKey: idempotency.key,
      userIp: resolvePaytrCheckoutUserIp(request.headers),
      consent: consent.data,
    });
    if (!placed.ok) {
      return jsonFail(placed.error, placed.status, requestId, request);
    }
    return jsonOk(placed, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
