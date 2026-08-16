/**
 * Üretimde boş INNGEST_SIGNING_KEY veya INNGEST_EVENT_KEY = serve() açılmaz (fail-closed).
 * `/api/jobs/inngest` GET/POST/PUT 503 döner; sahte event handler'a inmez.
 * INNGEST_DEV üretimde bypass etmez. Sahte/doğrulanmamış event kabul edilmez.
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

export function shouldFailClosedInngestServe(
  env: Record<string, string | undefined> = process.env,
): boolean {
  if (env.NODE_ENV !== "production") {
    return false;
  }
  return !isInngestSigningKeyConfigured(env) || !isInngestEventKeyConfigured(env);
}
