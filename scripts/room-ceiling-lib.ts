/**
 * Anayasa §2.8 — 12 oda tavanı yardımcıları.
 * VERTICAL_ROOMS kopyaları lib/kernel/modules.ts, eslint.config.mjs ve
 * scripts/verify-boundaries.ts içinde durur; bu modül onları parse eder, icat etmez.
 */

export const LIB_SHARED_TOP_DIRS = ["copy", "kernel", "showcase", "ui"] as const;

export function parseVerticalRoomIdsFromModules(source: string): string[] | null {
  const match = source.match(/export const VERTICAL_ROOMS = \[([\s\S]*?)\] as const;/);
  if (!match?.[1]) {
    return null;
  }
  return [...match[1].matchAll(/\bid:\s*"([a-z0-9-]+)"/g)].map((row) => row[1]!);
}

export function parseVerticalRoomIdsFromEslint(source: string): string[] | null {
  const match = source.match(/const VERTICAL_ROOMS = \[([\s\S]*?)\];/);
  if (!match?.[1]) {
    return null;
  }
  return [...match[1].matchAll(/"([a-z0-9-]+)"/g)].map((row) => row[1]!);
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
    "VERTICAL_ROOMS sicili sapması — Anayasa 12 oda tavanı eleman eleman aynı sırayı ister.",
    `  ${leftName}: [${left.join(", ")}]`,
    `  ${rightName}: [${right.join(", ")}]`,
  ].join("\n");
}

export function extraLibRoomMessage(dirName: string, roomIds: readonly string[]): string {
  return [
    `Anayasa 12 oda tavanı: lib/${dirName} sicilde yoktur. 13. oda yasaktır.`,
    `Paylaşılan katmanlar: ${LIB_SHARED_TOP_DIRS.join(", ")}.`,
    `Sicil: ${roomIds.join(", ")}.`,
  ].join(" ");
}

export function missingLibRoomMessage(dirName: string): string {
  return `Anayasa 12 oda sicili: lib/${dirName} klasörü yok. Asil oda silinemez.`;
}
