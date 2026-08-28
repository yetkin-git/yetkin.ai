/**
 * Çalışan oda sicili yardımcıları.
 * Tek SSOT: lib/kernel/rooms.ssot.ts. eslint.config.mjs ve verify-boundaries onu okur, kopya dizi tutmaz.
 */

export const LIB_SHARED_TOP_DIRS = ["copy", "kernel", "showcase", "ui"] as const;

export const ROOMS_SSOT_REL = "lib/kernel/rooms.ssot.ts";

export function parseVerticalRoomIdsFromSsot(source: string): string[] | null {
  const match = source.match(/export const VERTICAL_ROOMS = \[([\s\S]*?)\] as const;/);
  if (!match?.[1]) {
    return null;
  }
  return [...match[1].matchAll(/\bid:\s*"([a-z0-9-]+)"/g)].map((row) => row[1]!);
}

export function parseFrozenDiskRoomIdsFromSsot(source: string): string[] | null {
  const match = source.match(/export const FROZEN_DISK_ROOMS = \[([\s\S]*?)\] as const;/);
  if (!match?.[1]) {
    return null;
  }
  return [...match[1].matchAll(/"([a-z0-9-]+)"/g)].map((row) => row[1]!);
}

/** @deprecated SSOT rooms.ssot.ts — modules.ts re-export eder. */
export function parseVerticalRoomIdsFromModules(source: string): string[] | null {
  if (source.includes("rooms.ssot")) {
    return null;
  }
  return parseVerticalRoomIdsFromSsot(source);
}

export function parseVerticalRoomIdsFromEslint(source: string): string[] | null {
  if (!source.includes("rooms.ssot.ts")) {
    return null;
  }
  const match = source.match(/const VERTICAL_ROOMS = parseSsotIds\("VERTICAL_ROOMS"/);
  if (!match) {
    return null;
  }
  return [];
}

export function sourceDerivesRoomsSsot(source: string): boolean {
  return source.includes("rooms.ssot.ts") || source.includes("rooms.ssot");
}

export function parseVerticalRoomIdsFromBoundaries(source: string): string[] | null {
  const match = source.match(/const VERTICAL_ROOMS = \[([\s\S]*?)\] as const;/);
  if (!match?.[1]) {
    return null;
  }
  return [...match[1].matchAll(/"([a-z0-9-]+)"/g)].map((row) => row[1]!);
}

export function roomIdListsEqual(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

export function unexpectedLibTopDirs(
  dirNames: readonly string[],
  roomIds: readonly string[],
): string[] {
  const allowed = new Set<string>([...roomIds, ...LIB_SHARED_TOP_DIRS]);
  return dirNames.filter((name) => !allowed.has(name)).sort();
}

export function missingRegisteredRoomDirs(
  dirNames: readonly string[],
  roomIds: readonly string[],
): string[] {
  const present = new Set(dirNames);
  return roomIds.filter((id) => !present.has(id));
}

export function verticalRoomsSicilDriftMessage(
  leftName: string,
  left: readonly string[],
  rightName: string,
  right: readonly string[],
): string {
  return [
    "VERTICAL_ROOMS sicili sapması — çalışan 4 oda eleman eleman aynı sırayı ister.",
    `  ${leftName}: [${left.join(", ")}]`,
    `  ${rightName}: [${right.join(", ")}]`,
  ].join("\n");
}

export function extraLibRoomMessage(dirName: string, roomIds: readonly string[]): string {
  return [
    `Çalışan oda sicili: lib/${dirName} VERTICAL_ROOMS'ta yoktur.`,
    `Paylaşılan katmanlar: ${LIB_SHARED_TOP_DIRS.join(", ")}.`,
    `Sicil: ${roomIds.join(", ")}.`,
  ].join(" ");
}

export function missingLibRoomMessage(dirName: string): string {
  return `Çalışan oda sicili: lib/${dirName} klasörü yok.`;
}
