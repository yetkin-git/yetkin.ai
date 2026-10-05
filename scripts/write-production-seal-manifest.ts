#!/usr/bin/env tsx
/**
 * Beş katman disk anlığı.
 * Derleme, medya baytını `_middleware` izine almadan satış kapısını açık tutar.
 * Çıktı `lib/academy/production-seal-manifest.ts`. Elle düzenlenmez.
 * Ses baytı bu makinede yoksa önceki anlık yolu düşmez.
 * Bilinçli düşürme: `ACADEMY_SEAL_DROP_MISSING=1`.
 */

import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ACADEMY_VITRINE_SHELL_SKU_SLUGS } from "@/lib/academy/pilot-sku";
import {
  academyProductionLayerRelativePaths,
  mergeAcademyProductionSealPaths,
} from "@/lib/academy/production-standard";
import { CURRICULUM_LESSON_KEYS_BY_SLUG } from "@/lib/kernel/catalog-ids/exam-path";

const ROOT = process.cwd();
const DEST = join(ROOT, "lib/academy/production-seal-manifest.ts");

function layerPaths(slug: string, lessonKey: string): string[] {
  return Object.values(academyProductionLayerRelativePaths(slug, lessonKey)).flatMap((relative) =>
    relative && !relative.includes("..") ? [relative.replaceAll("\\", "/")] : [],
  );
}

const onDisk: string[] = [];
const required: string[] = [];

for (const [slug, keys] of Object.entries(CURRICULUM_LESSON_KEYS_BY_SLUG)) {
  const vitrine = (ACADEMY_VITRINE_SHELL_SKU_SLUGS as readonly string[]).includes(slug);
  for (const lessonKey of keys) {
    const paths = layerPaths(slug, lessonKey);
    if (vitrine) required.push(...paths);
    for (const relative of paths) {
      const absolute = join(ROOT, relative);
      if (!existsSync(absolute)) continue;
      if (statSync(absolute).size <= 0) continue;
      onDisk.push(relative);
    }
  }
}

const previousSource = existsSync(DEST) ? readFileSync(DEST, "utf8") : "";
const previous = [...previousSource.matchAll(/"([^"\\\n]+)": true/gu)].map((match) => match[1] ?? "");
const dropMissing = process.env.ACADEMY_SEAL_DROP_MISSING === "1";
const merged = mergeAcademyProductionSealPaths({ onDisk, previous, required, dropMissing });

if (merged.missingRequired.length > 0) {
  process.stderr.write(
    `production-seal-manifest eksik. Yazılmadı.\n${merged.missingRequired.join("\n")}\n`,
  );
  process.exit(1);
}

const body = merged.paths.map((relative) => `  ${JSON.stringify(relative)}: true,`).join("\n");
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
const kept = merged.paths.filter((relative) => !onDisk.includes(relative)).length;
process.stdout.write(
  kept > 0
    ? `production-seal-manifest: ${merged.paths.length} dosya; ${kept} yol önceki anlıkta, bayt bu makinede yok\n`
    : `production-seal-manifest: ${merged.paths.length} dosya\n`,
);
