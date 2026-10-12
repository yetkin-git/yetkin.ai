import path from "node:path";
import { defineConfig } from "vitest/config";
import { FROZEN_VITEST_ROOMS, railVitestAliases } from "./vitest.aliases";

/**
 * Canlı ürün yeşili — 410 envanteri `vitest.frozen.config.ts` / `test:frozen`.
 * Arşiv modülünü import eden testler canlı suite'te koşmaz.
 */
const FROZEN_TEST_GLOBS = FROZEN_VITEST_ROOMS.map((id) => `tests/${id}/**`);

const ARCHIVE_IMPORT_TESTS = [
  "tests/academy/curriculum-content.test.ts",
  "tests/academy/curriculum-revisions.test.ts",
  "tests/academy/lesson-body.test.ts",
  "tests/academy/lesson-code-lab.test.ts",
  "tests/academy/lesson-discussion.test.ts",
  "tests/academy/lesson-listen-courtesy.test.ts",
  "tests/academy/lesson-listen-focus.test.ts",
  "tests/academy/lesson-listen-script.test.ts",
  "tests/academy/lesson-listen-web-speech.test.ts",
  "tests/academy/lesson-media-surface.test.ts",
  "tests/academy/lesson-note-pdf.test.ts",
  "tests/academy/lesson-transcript-sync.test.ts",
  "tests/academy/listen-audio-cache.test.ts",
  "tests/academy/listen-fallback.test.ts",
  "tests/academy/listen-reading-mode.test.ts",
  "tests/academy/listen-soft-fallback.test.ts",
  "tests/academy/moderator-bridge.test.ts",
  "tests/academy/pedagogy-doctrine.test.ts",
  "tests/academy/review-decision.test.ts",
  "tests/academy/reviews.test.ts",
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
      ...ARCHIVE_IMPORT_TESTS,
    ],
  },
  resolve: {
    alias: railVitestAliases(path.resolve(import.meta.dirname)),
  },
});
