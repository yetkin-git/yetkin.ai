import "server-only";

import { isIP } from "node:net";
import {
  defaultTetkikLookup,
  inspectTetkikUrl,
  normalizeHostForPin,
  pinnableTetkikAddresses,
  resolveTetkikHost,
  type PinnedDispatcherFactory,
  type TetkikLookup,
} from "@/lib/tezgah/tetkik/guard";
import { createPinnedTarget, fetchViaPinnedHttps } from "@/lib/tezgah/tetkik/pinned-dispatcher";
import { TETKIK_TIMEOUT_MS, TETKIK_USER_AGENT } from "@/lib/tezgah/tetkik/rubric";
import type { TetkikTechSeoSignal, TetkikTechSeoStatus } from "@/lib/tezgah/tetkik/types";

/** robots.txt / sitemap.xml gövdesi için 256 KB tavan. */
const TECH_SEO_MAX_BYTES = 256 * 1024;

export type TechSeoProbeDeps = {
  fetch?: typeof fetch;
  lookup?: TetkikLookup;
  timeoutMs?: number;
  pinnedDispatcher?: PinnedDispatcherFactory;
};

export type TechSeoProbe = {
  status: TetkikTechSeoStatus;
  detail: string;
};

function isRedirect(status: number): boolean {
  return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
}

function unchecked(detail: string): TechSeoProbe {
  return { status: "unchecked", detail };
}

function missing(detail: string): TechSeoProbe {
  return { status: "missing", detail };
}

function found(detail: string): TechSeoProbe {
  return { status: "found", detail };
}

/**
 * SSRF-pinlenmiş GET. Ana analizi bloklamaz: hata/zaman aşımında `unchecked`.
 * Yalnız kök dizindeki `/robots.txt` ve `/sitemap.xml` için.
 */
async function probeRootFile(
  origin: URL,
  path: "/robots.txt" | "/sitemap.xml",
  deps: TechSeoProbeDeps,
): Promise<TechSeoProbe> {
  let target: URL;
  try {
    target = new URL(path, origin);
  } catch {
    return unchecked("Adres çözülemedi.");
  }
  const inspected = inspectTetkikUrl(target.href);
  if (!inspected.ok) {
    return unchecked("Adres güvenlik kapısından geçmedi.");
  }
  const current = inspected.url;
  const lookup = deps.lookup ?? defaultTetkikLookup;
  const timeoutMs = Math.min(deps.timeoutMs ?? TETKIK_TIMEOUT_MS, 4_000);
  const buildPinned = deps.pinnedDispatcher ?? (deps.fetch ? null : createPinnedTarget);

  try {
    const literal = isIP(normalizeHostForPin(current.hostname)) !== 0;
    const addresses = literal
      ? [normalizeHostForPin(current.hostname)]
      : await lookup(current.hostname).catch(() => [] as string[]);
    const host = await resolveTetkikHost(current.hostname, async () => addresses);
    if (host === "private") {
      return unchecked("Özel ağ adresi reddedildi.");
    }
    if (host === "dns") {
      return unchecked("DNS çözülemedi.");
    }
    const pinned = pinnableTetkikAddresses(addresses);
    if (pinned.length === 0) {
      return unchecked("Sabitlenebilir IP yok.");
    }
    const dispatcher = buildPinned?.({ addresses: pinned, url: current }) ?? null;
    if (buildPinned && dispatcher == null) {
      return unchecked("Pinleme kurulamadı.");
    }

    const requestInit = {
      method: "GET",
      redirect: "manual",
      cache: "no-store",
      headers: {
        accept: "text/plain,text/*,application/xml,application/xhtml+xml;q=0.8,*/*;q=0.1",
        "accept-language": "tr",
        "user-agent": TETKIK_USER_AGENT,
      },
      signal: AbortSignal.timeout(timeoutMs),
    } as const;

    const response = deps.fetch
      ? await deps.fetch(current.href, requestInit)
      : await fetchViaPinnedHttps(current.href, { ...requestInit, dispatcher });

    if (isRedirect(response.status)) {
      await response.body?.cancel().catch(() => undefined);
      return missing(`${path} yönlendirme döndü (erişilebilir kök dosya yok).`);
    }
    if (response.status === 404 || response.status === 410) {
      await response.body?.cancel().catch(() => undefined);
      return missing(`${path} bulunamadı (${response.status}).`);
    }
    if (response.status < 200 || response.status >= 300) {
      await response.body?.cancel().catch(() => undefined);
      return unchecked(`${path} HTTP ${response.status}.`);
    }

    const declared = Number(response.headers.get("content-length"));
    if (Number.isFinite(declared) && declared > TECH_SEO_MAX_BYTES) {
      await response.body?.cancel().catch(() => undefined);
      return found(`${path} erişilebilir (gövde tavan üstü; varlık doğrulandı).`);
    }

    const buffer = new Uint8Array(await response.arrayBuffer());
    if (buffer.byteLength === 0) {
      return missing(`${path} boş gövde.`);
    }
    if (buffer.byteLength > TECH_SEO_MAX_BYTES) {
      return found(`${path} erişilebilir (${TECH_SEO_MAX_BYTES}+ bayt).`);
    }
    return found(`${path} erişilebilir (${buffer.byteLength} bayt).`);
  } catch {
    return unchecked(`${path} okunamadı; ana skor etkilenmedi.`);
  }
}

/** Ana skoru etkilemez. Hata durumunda unchecked fallback. */
export async function probeTechSeoFiles(
  homepageUrl: string | URL,
  deps: TechSeoProbeDeps = {},
): Promise<{ robotsTxt: TechSeoProbe; sitemapXml: TechSeoProbe }> {
  let origin: URL;
  try {
    origin = typeof homepageUrl === "string" ? new URL(homepageUrl) : new URL(homepageUrl.href);
    origin.hash = "";
    origin.search = "";
  } catch {
    return {
      robotsTxt: unchecked("Kök adres çözülemedi."),
      sitemapXml: unchecked("Kök adres çözülemedi."),
    };
  }
  const [robotsTxt, sitemapXml] = await Promise.all([
    probeRootFile(origin, "/robots.txt", deps),
    probeRootFile(origin, "/sitemap.xml", deps),
  ]);
  return { robotsTxt, sitemapXml };
}

export function techSeoSignalsFromProbes(probes: {
  robotsTxt: TechSeoProbe;
  sitemapXml: TechSeoProbe;
}): TetkikTechSeoSignal[] {
  return [
    {
      id: "robotsTxt",
      label: "robots.txt",
      status: probes.robotsTxt.status,
      detail: probes.robotsTxt.detail,
    },
    {
      id: "sitemapXml",
      label: "sitemap.xml",
      status: probes.sitemapXml.status,
      detail: probes.sitemapXml.detail,
    },
  ];
}

export function uncheckedTechSeoSignals(detail = "Kontrol edilmedi."): TetkikTechSeoSignal[] {
  return techSeoSignalsFromProbes({
    robotsTxt: unchecked(detail),
    sitemapXml: unchecked(detail),
  });
}
