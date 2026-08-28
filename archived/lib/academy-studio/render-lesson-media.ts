#!/usr/bin/env tsx
/**
 * Arşiv bake — mühürlü şema + mikro-video poster.
 * Canlı `scripts/render-academy-lesson-media.ts` bu fabrikayı import etmez.
 *
 *   npx tsx archived/lib/academy-studio/render-lesson-media.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  ACADEMY_SEALED_DIAGRAM_KEYS,
  academySealedDiagramByKey,
  renderSealedDiagramSvg,
} from "@/archived/lib/academy-studio/sealed-diagrams";

const ROOT = process.cwd();
const DIAGRAM_DIR = join(ROOT, "public", "media", "academy", "diagrams");
const MICRO_DIR = join(ROOT, "public", "media", "academy", "micro");

mkdirSync(DIAGRAM_DIR, { recursive: true });
mkdirSync(MICRO_DIR, { recursive: true });

let baked = 0;
for (const key of ACADEMY_SEALED_DIAGRAM_KEYS) {
  const spec = academySealedDiagramByKey(key);
  if (!spec) {
    throw new Error(`şema yok: ${key}`);
  }
  const still = renderSealedDiagramSvg(spec, { animate: false });
  const loop = renderSealedDiagramSvg(spec, { animate: true, durationSec: spec.loopSec });
  writeFileSync(join(DIAGRAM_DIR, `${key}.svg`), still, "utf8");
  writeFileSync(join(MICRO_DIR, `${key}.poster.svg`), still, "utf8");
  writeFileSync(join(MICRO_DIR, `${key}.loop.svg`), loop, "utf8");
  baked += 1;
}

process.stdout.write(`render-academy-lesson-media OK — ${baked} şema/poster/döngü (arşiv).\n`);
