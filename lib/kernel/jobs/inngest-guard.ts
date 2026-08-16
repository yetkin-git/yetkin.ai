/**
 * Üretimde boş INNGEST_SIGNING_KEY veya INNGEST_EVENT_KEY = serve() açılmaz (fail-closed).
 * `/api/jobs/inngest` GET/POST/PUT 503 döner; sahte event handler'a inmez.
 * INNGEST_DEV üretimde bypass etmez. Sahte/doğrulanmamış event kabul edilmez.
 * Geliştirmede Cloud yoksa INNGEST_DEV=1 olmadan serve() çağrılmaz (SDK 500 dumanı yok).
 */

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
