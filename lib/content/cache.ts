/**
 * Statik içerik önbelleği — sözlük, rehber ve yasal metinler.
 *
 * **Sorun (tespit §5.5):** `app/` altında tek bir `revalidate` tanımı bile
 * yoktu. `/sozluk`, `/sozluk/[terim]`, `/rehber/[slug]` ve `/legal/[slug]`
 * tamamen dosya sabitlerinden beslenmesine rağmen her istekte yeniden
 * render ediliyordu.
 *
 * **Kısıt:** Kök `app/layout.tsx` nonce CSP için `cookies()` + `connection()`
 * çağırır. Bu yüzden sayfa ağacı istek kapsamlı kalır ve bu sayfalar için
 * "tam sayfa ISR" mümkün değildir. Kazanılabilir olan katman **veri**
 * katmanıdır: pahalı okuma (dosya mtime, dizin taraması, JSON ayrıştırma)
 * süreç içi önbelleğe alınır, HTML gövdesi istek anında nonce ile üretilir.
 *
 * **Neden `unstable_cache` değil:** Next 16'da `unstable_cache` yerini
 * `use cache` direktifine bıraktı; `use cache` ise `cacheComponents` ister ve
 * `next.config.ts` bu amiral gemisinde kapalıdır (nonce CSP ile birlikte
 * ölçülmüş karar). Bu yüzden düşük riskli, iyi bilinen `Map` + TTL kullanılır:
 * önbellek süreç ömrüyle sınırlıdır, dağıtımda kendiliğinden boşalır ve
 * istekler arası bayat veri taşımaz.
 *
 * **TTL neden 3600 sn:** İçerik yalnız kod dağıtımıyla değişir. Bir saat,
 * dağıtım sonrası ilk istekte ısınmış kaydı en geç bir saatte tazeler; kayıp
 * durumunda (bellek baskısı) okuma yeniden yapılır — doğruluk bozulmaz.
 */

/** Sözlük/rehber/yasal içeriğin bayatlık sınırı (saniye). */
export const CONTENT_CACHE_TTL_SECONDS = 3_600;

type CacheEntry<T> = { value: T; expiresAt: number };

/**
 * Tek uçuşlu (single-flight) bellek önbelleği.
 *
 * Aynı anahtarı aynı anda isteyen N istek **tek** hesaplama yapar; diğerleri
 * aynı `Promise`'i bekler. Sıcak bir dağıtımda eşzamanlı ilk isteklerin
 * (ör. sitemap + sayfa) kaynağı N kez okumasını engeller.
 *
 * Hata önbelleğe alınmaz: okuma patlarsa bir sonraki istek yeniden dener.
 */
export function createContentCache<T>(options?: {
  ttlSeconds?: number;
  now?: () => number;
}) {
  const ttlMs = (options?.ttlSeconds ?? CONTENT_CACHE_TTL_SECONDS) * 1_000;
  const now = options?.now ?? Date.now;
  const settled = new Map<string, CacheEntry<T>>();
  const inflight = new Map<string, Promise<T>>();

  async function read(key: string, load: () => Promise<T> | T): Promise<T> {
    const cached = settled.get(key);
    if (cached && cached.expiresAt > now()) {
      return cached.value;
    }
    const pending = inflight.get(key);
    if (pending) {
      return pending;
    }
    // `inflight` **senkron** yükleyiciden önce yazılır: yükleyici anında
    // fırlatırsa bile kayıt temizlenir ve sonraki istek yeniden dener.
    const task = Promise.resolve()
      .then(() => load())
      .then((value) => {
        settled.set(key, { value, expiresAt: now() + ttlMs });
        return value;
      })
      .finally(() => {
        inflight.delete(key);
      });
    inflight.set(key, task);
    return task;
  }

  /** Test ve operasyon kancası: kayıtları düşür. */
  function clear(): void {
    settled.clear();
    inflight.clear();
  }

  return { read, clear };
}
