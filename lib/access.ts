/**
 * Junior görünürlük kapısı.
 * Menü, sayfa, API ve site haritası bu fonksiyonu okur.
 * `JUNIOR_ALLOWED_EMAILS` doluysa o liste geçerlidir; boşsa iki yerleşik kutu.
 */

export const JUNIOR_ALLOWED_EMAILS = [
  "yapinet360@gmail.com",
  "ustaders.proje@gmail.com",
] as const;

/** Akademi katalog sorgusu bu önekli slug'ı satırda bırakmaz. */
export const JUNIOR_CATALOG_SLUG_PREFIX = "jr_" as const;

export const ACADEMY_QUERY_OMITS_JUNIOR = {
  NOT: { slug: { startsWith: JUNIOR_CATALOG_SLUG_PREFIX } },
} as const;

function emailsFromEnv(raw: string | undefined): string[] {
  if (!raw?.trim()) {
    return [];
  }
  return raw
    .split(/[,;\s]+/)
    .map((item) => item.toLowerCase().trim())
    .filter((item) => item.length > 0);
}

export function resolveJuniorAllowedEmails(
  env: NodeJS.ProcessEnv = process.env,
): readonly string[] {
  const fromEnv = emailsFromEnv(env.JUNIOR_ALLOWED_EMAILS);
  return fromEnv.length > 0 ? fromEnv : JUNIOR_ALLOWED_EMAILS;
}

export function canAccessJunior(
  email?: string | null,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (!email) {
    return false;
  }
  const normalized = email.toLowerCase().trim();
  if (!normalized) {
    return false;
  }
  return resolveJuniorAllowedEmails(env).includes(normalized);
}

export function isJuniorCatalogSlug(slug: string): boolean {
  return slug.toLowerCase().trim().startsWith(JUNIOR_CATALOG_SLUG_PREFIX);
}
