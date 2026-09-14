/**
 * Upstash Redis REST hız tavanı — TCP istemcisi yok.
 * `rate-limit-port.ts` ve `http-rate-limit.ts` bu dosyayı import etmez;
 * bağlayıcı `rate-limit-runtime.ts`. Hata = fail-closed (belleğe düşmez).
 */

import {
  createFailClosedRateLimitPort,
  type RateLimitDecision,
  type RateLimitPort,
  type RateLimitWindow,
} from "@/lib/kernel/security/rate-limit-port";

export type RedisRestRateLimitPortInput = {
  restUrl: string;
  token: string;
  fetchImpl?: typeof fetch;
};

type UpstashPipelineRow = [error: string | null, result: unknown];

function windowSeconds(window: RateLimitWindow): number {
  return Math.max(1, Math.ceil(window.windowMs / 1000));
}

function deny(window: RateLimitWindow): RateLimitDecision {
  return {
    allowed: false,
    remaining: 0,
    retryAfterSec: windowSeconds(window),
    limit: window.limit,
  };
}

function asCount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && /^-?\d+$/.test(value)) {
    return Number.parseInt(value, 10);
  }
  return null;
}

export function createRedisRestRateLimitPort(input: RedisRestRateLimitPortInput): RateLimitPort {
  const restUrl = input.restUrl.trim().replace(/\/+$/, "");
  const token = input.token.trim();
  if (!restUrl || !token) {
    return createFailClosedRateLimitPort();
  }
  const fetchImpl = input.fetchImpl ?? globalThis.fetch.bind(globalThis);

  return {
    async consume(identityKey, window) {
      const key = `${window.keyPrefix}:${identityKey}`;
      const ttlSec = windowSeconds(window);
      try {
        const response = await fetchImpl(`${restUrl}/pipeline`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify([
            ["INCR", key],
            ["EXPIRE", key, String(ttlSec), "NX"],
          ]),
        });
        if (!response.ok) {
          return deny(window);
        }
        const rows = (await response.json()) as unknown;
        if (!Array.isArray(rows) || rows.length < 1) {
          return deny(window);
        }
        const incr = rows[0] as UpstashPipelineRow;
        if (!Array.isArray(incr) || incr[0] != null) {
          return deny(window);
        }
        const count = asCount(incr[1]);
        if (count == null || count < 1) {
          return deny(window);
        }
        const allowed = count <= window.limit;
        return {
          allowed,
          remaining: Math.max(0, window.limit - count),
          retryAfterSec: allowed ? 0 : ttlSec,
          limit: window.limit,
        };
      } catch {
        return deny(window);
      }
    },
    resetForTests() {},
  };
}
