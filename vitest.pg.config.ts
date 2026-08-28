import path from "node:path";
import { defineConfig } from "vitest/config";
import { railVitestAliases } from "./vitest.aliases";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.pg.test.ts"],
    exclude: ["yetkin_muze/**", "node_modules/**", ".next/**"],
    env: {
      RAIL_PG_INTEGRATION: "1",
    },
    fileParallelism: false,
    maxWorkers: 1,
    testTimeout: 60_000,
  },
  resolve: {
    alias: railVitestAliases(path.resolve(import.meta.dirname)),
  },
});
