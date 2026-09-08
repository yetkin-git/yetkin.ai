#!/usr/bin/env tsx
/**
 * @deprecated Genel hat `scripts/ingest-course-sections.ts` — bu dosya
 * `02_ecommerce_ai` preset'li ince sarmalayıcıdır; davranış korunur:
 *
 *   tsx scripts/ingest-course-sections.ts \
 *     --slug 02_ecommerce_ai --src docs/curriculum/02_ecommerce_ai_mastery.md
 *
 * Bölüm metası (süre/kelime/amaç) artık kodda hardcoded META kopyası değil,
 * master metnin frontmatter'ı ve `**Pedagojik Amaç:**` satırlarından okunur.
 */

import { join } from "node:path";
import { ingestCourseSections, WIRING_REMINDER } from "./ingest-course-sections";

const ROOT = process.cwd();

const result = ingestCourseSections({
  slug: "02_ecommerce_ai",
  srcPath: join(ROOT, "docs", "curriculum", "02_ecommerce_ai_mastery.md"),
  outDir: join(ROOT, "lib", "academy", "curricula", "ecommerce_ai"),
  exportPrefix: "ecommerceAi",
  expectedSections: 6,
  dryRun: false,
  module: {},
});

process.stdout.write(`OK ecommerce_ai ingest: ${result.sectionNumbers.join(",")}\n`);
process.stdout.write(`${WIRING_REMINDER}\n`);
