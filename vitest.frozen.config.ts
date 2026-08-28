import path from "node:path";
import { defineConfig } from "vitest/config";
import { FROZEN_VITEST_ROOMS, railVitestAliases } from "./vitest.aliases";

/** 410 envanteri — canlı `npm test` / `verify:nightly` bu config’i koşmaz. */
export default defineConfig({
  test: {
    environment: "node",
    include: FROZEN_VITEST_ROOMS.map((id) => `tests/${id}/**/*.test.ts`),
    exclude: ["yetkin_muze/**", "node_modules/**", ".next/**", "tests/**/*.pg.test.ts"],
  },
  resolve: {
    alias: railVitestAliases(path.resolve(import.meta.dirname)),
  },
});
