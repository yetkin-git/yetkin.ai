/**
 * Tetkik adresi. İstemci düğmesi ve sunucu aynı biçimi okur.
 * Yalın alan adı https yapılır. DNS ve özel ağ kararı sunucudadır.
 */

const LOOPBACK_HOST =
  /^(localhost|.*\.localhost|.*\.local|.*\.internal|.*\.localdomain|metadata\.google\.internal|metadata\.google\.com)$/i;

function isIpv4(host: string): boolean {
  const parts = host.split(".");
  if (parts.length !== 4) {
    return false;
  }
  return parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}

function isPrivateIpv4(host: string): boolean {
  const [a = 0, b = 0] = host.split(".").map(Number);
  if (a === 0 || a === 10 || a === 127) {
    return true;
  }
  if (a === 169 && b === 254) {
    return true;
  }
  if (a === 172 && b >= 16 && b <= 31) {
    return true;
  }
  if (a === 192 && (b === 168 || b === 0)) {
    return true;
  }
  if (a === 100 && b >= 64 && b <= 127) {
    return true;
  }
  if (a === 198 && (b === 18 || b === 19)) {
    return true;
  }
  return a >= 224;
}

function isPublicHost(host: string): boolean {
  const name = host.replace(/\.$/, "").toLowerCase();
  if (!name || name.length > 253 || name.includes("%") || LOOPBACK_HOST.test(name)) {
    return false;
  }
  if (name.includes(":")) {
    return name !== "::" && name !== "::1" && !name.startsWith("fe80:") && !name.startsWith("fc") && !name.startsWith("fd") && !name.startsWith("ff");
  }
  if (isIpv4(name)) {
    return !isPrivateIpv4(name);
  }
  const labels = name.split(".");
  if (labels.length < 2) {
    return false;
  }
  const tld = labels[labels.length - 1] ?? "";
  if (tld.length < 2) {
    return false;
  }
  return labels.every((label) => {
    if (!label || label.length > 63 || label.startsWith("-") || label.endsWith("-")) {
      return false;
    }
    return /^[\p{L}\p{N}-]+$/u.test(label);
  });
}

/** Geçerli https adresi veya alan adı. Uygun değilse `null`. */
export function normalizeTetkikSiteAddress(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 300 || /[\s\u0000-\u001f\u007f]/.test(trimmed)) {
    return null;
  }
  let candidate = trimmed;
  if (/^http:\/\//i.test(trimmed)) {
    candidate = `https://${trimmed.slice(7)}`;
  } else if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    candidate = `https://${trimmed}`;
  } else if (!/^https:\/\//i.test(trimmed)) {
    return null;
  }
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password) {
    return null;
  }
  if (url.port !== "" && url.port !== "443") {
    return null;
  }
  if (!isPublicHost(url.hostname)) {
    return null;
  }
  return url.toString();
}

/** Global ücretsiz tetkik kilidi anahtarı. `www.` ve sondaki nokta düşer; küçük harf. */
export function tetkikHostKey(rawUrl: string): string | null {
  const normalized = normalizeTetkikSiteAddress(rawUrl) ?? rawUrl.trim();
  if (!normalized) {
    return null;
  }
  try {
    const host = new URL(normalized.startsWith("http") ? normalized : `https://${normalized}`).hostname;
    const key = host.replace(/\.$/, "").replace(/^www\./i, "").toLowerCase();
    return key.length >= 1 && key.length <= 253 ? key : null;
  } catch {
    return null;
  }
}
