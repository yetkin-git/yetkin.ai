/** Üst şerit geri / ileri — tarayıcı geçmiş imleci, köken dışına düşmez. */

export const NAV_HISTORY_STATE_KEY = "__yetkinRailNav";
export const NAV_HISTORY_STORAGE_KEY = "yetkin-rail.shell.nav-history";

export type NavHistorySnapshot = {
  index: number;
  length: number;
};

export type NavHistoryStamp = {
  index: number;
};

export type NavHistoryEntryLike = {
  url: string;
  key?: string;
  id?: string;
};

export type NavigationLike = {
  currentEntry: NavHistoryEntryLike | null;
  entries: () => readonly NavHistoryEntryLike[];
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener: (type: string, listener: EventListener) => void;
};

export const INITIAL_NAV_HISTORY: NavHistorySnapshot = {
  index: 0,
  length: 1,
};

export function navHistoryFlags(snapshot: NavHistorySnapshot): {
  canGoBack: boolean;
  canGoForward: boolean;
} {
  return {
    canGoBack: snapshot.index > 0,
    canGoForward: snapshot.index < snapshot.length - 1,
  };
}

export function clampNavHistorySnapshot(snapshot: NavHistorySnapshot): NavHistorySnapshot {
  const length = Number.isInteger(snapshot.length) && snapshot.length > 0 ? snapshot.length : 1;
  const index = Number.isInteger(snapshot.index)
    ? Math.min(Math.max(0, snapshot.index), length - 1)
    : 0;
  return { index, length };
}

export function applyNavHistoryPush(snapshot: NavHistorySnapshot): NavHistorySnapshot {
  const current = clampNavHistorySnapshot(snapshot);
  const index = current.index + 1;
  return { index, length: index + 1 };
}

export function applyNavHistoryTraverse(
  snapshot: NavHistorySnapshot,
  nextIndex: number | null,
): NavHistorySnapshot {
  const current = clampNavHistorySnapshot(snapshot);
  if (nextIndex == null || !Number.isInteger(nextIndex)) {
    return { index: Math.max(0, current.index - 1), length: current.length };
  }
  return clampNavHistorySnapshot({ index: nextIndex, length: current.length });
}

export function indexOfNavigationEntry(
  entries: readonly NavHistoryEntryLike[],
  current: NavHistoryEntryLike | null,
): number {
  if (!current || entries.length === 0) {
    return 0;
  }
  if (current.key) {
    const byKey = entries.findIndex((entry) => entry.key === current.key);
    if (byKey >= 0) {
      return byKey;
    }
  }
  if (current.id) {
    const byId = entries.findIndex((entry) => entry.id === current.id);
    if (byId >= 0) {
      return byId;
    }
  }
  return Math.max(0, entries.length - 1);
}

export function readNavigationSnapshot(
  navigation: NavigationLike | null | undefined,
): NavHistorySnapshot | null {
  if (!navigation || typeof navigation.entries !== "function") {
    return null;
  }
  let entries: readonly NavHistoryEntryLike[];
  try {
    entries = navigation.entries();
  } catch {
    return null;
  }
  if (!Array.isArray(entries)) {
    return null;
  }
  if (entries.length === 0) {
    return { ...INITIAL_NAV_HISTORY };
  }
  return {
    index: indexOfNavigationEntry(entries, navigation.currentEntry),
    length: entries.length,
  };
}

export function readNavHistoryStamp(state: unknown): NavHistoryStamp | null {
  if (!state || typeof state !== "object") {
    return null;
  }
  const raw = (state as Record<string, unknown>)[NAV_HISTORY_STATE_KEY];
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const index = (raw as Record<string, unknown>).index;
  if (typeof index !== "number" || !Number.isInteger(index) || index < 0) {
    return null;
  }
  return { index };
}

export function mergeNavHistoryStamp(state: unknown, stamp: NavHistoryStamp): object {
  const base =
    state && typeof state === "object" && !Array.isArray(state)
      ? { ...(state as Record<string, unknown>) }
      : {};
  return { ...base, [NAV_HISTORY_STATE_KEY]: { index: stamp.index } };
}

export function parseNavHistorySnapshot(value: unknown): NavHistorySnapshot | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const record = value as Record<string, unknown>;
  const index = record.index;
  const length = record.length;
  if (typeof index !== "number" || typeof length !== "number") {
    return null;
  }
  if (!Number.isInteger(index) || !Number.isInteger(length) || length < 1 || index < 0) {
    return null;
  }
  return clampNavHistorySnapshot({ index, length });
}

export function parseStoredNavHistorySnapshot(raw: string | null): NavHistorySnapshot | null {
  if (!raw) {
    return null;
  }
  try {
    return parseNavHistorySnapshot(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function hydrateNavHistorySnapshot(
  historyState: unknown,
  stored: NavHistorySnapshot | null,
): NavHistorySnapshot {
  const stamp = readNavHistoryStamp(historyState);
  if (!stamp) {
    return { ...INITIAL_NAV_HISTORY };
  }
  const length = Math.max(stamp.index + 1, stored?.length ?? stamp.index + 1);
  return clampNavHistorySnapshot({ index: stamp.index, length });
}

export function asNavigationLike(value: unknown): NavigationLike | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const nav = value as Partial<NavigationLike>;
  if (typeof nav.entries !== "function") {
    return null;
  }
  if (typeof nav.addEventListener !== "function" || typeof nav.removeEventListener !== "function") {
    return null;
  }
  return nav as NavigationLike;
}
