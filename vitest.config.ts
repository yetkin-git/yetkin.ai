import path from "node:path";
import { defineConfig } from "vitest/config";
import { FROZEN_VITEST_ROOMS, railVitestAliases } from "./vitest.aliases";

/**
 * Canlı ürün yeşili — 410 envanteri `vitest.frozen.config.ts` / `test:frozen`.
 * Arşiv modülünü import eden testler canlı suite'te koşmaz.
 *
 * Akademi odası `archived/academy/` altına taşındı (canlı derleme ve test yükünden
 * çıktı). `tests/academy/**` artık diskte yok; dosya adları tek tek sayılmaz,
 * arşiv ağacı bütün olarak dışlanır. Arşiv testleri geri koşulacaksa
 * `npm run test:frozen` kullanılır.
 */
const FROZEN_TEST_GLOBS = FROZEN_VITEST_ROOMS.map((id) => `tests/${id}/**`);

/** Canlı suite dışında: arşivdeki hiçbir test koşmaz. */
const ARCHIVED_TEST_GLOBS = ["archived/**"];

/**
 * Akademi motorunu import eden ama `tests/academy/` dışında duran canlı testler.
 * Oda arşivde; bu iki e2e halkası arşiv modülüne bağlı olduğu için canlı yeşile girmez.
 */
const ARCHIVE_IMPORT_TESTS = [
  "tests/kernel/three-ring-e2e-surface.test.ts",
  "tests/kernel/earnings-bridge.test.ts",
];

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup/academy-json-disk.ts"],
    include: ["tests/**/*.test.ts"],
    exclude: [
      "yetkin_muze/**",
      "node_modules/**",
      ".next/**",
      "tests/**/*.pg.test.ts",
      ...FROZEN_TEST_GLOBS,
      ...ARCHIVED_TEST_GLOBS,
      ...ARCHIVE_IMPORT_TESTS,
    ],
  },
  resolve: {
    alias: railVitestAliases(path.resolve(import.meta.dirname)),
  },
});
