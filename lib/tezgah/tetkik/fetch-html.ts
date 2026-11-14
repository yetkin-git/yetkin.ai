import "server-only";

import {
  TETKIK_MAX_HTML_BYTES,
  TETKIK_MAX_REDIRECTS,
  TETKIK_TIMEOUT_MS,
  TETKIK_USER_AGENT,
} from "@/lib/tezgah/tetkik/rubric";
import {
  defaultTetkikLookup,
  inspectTetkikUrl,
  resolveTetkikHost,
  TetkikAccessError,
  type TetkikLookup,
} from "@/lib/tezgah/tetkik/guard";

export type TetkikFetchedPage = {
  finalUrl: string;
  html: string;
  htmlBytes: number;
  ttfbMs: number;
};

export type FetchPublicHomepageDeps = {
  fetch?: typeof fetch;
  lookup?: TetkikLookup;
  clock?: () => number;
  timeoutMs?: number;
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
 */
export async function fetchPublicHomepage(
  target: URL,
  deps: FetchPublicHomepageDeps = {},
): Promise<TetkikFetchedPage> {
  const fetchImpl = deps.fetch ?? fetch;
  const lookup = deps.lookup ?? defaultTetkikLookup;
  const clock = deps.clock ?? Date.now;
  const timeoutMs = deps.timeoutMs ?? TETKIK_TIMEOUT_MS;
  const deadline = AbortSignal.timeout(timeoutMs);
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
    const host = await resolveTetkikHost(current.hostname, lookup);
    if (host === "private") {
      throw new TetkikAccessError("rejected");
    }
    if (host === "dns") {
      throw new TetkikAccessError("unreadable");
    }

    const started = clock();
    let response: Response;
    try {
      response = await fetchImpl(current.href, {
        method: "GET",
        redirect: "manual",
        cache: "no-store",
        headers: {
          accept: "text/html,application/xhtml+xml;q=0.9",
          "accept-language": "tr",
          "user-agent": TETKIK_USER_AGENT,
        },
        signal: deadline,
      });
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
