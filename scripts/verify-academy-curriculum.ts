#!/usr/bin/env tsx
/**
 * Ders sayısı, konuşma kelime tabanı ve UTF-8 mühürü.
 * Yazılmış bir eğitim 6 dersten azsa veya bir ders 600 kelimenin altındaysa çıkar.
 * PR-105 ve `spokenScript` taşıyan her `section_N.ts` düz metni en az 600 kelimedir.
 * BOM, uyumsuz bayt veya bozuk karakter varsa çıkar.
 * Sıfır bölümlü iskelet henüz ders taşımaz. İlk bölüm yazıldığında taban açılır.
 * `verify:prebuild` bu betiği koşar. İhlalde fırın açılmaz.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  ACADEMY_AI_LESSON_COUNT_MIN,
  assertAcademyAiLessonCount,
  assertAcademySectionSpokenScriptSource,
  assertAcademyUtf8SourceBytes,
} from "@/lib/academy/production-standard";

const ROOT = process.cwd();
const CURRICULA = join(ROOT, "lib", "academy", "curricula");

function relPosix(file: string): string {
  return relative(ROOT, file).replaceAll("\\", "/");
}

function walkTs(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walkTs(full, out);
      continue;
    }
    if (entry.endsWith(".ts")) out.push(full);
  }
}

function sectionNumber(name: string): number | null {
  const match = /^section_(\d+)\.ts$/u.exec(name);
  if (!match?.[1]) return null;
  const value = Number(match[1]);
  return Number.isInteger(value) ? value : null;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function scanCurriculumSources(): string[] {
  const issues: string[] = [];
  const files: string[] = [];
  walkTs(CURRICULA, files);

  for (const file of files) {
    try {
      assertAcademyUtf8SourceBytes(readFileSync(file), relPosix(file));
    } catch (error) {
      issues.push(messageOf(error));
    }
  }

  if (issues.length > 0) return issues;

  const decoder = new TextDecoder("utf-8", { fatal: true });
  const pr105 = join(CURRICULA, "pr-105");
  const pr105Sections = readdirSync(pr105)
    .map((name) => ({ name, number: sectionNumber(name) }))
    .filter((row): row is { name: string; number: number } => row.number !== null)
    .sort((a, b) => a.number - b.number);

  try {
    assertAcademyAiLessonCount(pr105Sections.length, "PR-105");
  } catch (error) {
    issues.push(messageOf(error));
  }

  for (let n = 1; n <= ACADEMY_AI_LESSON_COUNT_MIN; n += 1) {
    if (!pr105Sections.some((row) => row.number === n)) {
      issues.push(`PR-105 section_${n}.ts yok. Fail-closed. Fırın açılmaz.`);
    }
  }

  const seen = new Set<string>();
  for (const row of pr105Sections) {
    const file = join(pr105, row.name);
    seen.add(file);
    const label = relPosix(file);
    const source = decoder.decode(readFileSync(file));
    if (/PR105_SPOKEN_MARKDOWN|pr105SpokenMarkdown/u.test(source)) {
      issues.push(`${label} konuşma metni dolaylı haritadan okunuyor. Fail-closed. Fırın açılmaz.`);
      continue;
    }
    try {
      const words = assertAcademySectionSpokenScriptSource(source, label);
      console.log(`${label}: ${words} kelime, UTF-8 BOM'suz.`);
    } catch (error) {
      issues.push(messageOf(error));
    }
  }

  for (const file of files) {
    if (seen.has(file)) continue;
    const name = file.split(/[/\\]/u).at(-1) ?? "";
    if (sectionNumber(name) === null) continue;
    const source = decoder.decode(readFileSync(file));
    if (!source.includes("const spokenScript")) continue;
    const label = relPosix(file);
    try {
      const words = assertAcademySectionSpokenScriptSource(source, label);
      console.log(`${label}: ${words} kelime, UTF-8 BOM'suz.`);
    } catch (error) {
      issues.push(messageOf(error));
    }
  }

  console.log(`UTF-8: ${files.length} müfredat dosyası tarandı. BOM yok. Uyumsuz bayt yok.`);
  return issues;
}

async function main(): Promise<void> {
  const sourceIssues = scanCurriculumSources();
  if (sourceIssues.length > 0) {
    for (const issue of sourceIssues) console.error(issue);
    console.error("HATA: ders tabanı, kelime tabanı veya UTF-8 mühürü tutulmadı. Fail-closed. Fırın açılmaz.");
    process.exit(1);
  }

  const { academyCurriculumFloorReport, academyLiveCurriculumFloorCourses, academyLiveCurriculumFloorViolations } =
    await import("@/lib/academy/curriculum-floor");

  const courses = academyLiveCurriculumFloorCourses();
  const report = academyCurriculumFloorReport(courses);

  for (const row of report) {
    if (row.skipped) {
      console.log(`${row.label}: bölüm yok. İskelet. Kapı ilk ders yazılınca açılır.`);
      continue;
    }
    console.log(
      `${row.label}: ${row.lessonCount} ders, ${row.totalWords} kelime, sakin konuşma ${row.totalMinutes} dk.`,
    );
    for (const lesson of row.lessons) {
      console.log(`  ${lesson.key}: ${lesson.words} kelime, ${lesson.minutes} dk.`);
    }
  }

  const issues = academyLiveCurriculumFloorViolations();
  if (issues.length > 0) {
    for (const issue of issues) {
      console.error(issue);
    }
    console.error("HATA: ders tabanı veya kelime tabanı tutulmadı. Fail-closed. Fırın açılmaz.");
    process.exit(1);
  }

  console.log("OK: yazılmış eğitimler en az 6 ders ve ders başı 600 kelime. UTF-8 mühür sağlam.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  console.error("HATA: ders tabanı, kelime tabanı veya UTF-8 mühürü tutulmadı. Fail-closed. Fırın açılmaz.");
  process.exit(1);
});
