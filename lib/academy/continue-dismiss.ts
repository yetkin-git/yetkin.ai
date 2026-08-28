/**
 * Katalog devam şeridi — vatandaş gizlerse cihazında kalır; sunucuya yazılmaz.
 */

export const ACADEMY_CONTINUE_DISMISS_STORAGE_KEY =
  "yetkin.academy.continueDismissed.v1" as const;

const EMPTY_ARRAY: string[] = [];

function readRawFromStorage(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(ACADEMY_CONTINUE_DISMISS_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function parseAcademyContinueDismissed(raw: string | null | undefined): string[] {
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
let sessionDismissed: string[] | null = null;
let cachedRaw: string | null | undefined = undefined;
let cachedDismissed: string[] = EMPTY_ARRAY;

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function onStorage(event: StorageEvent): void {
  if (event.key !== ACADEMY_CONTINUE_DISMISS_STORAGE_KEY && event.key !== null) {
    return;
  }
  const raw = event.key === null ? readRawFromStorage() : event.newValue;
  sessionDismissed = parseAcademyContinueDismissed(raw);
  cachedRaw = raw;
  cachedDismissed = sessionDismissed;
  emit();
}

function persist(slugs: string[]): void {
  sessionDismissed = slugs;
  const raw = JSON.stringify(slugs);
  cachedRaw = raw;
  cachedDismissed = slugs.length === 0 ? EMPTY_ARRAY : slugs;
  if (typeof window === "undefined") {
    emit();
    return;
  }
  try {
    window.localStorage.setItem(ACADEMY_CONTINUE_DISMISS_STORAGE_KEY, raw);
  } catch {
    /* kota / gizli tarama — tercih oturumda kalır */
  }
  emit();
}

export function subscribeAcademyContinueDismiss(onStoreChange: () => void): () => void {
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

export function getAcademyContinueDismissClientSnapshot(): string[] {
  if (sessionDismissed !== null) {
    return sessionDismissed;
  }
  const raw = readRawFromStorage();
  if (raw === cachedRaw) {
    return cachedDismissed;
  }
  cachedRaw = raw;
  cachedDismissed = parseAcademyContinueDismissed(raw);
  return cachedDismissed;
}

export function getAcademyContinueDismissServerSnapshot(): string[] {
  return EMPTY_ARRAY;
}

export function isAcademyContinueDismissed(slug: string, dismissed: readonly string[]): boolean {
  return dismissed.includes(slug.trim());
}

export function dismissAcademyContinue(slug: string): string[] {
  const trimmed = slug.trim();
  if (!trimmed) {
    return getAcademyContinueDismissClientSnapshot();
  }
  const current = getAcademyContinueDismissClientSnapshot();
  if (current.includes(trimmed)) {
    return current;
  }
  const next = [...current, trimmed];
  persist(next);
  return next;
}
