/**
 * One-shot generator — katalog indeksi. Runtime import etmez.
 * Kullanım: npx tsx scripts/generate-curriculum-lesson-index.ts
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { CURRICULUM_DRAFTS_BY_SLUG } from "@/lib/academy/curricula";

const counts = Object.fromEntries(
  Object.entries(CURRICULUM_DRAFTS_BY_SLUG).map(([slug, lessons]) => [slug, lessons.length]),
);
const lines = Object.entries(counts)
  .map(([slug, n]) => `  ${JSON.stringify(slug)}: ${n},`)
  .join("\n");

const body = `/**
 * Katalog / devam paneli — gövdesiz müfredat indeksi.
 * Taslak gövdeleri ve curriculum.ts bu dosyayı import etmez; bu dosya onları import etmez.
 * Anahtar kuralı: \${slug}-\${1..n}. Sapma testte kırılır.
 */

export const CURRICULUM_LESSON_COUNT_BY_SLUG: Readonly<Record<string, number>> = {
${lines}
};

export function curriculumLessonCountForSlug(slug: string): number {
  return CURRICULUM_LESSON_COUNT_BY_SLUG[slug] ?? 0;
}

export function curriculumLessonKeysForSlug(slug: string): readonly string[] {
  const count = curriculumLessonCountForSlug(slug);
  if (count === 0) {
    return [];
  }
  return Array.from({ length: count }, (_, i) => \`\${slug}-\${i + 1}\`);
}

export function isAcademyCurriculumCompleteFromIndex(
  slug: string,
  completedKeys: readonly string[],
): boolean {
  const keys = curriculumLessonKeysForSlug(slug);
  if (keys.length === 0) {
    return false;
  }
  const done = new Set(completedKeys);
  return keys.every((key) => done.has(key));
}

export function nextAcademyLessonKeyFromIndex(
  slug: string,
  completedKeys: readonly string[],
): string | null {
  const done = new Set(completedKeys);
  return curriculumLessonKeysForSlug(slug).find((key) => !done.has(key)) ?? null;
}
`;

writeFileSync(join(process.cwd(), "lib/academy/curricula/lesson-index.ts"), body, "utf8");
console.log(`wrote ${Object.keys(counts).length} slugs`);
