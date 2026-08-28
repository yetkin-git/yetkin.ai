import path from "node:path";
import { defineConfig } from "vitest/config";
import { FROZEN_VITEST_ROOMS, railVitestAliases } from "./vitest.aliases";

/** Canlı ürün yeşili — 410 envanteri `vitest.frozen.config.ts` / `test:frozen`. */
const FROZEN_TEST_GLOBS = FROZEN_VITEST_ROOMS.map((id) => `tests/${id}/**`);

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: [
      "yetkin_muze/**",
      "node_modules/**",
      ".next/**",
      "tests/**/*.pg.test.ts",
      ...FROZEN_TEST_GLOBS,
    ],
  },
  resolve: {
    alias: railVitestAliases(path.resolve(import.meta.dirname)),
  },
});
