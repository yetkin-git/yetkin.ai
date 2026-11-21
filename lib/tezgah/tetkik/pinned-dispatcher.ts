import "server-only";

import { request as httpsRequest } from "node:https";
import { isIP } from "node:net";
import { Readable } from "node:stream";
import type { PinnedDispatcherFactory, PinnedFetchTarget } from "@/lib/tezgah/tetkik/guard";

/**
 * SSRF IP pinleme — gerçek bağlantı katmanı.
 *
 * **Sorun (TOCTOU):** `fetchPublicHomepage` adresi bir kez çözer ve doğrular;
 * `fetch` ise aynı adı **ikinci kez** çözer. Aradaki pencerede DNS rebinding ile
 * public görünen ad, bağlantı anında özel ağa dönebilir. Ad doğrulaması IP'yi
 * görmediği için bu saldırı görünmez.
 *
 * **Çözüm:** Doğrulanan IP `node:https` isteğinin `lookup` kancasına **sabitlenir**.
 * `lookup` sabit IP döndürür, `servername`/`Host` gerçek alan adından gelir.
 * Böylece doğrulama ile TCP bağlantısı **aynı** IP üzerinde koşar; ikinci DNS
 * çözümü yoktur.
 *
 * `undici` yerine `node:https` seçildi: projede doğrudan bağımlılık değil ve
 * `Agent`/`connect` API'si sürümle değişir. `lookup` kancası stabil bir sözleşmedir.
 *
 * **Fail-closed:** sabitlenecek public IP yoksa istek atılmaz.
 */

export type PinnedTarget = { address: string; family: 4 | 6; hostname: string };

/** IPv4 öncelikli; yoksa IPv6. Hiçbiri yoksa `null` (istek atılmaz). */
export function pickPinnedAddress(
  target: PinnedFetchTarget,
): { address: string; family: 4 | 6 } | null {
  const v4 = target.addresses.find((address) => isIP(address) === 4);
  if (v4) {
    return { address: v4, family: 4 };
  }
  const v6 = target.addresses.find((address) => isIP(address) === 6);
  if (v6) {
    return { address: v6, family: 6 };
  }
  return null;
}

export const createPinnedTarget: PinnedDispatcherFactory = (target) => {
  const picked = pickPinnedAddress(target);
  if (!picked) {
    return null;
  }
  const pinned: PinnedTarget = {
    address: picked.address,
    family: picked.family,
    hostname: target.url.hostname,
  };
  return pinned;
};

export function isPinnedTarget(value: unknown): value is PinnedTarget {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as Partial<PinnedTarget>;
  return (
    typeof row.address === "string" &&
    isIP(row.address) !== 0 &&
    (row.family === 4 || row.family === 6) &&
    typeof row.hostname === "string"
  );
}

/**
 * `node:https` `lookup` kancası — sabit IP döndürür.
 * Dışa açıktır ki test, doğrulamanın **tek** DNS sorgusu olduğunu kanıtlayabilsin.
 */
export function pinnedLookup(pinned: PinnedTarget) {
  return (
    hostname: string,
    options: { all?: boolean } | number | undefined,
    callback: (
      error: NodeJS.ErrnoException | null,
      address: string | Array<{ address: string; family: number }>,
      family?: number,
    ) => void,
  ): void => {
    if (hostname !== pinned.hostname) {
      callback(Object.assign(new Error("pinned_lookup_host_mismatch"), { code: "ENOTFOUND" }), []);
      return;
    }
    const wantsAll = typeof options === "object" && options !== null && options.all === true;
    if (wantsAll) {
      callback(null, [{ address: pinned.address, family: pinned.family }]);
      return;
    }
    callback(null, pinned.address, pinned.family);
  };
}

export type PinnedFetchInit = {
  method?: string;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** `createPinnedTarget` çıktısı. `null`/eksikse fail-closed. */
  dispatcher?: unknown;
};

/**
 * Sabitlenmiş IP ile tek HTTPS isteği. Yönlendirme **takip edilmez**
 * (`redirect: "manual"` sözleşmesi); gövde akışı canlı kalır ki çağıran
 * boyut tavanını uygulayabilsin.
 */
export async function fetchViaPinnedHttps(
  url: string,
  init: PinnedFetchInit = {},
): Promise<Response> {
  const pinned = init.dispatcher;
  if (!isPinnedTarget(pinned)) {
    // Sabitlenecek doğrulanmış IP yok — bağlantı açılmaz.
    throw new Error("pinned_dispatch_required");
  }
  const target = new URL(url);
  if (target.protocol !== "https:") {
    throw new Error("pinned_dispatch_https_only");
  }
  return new Promise<Response>((resolve, reject) => {
    const request = httpsRequest(
      {
        protocol: "https:",
        host: target.hostname,
        port: target.port || 443,
        path: `${target.pathname}${target.search}`,
        method: init.method ?? "GET",
        headers: init.headers,
        servername: target.hostname,
        // DNS ikinci kez çözülmez: doğrulanmış IP sabittir.
        lookup: pinnedLookup(pinned),
        signal: init.signal,
      },
      (incoming) => {
        const headers = new Headers();
        for (const [key, value] of Object.entries(incoming.headers)) {
          if (value === undefined) {
            continue;
          }
          headers.set(key, Array.isArray(value) ? value.join(", ") : String(value));
        }
        const body =
          incoming.statusCode === 204 || incoming.statusCode === 304
            ? null
            : (Readable.toWeb(incoming) as ReadableStream<Uint8Array>);
        resolve(
          new Response(body, {
            status: incoming.statusCode ?? 502,
            statusText: incoming.statusMessage,
            headers,
          }),
        );
      },
    );
    request.on("error", reject);
    request.end();
  });
}
