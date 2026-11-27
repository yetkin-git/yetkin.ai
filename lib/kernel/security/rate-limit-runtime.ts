/**
 * Hız tavanı bağlayıcısı. Kenar `http-rate-limit` buradan port alır.
 * Redis REST URL+token birlikte doluysa paylaşılan depo; kısmi config
 * fail-closed. İkisi boşsa süreç-içi bellek (lab / Vitest).
 *
 * Vercel KV / Upstash entegrasyonu `KV_REST_API_URL` + `KV_REST_API_TOKEN`
 * yazar. `RATE_LIMIT_REDIS_REST_*` boşken bu çift yedek alınır — üretimde
 * dağıtık sayaç çalışır, OPS-5 build kapısı takılmaz. Kısmi RATE_LIMIT
 * çifti KV ile tamamlanmaz (kaynak karıştırmak yasak).
 */

import {
  createDegradedUnsubscribeRateLimitPort,
  createFailClosedRateLimitPort,
  createInMemoryRateLimitPort,
  type RateLimitPort,
} from "@/lib/kernel/security/rate-limit-port";
import { createRedisRestRateLimitPort } from "@/lib/kernel/security/redis-rate-limit-port";

export type RateLimitRuntimeEnv = {
  RATE_LIMIT_REDIS_REST_URL?: string;
  RATE_LIMIT_REDIS_REST_TOKEN?: string;
  /** Vercel KV / Upstash REST — RATE_LIMIT çifti boşken yedek. */
  KV_REST_API_URL?: string;
  KV_REST_API_TOKEN?: string;
};

/** Paylaşılan depo, kısmi fail-closed, ya da tek süreç belleği. */
export type RateLimitStoreMode = "redis-rest" | "fail-closed-partial" | "in-process-single-node";

export type ResolvedRateLimitRedisRest = {
  restUrl: string;
  token: string;
  /** Hangi env çifti kullanıldı; kısmi veya yok için boş kimlik bilgisi. */
  source: "rate-limit" | "kv" | "partial" | "none";
};

function readPair(
  url: string | undefined,
  token: string | undefined,
): { restUrl: string; token: string } {
  return {
    restUrl: url?.trim() ?? "",
    token: token?.trim() ?? "",
  };
}

/**
 * Önce `RATE_LIMIT_REDIS_REST_*`; ikisi de boşsa `KV_REST_API_*`.
 * Kısmi birincil çift ikincil ile doldurulmaz.
 */
export function resolveRateLimitRedisRestCredentials(
  env: RateLimitRuntimeEnv = {
    RATE_LIMIT_REDIS_REST_URL: process.env.RATE_LIMIT_REDIS_REST_URL,
    RATE_LIMIT_REDIS_REST_TOKEN: process.env.RATE_LIMIT_REDIS_REST_TOKEN,
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
  },
): ResolvedRateLimitRedisRest {
  const primary = readPair(env.RATE_LIMIT_REDIS_REST_URL, env.RATE_LIMIT_REDIS_REST_TOKEN);
  if (primary.restUrl && primary.token) {
    return { ...primary, source: "rate-limit" };
  }
  if (primary.restUrl || primary.token) {
    return { ...primary, source: "partial" };
  }

  const kv = readPair(env.KV_REST_API_URL, env.KV_REST_API_TOKEN);
  if (kv.restUrl && kv.token) {
    return { ...kv, source: "kv" };
  }
  if (kv.restUrl || kv.token) {
    return { ...kv, source: "partial" };
  }
  return { restUrl: "", token: "", source: "none" };
}

export function classifyRateLimitStore(
  env: RateLimitRuntimeEnv = {
    RATE_LIMIT_REDIS_REST_URL: process.env.RATE_LIMIT_REDIS_REST_URL,
    RATE_LIMIT_REDIS_REST_TOKEN: process.env.RATE_LIMIT_REDIS_REST_TOKEN,
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
  },
): RateLimitStoreMode {
  const resolved = resolveRateLimitRedisRestCredentials(env);
  if (resolved.source === "rate-limit" || resolved.source === "kv") {
    return "redis-rest";
  }
  if (resolved.source === "partial") {
    return "fail-closed-partial";
  }
  return "in-process-single-node";
}

export function resolveRateLimitPort(
  env: RateLimitRuntimeEnv = {
    RATE_LIMIT_REDIS_REST_URL: process.env.RATE_LIMIT_REDIS_REST_URL,
    RATE_LIMIT_REDIS_REST_TOKEN: process.env.RATE_LIMIT_REDIS_REST_TOKEN,
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
  },
): RateLimitPort {
  const resolved = resolveRateLimitRedisRestCredentials(env);
  if (resolved.source === "rate-limit" || resolved.source === "kv") {
    return createRedisRestRateLimitPort({
      restUrl: resolved.restUrl,
      token: resolved.token,
    });
  }
  if (resolved.source === "partial") {
    return createDegradedUnsubscribeRateLimitPort(createFailClosedRateLimitPort());
  }
  return createInMemoryRateLimitPort();
}
