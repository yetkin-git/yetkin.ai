#!/usr/bin/env tsx
/**
 * Kenar projeksiyonu. Senaryo başlığı ve katalog sırası.
 * Elle dizi yazılmaz.
 *   npx tsx scripts/sync-junior-lesson-face.ts
 *   npx tsx scripts/sync-junior-lesson-face.ts --check
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { JUNIOR_ELECTIVE_COURSES } from "@/lib/junior/elective-catalog";
import { JUNIOR_FEN_LESSONS } from "@/lib/junior/content/fen";
import { JUNIOR_ING_LESSONS } from "@/lib/junior/content/ing";
import { JUNIOR_MAT_LESSONS } from "@/lib/junior/content/mat";
import { JUNIOR_SOSYAL_LESSONS } from "@/lib/junior/content/sosyal";
import { JUNIOR_TURKCE_LESSONS } from "@/lib/junior/content/turkce";

const OUT = join(process.cwd(), "lib", "junior", "lesson-face.ts");

const lessons = [
  ...JUNIOR_MAT_LESSONS,
  ...JUNIOR_FEN_LESSONS,
  ...JUNIOR_TURKCE_LESSONS,
  ...JUNIOR_ING_LESSONS,
  ...JUNIOR_SOSYAL_LESSONS,
  ...JUNIOR_ELECTIVE_COURSES.flatMap((course) => course.lessons),
];

const rows = lessons
  .map((lesson) => `  { key: ${JSON.stringify(lesson.key)}, title: ${JSON.stringify(lesson.title)} },`)
  .join("\n");

const body = `/**
 * Kenar projeksiyonu. Elle yazılmaz.
 * Kaynak: senaryo başlığı ve katalog sırası.
 * Yenile: npx tsx scripts/sync-junior-lesson-face.ts
 */
export const JUNIOR_LESSON_FACE = [
${rows}
] as const;

export type JuniorLessonFaceKey = (typeof JUNIOR_LESSON_FACE)[number]["key"];
`;

const check = process.argv.includes("--check");
if (check) {
  const current = readFileSync(OUT, "utf8");
  if (current !== body) {
    process.stderr.write("lesson-face senaryo başlığından koptu. sync-junior-lesson-face.ts çalıştır.\n");
    process.exit(1);
  }
  process.stdout.write("lesson-face senaryo ile aynı.\n");
} else {
  writeFileSync(OUT, body, "utf8");
  process.stdout.write(`yazıldı ${lessons.length} başlık → ${OUT}\n`);
}
