import path from "node:path";
import { FROZEN_DISK_ROOMS } from "./lib/kernel/rooms.ssot";

/** Donmuş 8 oda — Amiral derlemesi `archived/`; Vitest `@/lib/{oda}` takma adını oraya çevirir (canlı `lib/` tavanı yok). */
export const FROZEN_VITEST_ROOMS = FROZEN_DISK_ROOMS;

export function railVitestAliases(rootDir: string) {
  return [
    ...FROZEN_VITEST_ROOMS.flatMap((id) => [
      {
        find: `@/lib/${id}`,
        replacement: path.join(rootDir, "archived", "lib", id),
      },
      {
        find: `@/components/${id}`,
        replacement: path.join(rootDir, "archived", "components", id),
      },
    ]),
    { find: "@", replacement: rootDir },
    {
      find: "server-only",
      replacement: path.join(rootDir, "tests", "shims", "server-only.ts"),
    },
  ];
}
