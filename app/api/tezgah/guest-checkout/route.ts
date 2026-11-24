import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { checkoutLegalConsentSchema } from "@/lib/kernel/legal/checkout-consent";
import { resolvePaytrCheckoutUserIp } from "@/lib/kernel/payments/paytr/checkout";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";
import { readIdempotencyKey } from "@/lib/kernel/http/idempotency-key";
import {
  normalizeGuestEmail,
  parseGuestBilling,
  placeTezgahGuestCheckout,
} from "@/lib/tezgah/guest-checkout";

/**
 * Faz 3 / §4.1 — **misafir ödeme** (kayıt olmadan Tezgâh Pro).
 *
 * Neden public: Tezgâh kayıtsız üretim yapıyor; ödemesi de kayıtsız olabilmeli.
 * Ödeme niyeti en yüksek anda 4 adım (kayıt → doğrulama → giriş → satın alma)
 * yerine 1 adım kalır.
 *
 * Güvenlik sınırları:
 * - `guestCheckoutIp` tavanı (5/10dk) kart denemesi patlamasını keser.
 * - `Idempotency-Key` zorunludur; aynı anahtar aynı sipariş satırını açar.
 * - Kayıtlı e-posta misafir ödemesi yapamaz (`409`) — çift abonelik doğmaz.
 * - Ödeme öncesi **hesap açılmaz** (Supabase `signUp` yok). Hesap, e-postadaki
 *   `/claim/[token]` bağlantısıyla ödeme onayından sonra açılır.
 * - Tutar istekten okunmaz; katalog `tezgah/pro` satırından gelir.
 */
export const auth = "public" as const;

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.guestCheckoutIp);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const idempotency = readIdempotencyKey(request);
    if (!idempotency.ok) {
      return jsonFail(idempotency.error, 400, requestId, request);
    }
    const body: unknown = await request.json().catch(() => null);
    const record = body != null && typeof body === "object" && !Array.isArray(body) ? body : null;
    const email = normalizeGuestEmail(
      record && "email" in record && typeof record.email === "string" ? record.email : "",
    );
    if (!email) {
      return jsonFail("Geçerli bir e-posta adresi gerekli.", 400, requestId, request);
    }
    const billing = parseGuestBilling(record && "billing" in record ? record.billing : null);
    if (!billing) {
      return jsonFail("Fatura künyesi eksik veya geçersiz.", 422, requestId, request);
    }
    const consent = checkoutLegalConsentSchema.safeParse(record);
    if (!consent.success) {
      return jsonFail("Kasa rızası zorunludur.", 422, requestId, request);
    }
    const placed = await placeTezgahGuestCheckout({
      email,
      billing,
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
