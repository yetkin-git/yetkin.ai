/**
 * Kamu medya adresi.
 * `NEXT_PUBLIC_MEDIA_BASE_URL` doluysa tarayıcı CDN kökünden okur.
 * Boş veya geçersizse yerel `/media/...` yolu kalır.
 * Disk yazan fırın betikleri bu fonksiyonu kullanmaz; onlar göreli yolu yazar.
 */

export function readMediaPublicBaseUrl(raw?: string): string | null {
  const source = raw === undefined ? process.env.NEXT_PUBLIC_MEDIA_BASE_URL : raw;
  const trimmed = source?.trim() ?? "";
  if (!trimmed) {
    return null;
  }
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.username || url.password || url.search || url.hash) {
    return null;
  }
  const path = url.pathname.replace(/\/+$/u, "");
  if (path !== "") {
    return null;
  }
  const localhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.protocol === "https:" || (url.protocol === "http:" && localhost)) {
    return url.origin;
  }
  return null;
}

/**
 * `/media/...` yolunu CDN adresine bağlar.
 * Sorgu (`?v=`) korunur. Taban yoksa gelen yol aynen döner.
 */
export function resolvePublicMediaUrl(publicPath: string): string {
  const hashAt = publicPath.indexOf("#");
  const withoutHash = hashAt === -1 ? publicPath : publicPath.slice(0, hashAt);
  const queryAt = withoutHash.indexOf("?");
  const pathPart = queryAt === -1 ? withoutHash : withoutHash.slice(0, queryAt);
  const query = queryAt === -1 ? "" : withoutHash.slice(queryAt + 1);
  if (!pathPart.startsWith("/media/") || pathPart.includes("..") || pathPart.includes("\\")) {
    throw new Error("Medya yolu /media/ ile başlamalı.");
  }
  const base = readMediaPublicBaseUrl();
  if (!base) {
    return publicPath;
  }
  const hash = hashAt === -1 ? "" : publicPath.slice(hashAt);
  return query ? `${base}${pathPart}?${query}${hash}` : `${base}${pathPart}${hash}`;
}
