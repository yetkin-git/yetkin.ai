/**
 * One-shot generator — katalog indeksi. Runtime import etmez.
 * Kullanım: npx tsx scripts/generate-curriculum-lesson-index.ts
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { CURRICULUM_DRAFTS_BY_SLUG } from "@/lib/academy/curricula";

const keysBySlug = Object.fromEntries(
  Object.entries(CURRICULUM_DRAFTS_BY_SLUG).map(([slug, lessons]) => [
    slug,
    lessons.map((lesson) => lesson.key),
  ]),
);
const keyLines = Object.entries(keysBySlug)
  .map(([slug, keys]) => {
    if (keys.length === 0) {
      return `  ${JSON.stringify(slug)}: [],`;
    }
    const inner = keys.map((key) => `    ${JSON.stringify(key)},`).join("\n");
    return `  ${JSON.stringify(slug)}: [\n${inner}\n  ],`;
  })
  .join("\n");
const countLines = Object.entries(keysBySlug)
  .map(([slug, keys]) => `  ${JSON.stringify(slug)}: ${keys.length},`)
  .join("\n");

const body = `/**
 * Katalog / devam paneli — gövdesiz müfredat indeksi.
 * Taslak gövdeleri ve curriculum.ts bu dosyayı import etmez; bu dosya onları import etmez.
 * Anahtarlar taslak key dizisidir; ofis amiral 8 ders (\`lesson-index.ts\`).
 * Excel → KVKK → rapor → slayt → hata avı → e-posta (g1) → Word → Cuma 30.
 * \`01_office_ai-4\` sınav yolunda yoktur.
 */

export const CURRICULUM_LESSON_KEYS_BY_SLUG: Readonly<Record<string, readonly string[]>> = {
${keyLines}
};

export const CURRICULUM_LESSON_COUNT_BY_SLUG: Readonly<Record<string, number>> = {
${countLines}
};

export function curriculumLessonCountForSlug(slug: string): number {
  return CURRICULUM_LESSON_COUNT_BY_SLUG[slug] ?? 0;
}

export function curriculumLessonKeysForSlug(slug: string): readonly string[] {
  return CURRICULUM_LESSON_KEYS_BY_SLUG[slug] ?? [];
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
console.log(`wrote ${Object.keys(keysBySlug).length} slugs`);
