#!/usr/bin/env tsx
/**
 * Beş katman disk anlığı.
 * Derleme, medya baytını `_middleware` izine almadan satış kapısını açık tutar.
 * Çıktı `lib/academy/production-seal-manifest.ts`. Elle düzenlenmez.
 */

import { existsSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CURRICULUM_LESSON_KEYS_BY_SLUG } from "@/lib/kernel/catalog-ids/exam-path";
import { academyProductionLayerRelativePaths } from "@/lib/academy/production-standard";

const ROOT = process.cwd();
const DEST = join(ROOT, "lib/academy/production-seal-manifest.ts");

const present = new Set<string>();

for (const [slug, keys] of Object.entries(CURRICULUM_LESSON_KEYS_BY_SLUG)) {
  for (const lessonKey of keys) {
    const paths = academyProductionLayerRelativePaths(slug, lessonKey);
    for (const relative of Object.values(paths)) {
      if (!relative || relative.includes("..")) {
        continue;
      }
      const absolute = join(ROOT, relative);
      if (!existsSync(absolute)) {
        continue;
      }
      if (statSync(absolute).size <= 0) {
        continue;
      }
      present.add(relative.replaceAll("\\", "/"));
    }
  }
}

const lines = [...present].sort();
const body = lines.map((relative) => `  ${JSON.stringify(relative)}: true,`).join("\n");
const source = `/**
 * Beş katman disk anlığı. \`scripts/write-production-seal-manifest.ts\` yazar.
 * Lambda ses, video ve sinema JPG baytını taşımaz. Satış kapısı bu tabloyu okur.
 * Elle düzenlenmez.
 */
export const ACADEMY_PRODUCTION_SEAL_MANIFEST: Readonly<Record<string, true>> = {
${body}
};
`;

writeFileSync(DEST, source);
process.stdout.write(`production-seal-manifest: ${lines.length} dosya\n`);
