/**
 * Upstash Redis REST hız tavanı — TCP istemcisi yok.
 * `http-rate-limit.ts` bu dosyayı import etmez; bağlayıcı `rate-limit-runtime.ts`.
 *
 * Upstash `/pipeline` satırı `{ result }` nesnesidir. Eski `[hata, sonuç]` dizisi
 * de okunur. Nesneyi dizi sanmak her istekte fail-closed deny üretir
 * (`remaining: 0`, `Retry-After` = pencerenin tamamı).
 *
 * Diğer kovalar: ağ, 5xx ve okunamayan gövde belleğe düşmez (fail-closed).
 * Tek tıkla RET kovası (`OUTREACH_UNSUBSCRIBE_RATE_PREFIX`) bu hata yolunda
 * süreç-içi pencereye iner; Redis gerçek sayacı limiti aştıysa yine reddedilir.
 */

import {
  createDegradedUnsubscribeRateLimitPort,
  createFailClosedRateLimitPort,
  createInMemoryRateLimitPort,
  OUTREACH_UNSUBSCRIBE_RATE_PREFIX,
  type RateLimitDecision,
  type RateLimitPort,
  type RateLimitWindow,
} from "@/lib/kernel/security/rate-limit-port";

export type RedisRestRateLimitPortInput = {
  restUrl: string;
  token: string;
  fetchImpl?: typeof fetch;
};

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

type IncrRead = { ok: true; count: number } | { ok: false };

/**
 * Pipeline satırı iki biçimden biri:
 * - güncel REST: `{ result: 3 }` veya `{ error: "ERR ..." }`
 * - eski dizi: `[null, 3]` veya `["ERR ...", null]`
 */
function readIncr(row: unknown): IncrRead {
  if (Array.isArray(row)) {
    if (row[0] != null) {
      return { ok: false };
    }
    const count = asCount(row[1]);
    if (count == null || count < 1) {
      return { ok: false };
    }
    return { ok: true, count };
  }
  if (row && typeof row === "object") {
    const record = row as { error?: unknown; result?: unknown };
    if (record.error != null && record.error !== "") {
      return { ok: false };
    }
    const count = asCount(record.result);
    if (count == null || count < 1) {
      return { ok: false };
    }
    return { ok: true, count };
  }
  return { ok: false };
}

function degradesOnRedisFailure(window: RateLimitWindow): boolean {
  return window.keyPrefix === OUTREACH_UNSUBSCRIBE_RATE_PREFIX;
}

export function createRedisRestRateLimitPort(input: RedisRestRateLimitPortInput): RateLimitPort {
  const restUrl = input.restUrl.trim().replace(/\/+$/, "");
  const token = input.token.trim();
  if (!restUrl || !token) {
    return createDegradedUnsubscribeRateLimitPort(createFailClosedRateLimitPort());
  }
  const fetchImpl = input.fetchImpl ?? globalThis.fetch.bind(globalThis);
  const memoryFallback = createInMemoryRateLimitPort();

  function denyOrDegrade(
    identityKey: string,
    window: RateLimitWindow,
    now: number,
  ): Promise<RateLimitDecision> {
    if (degradesOnRedisFailure(window)) {
      return memoryFallback.consume(identityKey, window, now);
    }
    return Promise.resolve(deny(window));
  }

  return {
    async consume(identityKey, window, now = Date.now()) {
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
          return denyOrDegrade(identityKey, window, now);
        }
        const rows = (await response.json()) as unknown;
        if (!Array.isArray(rows) || rows.length < 1) {
          return denyOrDegrade(identityKey, window, now);
        }
        const incr = readIncr(rows[0]);
        if (!incr.ok) {
          return denyOrDegrade(identityKey, window, now);
        }
        const allowed = incr.count <= window.limit;
        return {
          allowed,
          remaining: Math.max(0, window.limit - incr.count),
          retryAfterSec: allowed ? 0 : ttlSec,
          limit: window.limit,
        };
      } catch {
        return denyOrDegrade(identityKey, window, now);
      }
    },
    resetForTests() {
      memoryFallback.resetForTests();
    },
  };
}
