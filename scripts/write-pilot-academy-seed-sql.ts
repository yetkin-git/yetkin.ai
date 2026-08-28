/**
 * Akademi SQL tohumu — `render-academy-course-seed-sql.ts` sarmalayıcısı.
 *
 *   npx tsx scripts/render-academy-course-seed-sql.ts
 */
import { spawnSync } from "node:child_process";

const child = spawnSync("npx", ["tsx", "scripts/render-academy-course-seed-sql.ts"], {
  stdio: "inherit",
  shell: true,
});
process.exit(child.status === null ? 1 : child.status);
