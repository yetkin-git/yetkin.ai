import path from "node:path";
import { FROZEN_DISK_ROOMS } from "./lib/dronlar/kayit";

/** Donmuş odalar. Canlı `npm test` bu odaların testlerini koşmaz. */
export const FROZEN_VITEST_ROOMS = FROZEN_DISK_ROOMS;

/**
 * Canlı Vitest takma adı arşive düşmez.
 * Donmuş oda takma adı yalnız `vitest.frozen.config.ts` içinde `FROZEN_VITEST_ROOMS` ile verilir.
 * `@/lib/junior` canlı klasöre düşer.
 */
export const LIVE_VITEST_ARCHIVE_ROOMS = [] as const;

export function railVitestAliases(
  rootDir: string,
  rooms: readonly string[] = LIVE_VITEST_ARCHIVE_ROOMS,
) {
  return [
    ...rooms.flatMap((id) => [
      {
        find: `@/lib/${id}`,
        replacement: path.join(rootDir, "archived", "lib", id),
      },
      {
        find: `@/components/${id}`,
        replacement: path.join(rootDir, "archived", "components", id),
      },
    ]),
    {
      find: /^@yetkin\/kernel\/(.*)$/,
      replacement: path.join(rootDir, "packages/kernel/src/$1"),
    },
    {
      find: /^@yetkin\/kernel$/,
      replacement: path.join(rootDir, "packages/kernel/src/index.ts"),
    },
    {
      find: /^@yetkin\/junior-content\/schema\/(.*)$/,
      replacement: path.join(rootDir, "packages/junior-content/schema/$1"),
    },
    {
      find: /^@yetkin\/junior-content\/calendar$/,
      replacement: path.join(rootDir, "packages/junior-content/src/calendar.ts"),
    },
    {
      find: /^@yetkin\/junior-content$/,
      replacement: path.join(rootDir, "packages/junior-content/src/index.ts"),
    },
    { find: "@", replacement: rootDir },
    {
      find: "server-only",
      replacement: path.join(rootDir, "tests", "shims", "server-only.ts"),
    },
  ];
}
