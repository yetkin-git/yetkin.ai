/**
 * Studio Storage CORS sözleşmesi.
 * Canlı betik `archived/` import etmez. Donmuş oda testi kendi kopyasını arşivde tutar.
 */

export const STUDIO_STORAGE_BUCKET = "studio-assets" as const;
export const STUDIO_STORAGE_CORS_WILDCARD_ORIGIN = "*";
export const STUDIO_STORAGE_CORS_FOREIGN_PROBE_ORIGIN = "https://evil.example" as const;

export function studioStorageCorsOrigin(appUrl: string): string {
  return new URL(appUrl.trim()).origin;
}

export function parseCorsAllowMethods(header: string | null | undefined): string[] {
  return (header ?? "")
    .split(",")
    .map((token) => token.trim().toUpperCase())
    .filter((token) => token.length > 0);
}

export function assertStudioStorageCorsHeaders(
  headers: {
    allowOrigin: string | null | undefined;
    allowMethods: string | null | undefined;
  },
  appUrl: string,
): { origin: string; methods: string[] } {
  const origin = studioStorageCorsOrigin(appUrl);
  const allowOrigin = (headers.allowOrigin ?? "").trim();
  if (!allowOrigin || allowOrigin === STUDIO_STORAGE_CORS_WILDCARD_ORIGIN) {
    throw new Error(
      "Storage CORS joker origin (*) yasak. Dashboard yalnız NEXT_PUBLIC_APP_URL origin PUT.",
    );
  }
  if (allowOrigin !== origin) {
    throw new Error(
      `Storage CORS origin ${allowOrigin} ≠ ${origin}. Yalnız NEXT_PUBLIC_APP_URL origin.`,
    );
  }
  const methods = parseCorsAllowMethods(headers.allowMethods);
  const extra = methods.filter((method) => method !== "PUT" && method !== "OPTIONS");
  if (!methods.includes("PUT") || extra.length > 0) {
    throw new Error(
      "Storage CORS metodu yalnız PUT (preflight OPTIONS). GET/DELETE/POST/PATCH yasak.",
    );
  }
  return { origin, methods };
}

export function assertStudioStorageCorsRejectsForeignOrigin(
  headers: { allowOrigin: string | null | undefined },
  foreignOrigin: string = STUDIO_STORAGE_CORS_FOREIGN_PROBE_ORIGIN,
): void {
  const allowOrigin = (headers.allowOrigin ?? "").trim();
  if (!allowOrigin) {
    return;
  }
  if (allowOrigin === STUDIO_STORAGE_CORS_WILDCARD_ORIGIN) {
    throw new Error(
      "Storage CORS yetkisiz köke açık: joker origin (*). Dashboard yalnız Rail origin PUT.",
    );
  }
  if (allowOrigin === foreignOrigin.trim()) {
    throw new Error(
      `Storage CORS yetkisiz kökü yansıtır (${foreignOrigin}). Yabancı origin kapatılmalı.`,
    );
  }
}
