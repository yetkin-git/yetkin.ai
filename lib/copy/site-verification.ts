/**
 * Search Console HTML doğrulaması.
 * Statik sabit boşsa ve ortam da boşsa meta basılmaz (DNS TXT doğrulaması durur).
 * Jeton bu dosyaya yazılmaz.
 */

/** Kaynakta duran yedek. Ortam boşsa bu sabit okunur. Boş sabit meta basmaz. */
export const GOOGLE_SITE_VERIFICATION_STATIC = "" as const;

const VERIFICATION_TOKEN = /^[A-Za-z0-9_-]{20,128}$/u;

export function readGoogleSiteVerification(env: NodeJS.ProcessEnv = process.env): string | null {
  const fromEnv =
    env.GOOGLE_SITE_VERIFICATION?.trim() || env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || "";
  const token = fromEnv || GOOGLE_SITE_VERIFICATION_STATIC;
  if (!VERIFICATION_TOKEN.test(token)) {
    return null;
  }
  return token;
}
