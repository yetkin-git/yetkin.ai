export const ACADEMY_CATALOG_VIEW_STORAGE_KEY = "yetkin.academy.catalogView.v1" as const;

export type AcademyCatalogViewMode = "grid" | "list";

export const ACADEMY_CATALOG_DEFAULT_VIEW: AcademyCatalogViewMode = "grid";

export function parseAcademyCatalogViewMode(
  raw: string | null | undefined,
): AcademyCatalogViewMode {
  return raw === "list" ? "list" : "grid";
}

function readRawFromStorage(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(ACADEMY_CATALOG_VIEW_STORAGE_KEY);
  } catch {
    return null;
  }
}

const listeners = new Set<() => void>();
let windowBound = false;
let sessionView: AcademyCatalogViewMode | null = null;

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function onStorage(event: StorageEvent): void {
  if (event.key !== ACADEMY_CATALOG_VIEW_STORAGE_KEY && event.key !== null) {
    return;
  }
  sessionView = parseAcademyCatalogViewMode(
    event.key === null ? readRawFromStorage() : event.newValue,
  );
  emit();
}

/** useSyncExternalStore — localStorage aynı sekmede persist + çapraz sekme. */
export function subscribeAcademyCatalogView(onStoreChange: () => void): () => void {
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

export function getAcademyCatalogViewClientSnapshot(): AcademyCatalogViewMode {
  return sessionView ?? parseAcademyCatalogViewMode(readRawFromStorage());
}

export function getAcademyCatalogViewServerSnapshot(): AcademyCatalogViewMode {
  return ACADEMY_CATALOG_DEFAULT_VIEW;
}

export function writeAcademyCatalogViewToStorage(view: AcademyCatalogViewMode): void {
  const next = parseAcademyCatalogViewMode(view);
  sessionView = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(ACADEMY_CATALOG_VIEW_STORAGE_KEY, next);
    } catch {
      /* kota / gizli tarama — tercih oturumda kalır */
    }
  }
  emit();
}
