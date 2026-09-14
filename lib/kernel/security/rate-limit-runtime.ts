/**
 * Hız tavanı bağlayıcısı. Kenar `http-rate-limit` buradan port alır.
 * Redis REST URL+token birlikte doluysa paylaşılan depo; kısmi config
 * fail-closed. İkisi boşsa süreç-içi bellek (lab / Vitest).
 */

import {
  createFailClosedRateLimitPort,
  createInMemoryRateLimitPort,
  type RateLimitPort,
} from "@/lib/kernel/security/rate-limit-port";
import { createRedisRestRateLimitPort } from "@/lib/kernel/security/redis-rate-limit-port";

export function resolveRateLimitPort(env: NodeJS.ProcessEnv = process.env): RateLimitPort {
  const restUrl = env.RATE_LIMIT_REDIS_REST_URL?.trim() ?? "";
  const token = env.RATE_LIMIT_REDIS_REST_TOKEN?.trim() ?? "";
  if (restUrl && token) {
    return createRedisRestRateLimitPort({ restUrl, token });
  }
  if (restUrl || token) {
    return createFailClosedRateLimitPort();
  }
  return createInMemoryRateLimitPort();
}
