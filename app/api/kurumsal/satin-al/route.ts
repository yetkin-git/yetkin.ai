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
  KURUMSAL_SCREENING_MODULE,
  KURUMSAL_SCREENING_UNIT,
} from "@/lib/sales/kurumsal-screening";
import {
  KURUMSAL_SCREENING_ORDER_PURPOSE,
  KURUMSAL_SCREENING_PURCHASE_PATH,
} from "@/lib/sales/kurumsal-screening-entitlement";

/**
 * Kurumsal ilan / otomatik aday eleme paketi — tek seferlik PayTR tahsilatı.
 *
 * Neden gerekli: `POST /api/kurumsal/ilanlar` lisanssız isteği 402 ile kapatıyor
 * (`assertKurumsalScreeningEntitlement`). Ama lisans **yalnız** CLEARED bir sipariş
 * ile doğuyordu ve bu siparişi üreten rota yoktu. Yani kapı kapanmış, anahtar
 * üretilmemişti: ürün pratikte satılamıyordu. Bu rota katalog birimini
 * (`kurumsal/job-screening-pack`) gerçek tahsilata bağlar.
 *
 * Dürüstlük sınırları:
 * - Tutar istekten okunmaz; yalnız aktif katalog satırından gelir (A1).
 * - Katalog satırı yoksa/pasifse tahsilat **başlamaz** (422).
 * - Satın alma tek başına aday puanı basmaz; yalnız ilan açma hakkını verir.
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
    const placed = await placeSingleCatalogPurchase({
      userId: user.id,
      email: user.email,
      moduleKey: KURUMSAL_SCREENING_MODULE,
      unitKey: KURUMSAL_SCREENING_UNIT,
      purpose: KURUMSAL_SCREENING_ORDER_PURPOSE,
      basketName: "Kurumsal ilan ve otomatik aday eleme paketi",
      returnDesk: "kurumsal",
      idempotencyKey: idempotency.key,
      userIp: resolvePaytrCheckoutUserIp(request.headers),
      consent: consent.data,
    });
    if (!placed.ok) {
      // Katalog kapalıysa dürüst yönlendirme: self-servis kasa yok, ön talep var.
      if (placed.status === 422) {
        return jsonFail(
          `Paket şu an katalogda satışa açık değil. Ön talep: ${KURUMSAL_SCREENING_PURCHASE_PATH}`,
          422,
          requestId,
          request,
        );
      }
      return jsonFail(placed.error, placed.status, requestId, request);
    }
    return jsonOk(placed, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
