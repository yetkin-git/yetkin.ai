/**
 * Hız tavanı portu.
 * Varsayılan implementasyon süreç-içi bellektir. Dış önbellek istemcisi
 * bu arayüzün arkasına gizlenmez (Anayasa). İkinci replica kararı gelirse
 * çağıran değişmez; yalnız `RateLimitPort` bağlanır.
 */

export type RateLimitWindow = {
  keyPrefix: string;
  limit: number;
  windowMs: number;
};

export type RateLimitDecision = {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
  limit: number;
};

export interface RateLimitPort {
  consume(identityKey: string, window: RateLimitWindow, now?: number): RateLimitDecision;
  /** Test sızıntısını keser — üretim çağırmaz. */
  resetForTests(): void;
}

type Bucket = { count: number; resetAt: number };

const DEFAULT_MAX_BUCKETS = 10_000;

export function createInMemoryRateLimitPort(
  maxBuckets: number = DEFAULT_MAX_BUCKETS,
): RateLimitPort {
  const buckets = new Map<string, Bucket>();

  function prune(now: number): void {
    if (buckets.size < 2_000) {
      return;
    }
    for (const [key, bucket] of buckets) {
      if (now >= bucket.resetAt) {
        buckets.delete(key);
      }
    }
    if (buckets.size > maxBuckets) {
      buckets.clear();
    }
  }

  return {
    consume(identityKey, window, now = Date.now()) {
      prune(now);
      const key = `${window.keyPrefix}:${identityKey}`;
      let bucket = buckets.get(key);
      if (!bucket || now >= bucket.resetAt) {
        bucket = { count: 0, resetAt: now + window.windowMs };
      }
      bucket.count += 1;
      buckets.set(key, bucket);
      const allowed = bucket.count <= window.limit;
      const remaining = Math.max(0, window.limit - bucket.count);
      const retryAfterSec = allowed ? 0 : Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      return { allowed, remaining, retryAfterSec, limit: window.limit };
    },
    resetForTests() {
      buckets.clear();
    },
  };
}
