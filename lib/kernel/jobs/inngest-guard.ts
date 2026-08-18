/**
 * Üretimde boş INNGEST_SIGNING_KEY veya INNGEST_EVENT_KEY = serve() açılmaz (fail-closed).
 * `/api/jobs/inngest` GET/POST/PUT 503 döner; sahte event handler'a inmez.
 * INNGEST_DEV üretimde bypass etmez. Sahte/doğrulanmamış event kabul edilmez.
 * Geliştirmede Cloud yoksa INNGEST_DEV=1 olmadan serve() çağrılmaz (SDK 500 dumanı yok).
 * Cloud veya (üretim dışı) INNGEST_DEV açıkken cron 503'e düşmez.
 */

/** Valör + emanet TTL taramaları — serve açıkken Inngest Cloud bu id'leri kaydeder. */
export const INNGEST_KERNEL_CRON_FUNCTION_IDS = [
  "paytr-clearing-scan",
  "escrow-timeout-scan",
  "escrow-ttl-approaching-scan",
] as const;

export type InngestServeMode = "cloud" | "dev" | "fail-closed";

export function isInngestSigningKeyConfigured(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return Boolean(env.INNGEST_SIGNING_KEY?.trim());
}

export function isInngestEventKeyConfigured(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return Boolean(env.INNGEST_EVENT_KEY?.trim());
}

/** Yerel Inngest Dev. Üretimde her zaman false. */
export function isInngestDevEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  if (env.NODE_ENV === "production") {
    return false;
  }
  const value = env.INNGEST_DEV?.trim() ?? "";
  if (!value) {
    return false;
  }
  if (value === "1" || value.toLowerCase() === "true") {
    return true;
  }
  return /^https?:\/\//i.test(value);
}

export function shouldFailClosedInngestServe(
  env: Record<string, string | undefined> = process.env,
): boolean {
  if (env.NODE_ENV !== "production") {
    return false;
  }
  return !isInngestSigningKeyConfigured(env) || !isInngestEventKeyConfigured(env);
}

/**
 * serve() ancak Cloud çift anahtar veya (üretim dışı) INNGEST_DEV ile açılır.
 * Aksi halde SDK "cloud mode but no signing key" 500 üretmez; 503 dürüst kalır.
 */
export function canInvokeInngestServe(
  env: Record<string, string | undefined> = process.env,
): boolean {
  if (shouldFailClosedInngestServe(env)) {
    return false;
  }
  if (isInngestSigningKeyConfigured(env) && isInngestEventKeyConfigured(env)) {
    return true;
  }
  return isInngestDevEnabled(env);
}

export function resolveInngestServeMode(
  env: Record<string, string | undefined> = process.env,
): InngestServeMode {
  if (!canInvokeInngestServe(env)) {
    return "fail-closed";
  }
  if (isInngestSigningKeyConfigured(env) && isInngestEventKeyConfigured(env)) {
    return "cloud";
  }
  return "dev";
}

export const INNGEST_CRON_SERVE_NOT_READY =
  "Inngest serve fail-closed (503). Valör ve emanet TTL durur. INNGEST_EVENT_KEY + INNGEST_SIGNING_KEY veya (üretim dışı) INNGEST_DEV=1 gerekir.";

/** Cloud veya yerel duman hazırsa mod döner; 503 modunda throw. */
export function assertInngestCronServeReady(
  env: Record<string, string | undefined> = process.env,
): Exclude<InngestServeMode, "fail-closed"> {
  const mode = resolveInngestServeMode(env);
  if (mode === "fail-closed") {
    throw new Error(INNGEST_CRON_SERVE_NOT_READY);
  }
  return mode;
}
