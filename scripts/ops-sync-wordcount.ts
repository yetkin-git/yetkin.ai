#!/usr/bin/env tsx
/**
 * Compact makale `estimatedWordCount` senkronu.
 * El yazması kelime dönemini kapatır. Gövdeyi kesmez (Anayasa B4).
 *
 *   npx tsx scripts/ops-sync-wordcount.ts
 *   npx tsx scripts/ops-sync-wordcount.ts --check
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { officeAiSections } from "@/lib/academy/curricula/office_ai";
import { countAcademyMarkdownWords } from "@/lib/academy/word-count";

const ROOT = process.cwd();
const CHECK = process.argv.includes("--check");

const OFFICE_AI_SECTION_FILES: Readonly<Record<string, string>> = {
  "01_office_ai-1": "lib/academy/curricula/office_ai/section_1.ts",
  "01_office_ai-k1": "lib/academy/curricula/office_ai/section_k1.ts",
  "01_office_ai-2": "lib/academy/curricula/office_ai/section_2.ts",
  "01_office_ai-3": "lib/academy/curricula/office_ai/section_3.ts",
  "01_office_ai-5": "lib/academy/curricula/office_ai/section_5.ts",
  "01_office_ai-4": "lib/academy/curricula/office_ai/section_4.ts",
  "01_office_ai-g1": "lib/academy/curricula/office_ai/section_g1.ts",
  "01_office_ai-w1": "lib/academy/curricula/office_ai/section_w1.ts",
  "01_office_ai-6": "lib/academy/curricula/office_ai/section_6.ts",
};

function syncFile(relative: string, nextCount: number): { changed: boolean; previous: number | null } {
  const path = join(ROOT, relative);
  const source = readFileSync(path, "utf8");
  const match = /estimatedWordCount:\s*(\d+)/u.exec(source);
  const previous = match ? Number(match[1]) : null;
  if (previous === nextCount) {
    return { changed: false, previous };
  }
  if (CHECK) {
    return { changed: true, previous };
  }
  if (!match) {
    throw new Error(`${relative}: estimatedWordCount alanı yok.`);
  }
  const next = source.replace(/estimatedWordCount:\s*\d+/u, `estimatedWordCount: ${nextCount}`);
  writeFileSync(path, next, "utf8");
  return { changed: true, previous };
}

let drift = 0;
for (const section of officeAiSections) {
  const key = section.lessonKey?.trim() ?? "";
  const relative = OFFICE_AI_SECTION_FILES[key];
  if (!relative) {
    throw new Error(`ops-sync-wordcount: ${key || section.title} dosya eşleşmesi yok.`);
  }
  const words = countAcademyMarkdownWords(section.contentMarkdown);
  const { changed, previous } = syncFile(relative, words);
  const label = `${key} ${relative} ${previous ?? "?"} → ${words}`;
  if (changed) {
    drift += 1;
    console.log(CHECK ? `DRIFT ${label}` : `YAZILDI ${label}`);
  } else {
    console.log(`TAMAM ${label}`);
  }
}

if (CHECK && drift > 0) {
  console.error(`ops-sync-wordcount --check: ${drift} dosya kaymış. npx tsx scripts/ops-sync-wordcount.ts çalıştır.`);
  process.exit(1);
}

console.log(`ops-sync-wordcount: ${officeAiSections.length} bölüm, kayma=${drift}${CHECK ? " (check)" : ""}.`);
