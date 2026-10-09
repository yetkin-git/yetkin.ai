import path from "node:path";
import { FROZEN_DISK_ROOMS } from "./lib/dronlar/kayit";

/** Donmuş odalar. Canlı `npm test` bu odaların testlerini koşmaz. */
export const FROZEN_VITEST_ROOMS = FROZEN_DISK_ROOMS;

/**
 * Canlı Vitest takma adı. Junior donmuş oda değildir; arşive bağlanmaz.
 * `@/lib/junior` canlı klasöre düşer.
 * Donmuş envanter `vitest.frozen.config.ts` içinde `FROZEN_VITEST_ROOMS` ile arşive bağlanır.
 */
export const LIVE_VITEST_ARCHIVE_ROOMS = FROZEN_DISK_ROOMS;

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
    { find: "@", replacement: rootDir },
    {
      find: "server-only",
      replacement: path.join(rootDir, "tests", "shims", "server-only.ts"),
    },
  ];
}
