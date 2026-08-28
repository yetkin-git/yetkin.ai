/**
 * Hız tavanı portu.
 * Varsayılan implementasyon süreç-içi bellektir. Dış önbellek istemcisi
 * bu arayüzün arkasına gizlenmez (Anayasa). İkinci replica kararı gelirse
 * çağıran değişmez; yalnız `RateLimitPort` bağlanır.
 *
 * Taşmada tüm harita silinmez — en eski (LRU) kova düşer.
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

export const DEFAULT_MAX_BUCKETS = 10_000;

export function createInMemoryRateLimitPort(
  maxBuckets: number = DEFAULT_MAX_BUCKETS,
): RateLimitPort {
  const cap = Math.max(1, maxBuckets);
  const buckets = new Map<string, Bucket>();

  function pruneExpired(now: number): void {
    for (const [key, bucket] of buckets) {
      if (now >= bucket.resetAt) {
        buckets.delete(key);
      }
    }
  }

  function evictOldestWhileOverflow(): void {
    while (buckets.size > cap) {
      const oldest = buckets.keys().next().value;
      if (oldest === undefined) {
        break;
      }
      buckets.delete(oldest);
    }
  }

  function touch(key: string, bucket: Bucket): void {
    buckets.delete(key);
    buckets.set(key, bucket);
  }

  return {
    consume(identityKey, window, now = Date.now()) {
      if (buckets.size >= cap) {
        pruneExpired(now);
      }
      const key = `${window.keyPrefix}:${identityKey}`;
      let bucket = buckets.get(key);
      if (!bucket || now >= bucket.resetAt) {
        bucket = { count: 0, resetAt: now + window.windowMs };
      }
      bucket.count += 1;
      touch(key, bucket);
      evictOldestWhileOverflow();
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
