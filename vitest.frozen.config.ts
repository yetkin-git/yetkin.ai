import path from "node:path";
import { defineConfig } from "vitest/config";
import { FROZEN_VITEST_ROOMS, railVitestAliases } from "./vitest.aliases";

/**
 * 410 envanteri — canlı `npm test` / `verify:nightly` bu config'i koşmaz.
 *
 * Akademi testleri `archived/academy/tests/` altına taşındı. Arşiv testleri
 * kendi ağacındaki kopyaları okur: `@/lib/academy/*` → `archived/academy/lib/*`
 * (yalnız arşive taşınan iki modül), `@/components/academy/*` →
 * `archived/academy/components/*` (Faz 2'de taşınan üç satış vitrini bileşeni).
 * Taşınmayan üç bileşen canlı ağaçta kalır; varsayılan eşleşme oraya düşer.
 *
 * Takma ad sırası önemlidir: en özel eşleşme önce gelir.
 */
const ROOT = path.resolve(import.meta.dirname);

/**
 * Faz 2 mimari temizlik: ölü satış vitrini bileşenleri (`course-card`,
 * `course-list`, `begin-checkout-link`) `archived/academy/components/` altına
 * taşındı. Arşiv sayfaları ve arşiv testleri onları hâlâ okur; bu üç ad
 * arşive çözülür. Canlı kalan üç bileşen (`certificate-share-actions`,
 * `certificate-verify-qr`, `course-cover-image`) yerinde durur.
 */
const ARCHIVED_ACADEMY_COMPONENTS = [
  "course-card",
  "course-list",
  "begin-checkout-link",
] as const;

const ACADEMY_ARCHIVE_ALIASES = [
  ...ARCHIVED_ACADEMY_COMPONENTS.map((name) => ({
    find: new RegExp(`^@/components/academy/${name}$`),
    replacement: path.join(ROOT, `archived/academy/components/${name}.tsx`),
  })),
  {
    find: /^@\/components\/academy\/(.+)$/,
    replacement: path.join(ROOT, "components/academy/$1"),
  },
  {
    find: /^@\/lib\/academy\/(.+)$/,
    replacement: path.join(ROOT, "lib/academy/$1"),
  },
];

export default defineConfig({
  test: {
    environment: "node",
    // Arşiv ders testleri JSON disk kaydını ve medya okuma bayrağını ister;
    // canlı config ile aynı setup dosyası burada da yüklenir.
    setupFiles: ["./tests/setup/academy-json-disk.ts"],
    include: [
      ...FROZEN_VITEST_ROOMS.map((id) => `tests/${id}/**/*.test.ts`),
      "archived/academy/tests/**/*.test.ts",
      "tests/kernel/three-ring-e2e-surface.test.ts",
      "tests/kernel/earnings-bridge.test.ts",
    ],
    exclude: ["yetkin_muze/**", "node_modules/**", ".next/**", "tests/**/*.pg.test.ts"],
  },
  resolve: {
    alias: [...ACADEMY_ARCHIVE_ALIASES, ...railVitestAliases(ROOT, FROZEN_VITEST_ROOMS)],
  },
});
