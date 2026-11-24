import "server-only";

import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  type HttpRateLimitResult,
} from "@/lib/kernel/security/http-rate-limit";

/**
 * S-01 — Tezgâh üretim hattı kullanıcı tavanı.
 *
 * Kenar `llmIp` (20/10dk) yalnız **IP başına** sayar. Aynı çıkış IP'sini paylaşan
 * kullanıcılar (CGNAT, kurumsal NAT, mobil operatör) tek kovayı tüketir; ayrıca tek
 * bir IP `AI_PLATFORM_DAILY_CAP_MINOR` kalkanını tek başına yakabilir ve meşru
 * kullanıcıları 503'e düşürür.
 *
 * Bu kapı aktör kimliği (`user:<uuid>` veya `guest:<ip>`) başına sayar. Kota
 * (`consumeTezgahQuota`) maliyet/kullanım sınırıdır; bu tavan **hız** sınırıdır.
 * İki kapı birbirinin yerine geçmez: biri adaleti, diğeri maliyeti korur.
 *
 * Kota düşmez: yalnız 429 döner, hak geri gelir.
 */
export async function guardTezgahGenerateRate(
  request: Request,
  actorId: string,
): Promise<HttpRateLimitResult> {
  return applyHttpRateLimit(request, HTTP_RATE_LIMITS.tezgahGenerateUser, actorId);
}
