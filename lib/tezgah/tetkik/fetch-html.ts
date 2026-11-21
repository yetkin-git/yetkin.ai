import "server-only";

import { isIP } from "node:net";
import {
  TETKIK_MAX_HTML_BYTES,
  TETKIK_MAX_REDIRECTS,
  TETKIK_TIMEOUT_MS,
  TETKIK_USER_AGENT,
} from "@/lib/tezgah/tetkik/rubric";
import {
  defaultTetkikLookup,
  inspectTetkikUrl,
  normalizeHostForPin,
  pinnableTetkikAddresses,
  resolveTetkikHost,
  TetkikAccessError,
  type PinnedDispatcherFactory,
  type TetkikLookup,
} from "@/lib/tezgah/tetkik/guard";
import { createPinnedTarget, fetchViaPinnedHttps } from "@/lib/tezgah/tetkik/pinned-dispatcher";

export type TetkikFetchedPage = {
  finalUrl: string;
  html: string;
  htmlBytes: number;
  ttfbMs: number;
};

/**
 * `pinnedDispatcher`: doğrulanmış IP → bağlantı sabitleyici. Verilmezse üretim
 * yolu (`createPinnedTarget` + `fetchViaPinnedHttps`) kullanılır. Test kendi
 * `fetch`'ini verirse `fetch` yolu tercih edilir (ağ yok) ama pinleme **yine**
 * uygulanır: doğrulanmış IP yoksa istek atılmaz.
 */
export type FetchPublicHomepageDeps = {
  fetch?: typeof fetch;
  lookup?: TetkikLookup;
  clock?: () => number;
  timeoutMs?: number;
  pinnedDispatcher?: PinnedDispatcherFactory;
};

function isRedirect(status: number): boolean {
  return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
}

function isHtmlContentType(header: string | null): boolean {
  if (!header) {
    return true;
  }
  const mime = header.split(";")[0]?.trim().toLowerCase() ?? "";
  return mime === "text/html" || mime === "application/xhtml+xml";
}

async function readCappedBody(response: Response): Promise<Uint8Array> {
  const declared = Number(response.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > TETKIK_MAX_HTML_BYTES) {
    throw new TetkikAccessError("unreadable");
  }
  const reader = response.body?.getReader();
  if (!reader) {
    const buffer = new Uint8Array(await response.arrayBuffer());
    if (buffer.byteLength > TETKIK_MAX_HTML_BYTES) {
      throw new TetkikAccessError("unreadable");
    }
    return buffer;
  }
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const step = await reader.read();
    if (step.done) {
      break;
    }
    total += step.value.byteLength;
    if (total > TETKIK_MAX_HTML_BYTES) {
      await reader.cancel().catch(() => undefined);
      throw new TetkikAccessError("unreadable");
    }
    chunks.push(step.value);
  }
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return merged;
}

/**
 * Tek https adresi. En fazla 3 yönlendirme. Her sıçramada özel ağ reddedilir.
 * Gövde 1,5 MB'da kesilir. Betik çalıştırılmaz.
 *
 * SSRF IP pinleme: her sıçramada DNS **bir kez** çözülür, sonuç doğrulanır ve
 * `fetch`'e `dispatcher` olarak sabitlenir. Böylece doğrulama ile TCP bağlantısı
 * aynı IP'ye gider; DNS rebinding ile aradaki pencerede özel ağa dönüş yapılamaz.
 */
export async function fetchPublicHomepage(
  target: URL,
  deps: FetchPublicHomepageDeps = {},
): Promise<TetkikFetchedPage> {
  const injectedFetch = deps.fetch;
  const lookup = deps.lookup ?? defaultTetkikLookup;
  const clock = deps.clock ?? Date.now;
  const timeoutMs = deps.timeoutMs ?? TETKIK_TIMEOUT_MS;
  const deadline = AbortSignal.timeout(timeoutMs);
  const buildPinned = deps.pinnedDispatcher ?? (deps.fetch ? null : createPinnedTarget);
  let current = target;
  let followed = 0;
  const seen = new Set<string>();

  while (true) {
    const inspected = inspectTetkikUrl(current.href);
    if (!inspected.ok) {
      throw new TetkikAccessError("rejected");
    }
    current = inspected.url;
    const key = current.href;
    if (seen.has(key)) {
      throw new TetkikAccessError("unreadable");
    }
    seen.add(key);
    // DNS bir kez çözülür; hem doğrulama hem bağlantı bu IP'yi kullanır.
    // IP literali zaten çözülmüş sayılır (DNS sorgusu yapılmaz).
    const literal = isIP(normalizeHostForPin(current.hostname)) !== 0;
    const addresses = literal
      ? [normalizeHostForPin(current.hostname)]
      : await lookup(current.hostname).catch(() => [] as string[]);
    const host = await resolveTetkikHost(current.hostname, async () => addresses);
    if (host === "private") {
      throw new TetkikAccessError("rejected");
    }
    if (host === "dns") {
      throw new TetkikAccessError("unreadable");
    }
    // Sabitlenebilir IP yoksa bağlantı açılmaz (DNS yeniden çözülmesin).
    const pinned = pinnableTetkikAddresses(addresses);
    if (pinned.length === 0) {
      throw new TetkikAccessError("rejected");
    }
    const dispatcher = buildPinned?.({ addresses: pinned, url: current }) ?? null;
    if (buildPinned && dispatcher == null) {
      throw new TetkikAccessError("rejected");
    }

    const started = clock();
    let response: Response;
    const requestInit = {
      method: "GET",
      redirect: "manual",
      cache: "no-store",
      headers: {
        accept: "text/html,application/xhtml+xml;q=0.9",
        "accept-language": "tr",
        "user-agent": TETKIK_USER_AGENT,
      },
      signal: deadline,
    } as const;
    try {
      response = injectedFetch
        ? await injectedFetch(current.href, requestInit)
        : // Üretim yolu: doğrulanmış IP `lookup` kancasına sabitlenir.
          await fetchViaPinnedHttps(current.href, { ...requestInit, dispatcher });
    } catch {
      throw new TetkikAccessError("unreadable");
    }
    const ttfbMs = Math.max(0, clock() - started);

    if (isRedirect(response.status)) {
      await response.body?.cancel().catch(() => undefined);
      followed += 1;
      if (followed > TETKIK_MAX_REDIRECTS) {
        throw new TetkikAccessError("unreadable");
      }
      const location = response.headers.get("location")?.trim() ?? "";
      if (!location || location.length > 2_000) {
        throw new TetkikAccessError("unreadable");
      }
      let next: URL;
      try {
        next = new URL(location, current);
      } catch {
        throw new TetkikAccessError("unreadable");
      }
      current = next;
      continue;
    }

    if (response.status < 200 || response.status >= 300 || !isHtmlContentType(response.headers.get("content-type"))) {
      await response.body?.cancel().catch(() => undefined);
      throw new TetkikAccessError("unreadable");
    }

    const bytes = await readCappedBody(response);
    current.hash = "";
    return {
      finalUrl: current.href,
      html: new TextDecoder("utf-8", { fatal: false }).decode(bytes),
      htmlBytes: bytes.byteLength,
      ttfbMs,
    };
  }
}
