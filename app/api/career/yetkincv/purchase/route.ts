import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { checkoutLegalConsentSchema } from "@/lib/kernel/legal/checkout-consent";
import { placeSingleCatalogPurchase } from "@/lib/kernel/payments/single-purchase-checkout";
import { resolvePaytrCheckoutUserIp } from "@/lib/kernel/payments/paytr/checkout";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";
import {
  loadYetkinCvPublicationState,
  YETKINCV_PUBLICATION_BASKET_NAME,
  YETKINCV_PUBLICATION_ORDER_PURPOSE,
  YETKINCV_PUBLICATION_RETURN_DESK,
  YETKINCV_PUBLICATION_UNIT,
} from "@/lib/career/yetkincv-publication";

/**
 * Faz 3 / §4.3 — YetkinCV **kamuya açık yayın** satın alımı (tek seferlik 290 TL).
 *
 * Dürüstlük sınırları:
 * - Sınav, puan, SWOT ve 30/60/90 planı **ücretsizdir** ve bu rotadan geçmez.
 *   Bu rota yalnız **yayını** açar; satın alma tek başına puan basmaz.
 * - Mühür yoksa satın alma kapalıdır (422). Puanı olmayan kullanıcıya "kart yayınlandı"
 *   denmez; önce sınavı çözmesi gerekir.
 * - Zaten yayınlanmışsa ikinci kez ücret alınmaz (`409`), kart açıktır.
 * - Tutar istekten okunmaz; katalog `career/yetkincv-exam` satırından gelir.
 */
export const auth = "session" as const;

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
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
    const record = body != null && typeof body === "object" && !Array.isArray(body) ? body : null;
    const consent = checkoutLegalConsentSchema.safeParse(record);
    if (!consent.success) {
      return jsonFail("Kasa rızası zorunludur.", 422, requestId, request);
    }
    const publication = await loadYetkinCvPublicationState(user.id);
    if (!publication.hasSeal) {
      return jsonFail(
        "Yayın için önce YetkinCV vaka testini çöz. Puan satın alınmaz; test sonucundan doğar.",
        422,
        requestId,
        request,
      );
    }
    if (publication.published) {
      return jsonFail(
        "Kamuya açık kariyer kartın zaten açık. İkinci kez ücret alınmaz.",
        409,
        requestId,
        request,
      );
    }
    const placed = await placeSingleCatalogPurchase({
      userId: user.id,
      email: user.email,
      moduleKey: "career",
      unitKey: YETKINCV_PUBLICATION_UNIT,
      purpose: YETKINCV_PUBLICATION_ORDER_PURPOSE,
      basketName: YETKINCV_PUBLICATION_BASKET_NAME,
      returnDesk: YETKINCV_PUBLICATION_RETURN_DESK,
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
