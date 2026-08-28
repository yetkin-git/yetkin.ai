export const SIDEBAR_LAYOUT_STORAGE_KEY = "yetkin-rail.shell.sidebar-layout";

export const SIDEBAR_WIDTH_DEFAULT = 288;
export const SIDEBAR_WIDTH_MIN = 220;
export const SIDEBAR_WIDTH_MAX = 420;
export const SIDEBAR_WIDTH_ICON = 76;
export const SIDEBAR_WIDTH_STEP = 16;

export type SidebarLayout = {
  width: number;
  collapsed: boolean;
};

export const DEFAULT_SIDEBAR_LAYOUT: SidebarLayout = {
  width: SIDEBAR_WIDTH_DEFAULT,
  collapsed: false,
};

export function clampSidebarWidth(value: number): number {
  if (!Number.isFinite(value)) {
    return SIDEBAR_WIDTH_DEFAULT;
  }
  return Math.min(SIDEBAR_WIDTH_MAX, Math.max(SIDEBAR_WIDTH_MIN, Math.round(value)));
}

export function normalizeSidebarLayout(layout: SidebarLayout): SidebarLayout {
  return {
    width: clampSidebarWidth(layout.width),
    collapsed: layout.collapsed === true,
  };
}

export function parseStoredSidebarLayout(raw: string | null): SidebarLayout {
  if (!raw) {
    return { ...DEFAULT_SIDEBAR_LAYOUT };
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return { ...DEFAULT_SIDEBAR_LAYOUT };
    }
    const record = parsed as Record<string, unknown>;
    const width =
      typeof record.width === "number" ? clampSidebarWidth(record.width) : SIDEBAR_WIDTH_DEFAULT;
    return {
      width,
      collapsed: record.collapsed === true,
    };
  } catch {
    return { ...DEFAULT_SIDEBAR_LAYOUT };
  }
}

export function resolveSidebarDisplayWidth(layout: SidebarLayout): number {
  return layout.collapsed ? SIDEBAR_WIDTH_ICON : layout.width;
}

/** Simge modundayken sağa çekmek genişletir; açıkken genişlik MIN–MAX arasında sıkışır. */
export function layoutFromDragX(clientX: number, previous: SidebarLayout): SidebarLayout {
  if (!Number.isFinite(clientX)) {
    return previous;
  }
  if (previous.collapsed) {
    if (clientX < SIDEBAR_WIDTH_MIN) {
      return previous;
    }
    return { width: clampSidebarWidth(clientX), collapsed: false };
  }
  return { width: clampSidebarWidth(clientX), collapsed: false };
}

export function nudgeSidebarWidth(layout: SidebarLayout, delta: number): SidebarLayout {
  if (layout.collapsed) {
    if (delta <= 0) {
      return layout;
    }
    return { width: clampSidebarWidth(Math.max(SIDEBAR_WIDTH_MIN, layout.width)), collapsed: false };
  }
  return { width: clampSidebarWidth(layout.width + delta), collapsed: false };
}

function readRawFromStorage(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(SIDEBAR_LAYOUT_STORAGE_KEY);
  } catch {
    return null;
  }
}

const sidebarLayoutListeners = new Set<() => void>();
let sidebarLayoutWindowBound = false;
let sessionLayout: SidebarLayout | null = null;
let clientCache: { key: string; layout: SidebarLayout } | null = null;

function snapshotKey(layout: SidebarLayout): string {
  return `${layout.width}:${layout.collapsed ? "1" : "0"}`;
}

function emitSidebarLayoutChange(): void {
  clientCache = null;
  for (const listener of sidebarLayoutListeners) {
    listener();
  }
}

function onSidebarStorageEvent(event: StorageEvent): void {
  if (event.key !== SIDEBAR_LAYOUT_STORAGE_KEY && event.key !== null) {
    return;
  }
  sessionLayout = parseStoredSidebarLayout(
    event.key === null ? readRawFromStorage() : event.newValue,
  );
  emitSidebarLayoutChange();
}

/** useSyncExternalStore — localStorage aynı sekmede persist + çapraz sekme. */
export function subscribeSidebarLayout(onStoreChange: () => void): () => void {
  sidebarLayoutListeners.add(onStoreChange);
  if (typeof window !== "undefined" && !sidebarLayoutWindowBound) {
    window.addEventListener("storage", onSidebarStorageEvent);
    sidebarLayoutWindowBound = true;
  }
  return () => {
    sidebarLayoutListeners.delete(onStoreChange);
    if (sidebarLayoutListeners.size === 0 && typeof window !== "undefined" && sidebarLayoutWindowBound) {
      window.removeEventListener("storage", onSidebarStorageEvent);
      sidebarLayoutWindowBound = false;
    }
  };
}

export function getSidebarLayoutClientSnapshot(): SidebarLayout {
  const layout = sessionLayout ?? parseStoredSidebarLayout(readRawFromStorage());
  const key = snapshotKey(layout);
  if (clientCache && clientCache.key === key) {
    return clientCache.layout;
  }
  clientCache = { key, layout };
  return layout;
}

export function getSidebarLayoutServerSnapshot(): SidebarLayout {
  return DEFAULT_SIDEBAR_LAYOUT;
}

export function writeSidebarLayoutToStorage(layout: SidebarLayout): void {
  const next = normalizeSidebarLayout(layout);
  sessionLayout = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(SIDEBAR_LAYOUT_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* kota / gizli tarama — tercih oturumda kalır */
    }
  }
  emitSidebarLayoutChange();
}
