import "server-only";

import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";

const BLOCK = new BlockList();

for (const [network, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const) {
  BLOCK.addSubnet(network, prefix, "ipv4");
}
BLOCK.addAddress("255.255.255.255", "ipv4");

for (const [network, prefix] of [
  ["::", 128],
  ["::1", 128],
  ["fc00::", 7],
  ["fe80::", 10],
  ["fec0::", 10],
  ["ff00::", 8],
] as const) {
  BLOCK.addSubnet(network, prefix, "ipv6");
}

export type TetkikLookup = (hostname: string) => Promise<readonly string[]>;

export type TetkikUrlReason = "scheme" | "credentials" | "port" | "host" | "private";

export type TetkikUrlInspection =
  | { ok: true; url: URL }
  | { ok: false; reason: TetkikUrlReason };

export class TetkikAccessError extends Error {
  readonly kind: "rejected" | "unreadable";

  constructor(kind: "rejected" | "unreadable") {
    super(kind);
    this.name = "TetkikAccessError";
    this.kind = kind;
  }
}

/** Şekil normalizasyonu. Kare parantez, sonda nokta ve zone kimliği düşer. */
export function normalizeHostForPin(hostname: string): string {
  return normalizeHost(hostname);
}

function normalizeHost(hostname: string): string {
  let host = hostname.trim().toLowerCase();
  if (host.endsWith(".")) {
    host = host.slice(0, -1);
  }
  if (host.startsWith("[") && host.endsWith("]")) {
    host = host.slice(1, -1);
  }
  const zone = host.indexOf("%");
  if (zone >= 0) {
    host = host.slice(0, zone);
  }
  return host;
}

function ipv4FromMapped(host: string): string | null {
  const dotted = host.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i);
  if (dotted?.[1]) {
    return dotted[1];
  }
  const hex = host.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i);
  if (!hex?.[1] || !hex[2]) {
    return null;
  }
  const hi = Number.parseInt(hex[1], 16);
  const lo = Number.parseInt(hex[2], 16);
  if (hi > 0xffff || lo > 0xffff) {
    return null;
  }
  return [(hi >> 8) & 255, hi & 255, (lo >> 8) & 255, lo & 255].join(".");
}

export function isBlockedTetkikIp(address: string): boolean {
  const host = normalizeHost(address);
  const kind = isIP(host);
  if (kind === 4) {
    return BLOCK.check(host, "ipv4");
  }
  if (kind === 6) {
    if (BLOCK.check(host, "ipv6")) {
      return true;
    }
    const mapped = ipv4FromMapped(host);
    return mapped ? BLOCK.check(mapped, "ipv4") : false;
  }
  return false;
}

function blockedHostname(host: string): boolean {
  if (!host || host.includes("%")) {
    return true;
  }
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".localdomain") ||
    host === "metadata.google.internal" ||
    host === "metadata.google.com"
  ) {
    return true;
  }
  if (!host.includes(".")) {
    return true;
  }
  return false;
}

/** Şekil ve özel adres. DNS bu adımda yoktur; yönlendirmeden önce de çağrılır. */
export function inspectTetkikUrl(raw: string): TetkikUrlInspection {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return { ok: false, reason: "scheme" };
  }
  if (url.protocol !== "https:") {
    return { ok: false, reason: "scheme" };
  }
  if (url.username || url.password) {
    return { ok: false, reason: "credentials" };
  }
  if (url.port !== "" && url.port !== "443") {
    return { ok: false, reason: "port" };
  }
  const host = normalizeHost(url.hostname);
  if (!host) {
    return { ok: false, reason: "host" };
  }
  if (isIP(host) !== 0) {
    return isBlockedTetkikIp(host) ? { ok: false, reason: "private" } : { ok: true, url };
  }
  if (blockedHostname(host)) {
    return { ok: false, reason: "host" };
  }
  return { ok: true, url };
}

export async function defaultTetkikLookup(hostname: string): Promise<string[]> {
  const rows = await lookup(hostname, { all: true, verbatim: true });
  return rows.map((row) => row.address);
}

export async function resolveTetkikHost(
  hostname: string,
  resolve: TetkikLookup = defaultTetkikLookup,
): Promise<"public" | "private" | "dns"> {
  const host = normalizeHost(hostname);
  if (isIP(host) !== 0) {
    return isBlockedTetkikIp(host) ? "private" : "public";
  }
  try {
    const addresses = await resolve(host);
    if (addresses.length === 0) {
      return "dns";
    }
    if (addresses.some((address) => isBlockedTetkikIp(address))) {
      return "private";
    }
    return "public";
  } catch {
    return "dns";
  }
}

/**
 * SSRF IP pinleme — DNS TOCTOU penceresini kapatır.
 *
 * **Sorun:** `resolveTetkikHost` bir `lookup` yapar, `fetch` ise adresi **ikinci kez**
 * çözer. Aradaki pencerede DNS rebinding ile public görünen ad, fetch anında özel
 * ağa dönebilir; `inspectTetkikUrl` yalnız adı görür, IP'yi görmez.
 *
 * **Tedavi:** Doğrulanan IP `fetch`'e **sabitlenir** (`dispatcher` / `Agent`
 * `lookup` kancası). Böylece doğrulama ile bağlantı **aynı** IP üzerinde koşar.
 *
 * Bu modül sunucu-only'dir. `node:http`/`node:https` Agent'ı yerine `undici`
 * dispatcher'ı enjekte edilebilir tutulur: test ortamında sahte dispatcher
 * verilebilir, üretimde `createPinnedDispatcher` kullanılır.
 *
 * Fail-closed: dispatcher kurulamazsa istek **atılmaz**; `TetkikAccessError("rejected")`.
 */
export type PinnedFetchTarget = {
  /** Doğrulanmış, özel ağda olmayan IP'ler. En az bir tane olmalı. */
  addresses: readonly string[];
  /** İsteğin hedefi. SNI/Host başlığı bu adresten gelir, IP sabittir. */
  url: URL;
};

/**
 * Dispatcher üreticisi. `fetch` implementasyonu `dispatcher` alanını desteklemiyorsa
 * çağıran `null` döner ve istek atılmaz — DNS yeniden çözülmesine izin verilmez.
 */
export type PinnedDispatcherFactory = (target: PinnedFetchTarget) => unknown | null;

/**
 * Doğrulanmış adresleri süzer: hepsi public olmalı, en az bir tane kalmalı.
 * Karışık yanıt (bir public + bir özel) zaten `resolveTetkikHost` tarafından
 * reddedilir; burada savunma derinliği için tekrar süzülür.
 */
export function pinnableTetkikAddresses(addresses: readonly string[]): string[] {
  const publicAddresses = addresses
    .map((address) => normalizeHost(address))
    .filter((address) => isIP(address) !== 0 && !isBlockedTetkikIp(address));
  return [...new Set(publicAddresses)];
}
