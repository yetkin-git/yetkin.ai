/**
 * Akademi favori sicili — localStorage + oturum belleği.
 * Sunucu hesabına yazılmaz; vatandaş cihazında kalır.
 */

export const ACADEMY_CATALOG_FAVORITES_STORAGE_KEY =
  "yetkin.academy.catalogFavorites.v1" as const;

const EMPTY_ARRAY: string[] = [];

function readRawFromStorage(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(ACADEMY_CATALOG_FAVORITES_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function parseAcademyCatalogFavorites(raw: string | null | undefined): string[] {
  if (!raw) {
    return EMPTY_ARRAY;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return EMPTY_ARRAY;
    }
    const slugs = parsed
      .filter((row): row is string => typeof row === "string" && row.trim().length > 0)
      .map((row) => row.trim());
    const unique = [...new Set(slugs)];
    return unique.length === 0 ? EMPTY_ARRAY : unique;
  } catch {
    return EMPTY_ARRAY;
  }
}

const listeners = new Set<() => void>();
let windowBound = false;
let sessionFavorites: string[] | null = null;
/** localStorage ham metni değişmedikçe aynı dizi referansı (useSyncExternalStore). */
let cachedRaw: string | null | undefined = undefined;
let cachedFavorites: string[] = EMPTY_ARRAY;

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function onStorage(event: StorageEvent): void {
  if (event.key !== ACADEMY_CATALOG_FAVORITES_STORAGE_KEY && event.key !== null) {
    return;
  }
  const raw = event.key === null ? readRawFromStorage() : event.newValue;
  sessionFavorites = parseAcademyCatalogFavorites(raw);
  cachedRaw = raw;
  cachedFavorites = sessionFavorites;
  emit();
}

function persist(slugs: string[]): void {
  sessionFavorites = slugs;
  const raw = JSON.stringify(slugs);
  cachedRaw = raw;
  cachedFavorites = slugs;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(ACADEMY_CATALOG_FAVORITES_STORAGE_KEY, raw);
    } catch {
      /* kota / gizli tarama — tercih oturumda kalır */
    }
  }
  emit();
}

export function subscribeAcademyCatalogFavorites(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  if (typeof window !== "undefined" && !windowBound) {
    window.addEventListener("storage", onStorage);
    windowBound = true;
  }
  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0 && typeof window !== "undefined" && windowBound) {
      window.removeEventListener("storage", onStorage);
      windowBound = false;
    }
  };
}

export function getAcademyCatalogFavoritesClientSnapshot(): string[] {
  if (sessionFavorites !== null) {
    return sessionFavorites;
  }
  const raw = readRawFromStorage();
  if (raw === cachedRaw) {
    return cachedFavorites;
  }
  cachedRaw = raw;
  cachedFavorites = parseAcademyCatalogFavorites(raw);
  return cachedFavorites;
}

export function getAcademyCatalogFavoritesServerSnapshot(): string[] {
  return EMPTY_ARRAY;
}

export function isAcademyCatalogFavorite(slug: string, favorites: readonly string[]): boolean {
  return favorites.includes(slug);
}

export function toggleAcademyCatalogFavorite(slug: string): string[] {
  const trimmed = slug.trim();
  if (!trimmed) {
    return getAcademyCatalogFavoritesClientSnapshot();
  }
  const current = getAcademyCatalogFavoritesClientSnapshot();
  const next = current.includes(trimmed)
    ? current.filter((row) => row !== trimmed)
    : [...current, trimmed];
  persist(next);
  return next;
}
