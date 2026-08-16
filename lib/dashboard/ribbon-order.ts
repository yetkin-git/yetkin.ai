import { RIBBON_ROOMS, type RibbonRoomId } from "@/lib/kernel/modules";

export type { RibbonRoomId };

export const RIBBON_ORDER_STORAGE_KEY = "yetkin-rail.dashboard.ribbon-order";

export const DEFAULT_RIBBON_ORDER: readonly RibbonRoomId[] = RIBBON_ROOMS.map((room) => room.id);

const RIBBON_ID_SET = new Set<RibbonRoomId>(DEFAULT_RIBBON_ORDER);

export function isRibbonRoomId(value: string): value is RibbonRoomId {
  return RIBBON_ID_SET.has(value as RibbonRoomId);
}

export function parseStoredRibbonOrder(raw: string | null): string[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

/** Kayıtlı sırayı canonical 11 oda ile birleştirir; yabancı ve mükerrer id düşer, yeni oda sona eklenir. */
export function applyStoredRibbonOrder(
  canonical: readonly RibbonRoomId[],
  stored: readonly string[],
): RibbonRoomId[] {
  const allowed = new Set(canonical);
  const seen = new Set<RibbonRoomId>();
  const ordered: RibbonRoomId[] = [];

  for (const id of stored) {
    if (!isRibbonRoomId(id) || !allowed.has(id) || seen.has(id)) {
      continue;
    }
    ordered.push(id);
    seen.add(id);
  }

  for (const id of canonical) {
    if (!seen.has(id)) {
      ordered.push(id);
    }
  }

  return ordered;
}

export function moveRibbonRoom(
  order: readonly RibbonRoomId[],
  fromId: string,
  toId: string,
): RibbonRoomId[] {
  if (fromId === toId) {
    return [...order];
  }
  const fromIndex = order.indexOf(fromId as RibbonRoomId);
  const toIndex = order.indexOf(toId as RibbonRoomId);
  if (fromIndex < 0 || toIndex < 0) {
    return [...order];
  }
  const next = [...order];
  const [moved] = next.splice(fromIndex, 1);
  if (!moved) {
    return [...order];
  }
  next.splice(toIndex, 0, moved);
  return next;
}

export function readRibbonOrderFromStorage(): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    return parseStoredRibbonOrder(window.localStorage.getItem(RIBBON_ORDER_STORAGE_KEY));
  } catch {
    return [];
  }
}

export function writeRibbonOrderToStorage(order: readonly RibbonRoomId[]): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(RIBBON_ORDER_STORAGE_KEY, JSON.stringify(order));
  } catch {
    /* kota / gizli tarama — sıralama oturumda kalır */
  }
}
