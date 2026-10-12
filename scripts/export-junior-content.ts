/**
 * Yazarlık senaryosunu ve quiz paketini JSON'a basar. Takvim ve kabları plandan yazar.
 * TypeScript kaynak dosyasına dokunmaz. Quiz üreticisini çalıştırmaz.
 * JSON elle düzeltilmez; sonraki dışa aktarım o düzeltmeyi siler.
 * Müfredat dışı arşiv numaraları kadroda yoktur.
 *
 *   npm run export:junior-content
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { buildJuniorContentPlan, plannedShellCount } from "../packages/junior-content/src/plan";
import { JUNIOR_SEALED_ROSTER, juniorSealedScenarioCount } from "../packages/junior-content/src/sealed-roster";
import type { JuniorScenarioFile } from "../packages/junior-content/schema/topic";

const ROOT = join(import.meta.dirname, "..");
const PACKAGE_ROOT = join(ROOT, "packages", "junior-content");

function writeJson(path: string, value: unknown) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function canonicalScenario(input: {
  key: string;
  title: string;
  teaser: string;
  welcome: string;
  concept: string;
  example: string;
  warning: string;
  hint?: "trap" | "gold";
  life: string;
  recap: readonly [string, string, string];
  conceptSeal: string;
  voiceSeal: string;
  echoPrompt?: string;
  outcomes: readonly string[];
  scene: string;
  parentNote?: string;
  band?: "draft";
}): JuniorScenarioFile {
  const scenario: JuniorScenarioFile = {
    key: input.key,
    title: input.title,
    teaser: input.teaser,
    welcome: input.welcome,
    concept: input.concept,
    example: input.example,
    warning: input.warning,
    life: input.life,
    recap: [input.recap[0], input.recap[1], input.recap[2]],
    conceptSeal: input.conceptSeal,
    voiceSeal: input.voiceSeal,
    outcomes: [...input.outcomes],
    scene: input.scene,
  };
  if (input.hint) {
    scenario.hint = input.hint;
  }
  if (input.echoPrompt) {
    scenario.echoPrompt = input.echoPrompt;
  }
  if (input.parentNote) {
    scenario.parentNote = input.parentNote;
  }
  if (input.band) {
    scenario.band = input.band;
  }
  return scenario;
}

function isScenario(value: unknown): value is Parameters<typeof canonicalScenario>[0] {
  return Boolean(
    value &&
      typeof value === "object" &&
      "welcome" in value &&
      "conceptSeal" in value &&
      "key" in value,
  );
}

function isQuiz(value: unknown): value is { lessonKey: string; questions: unknown[] } {
  return Boolean(value && typeof value === "object" && "lessonKey" in value && "questions" in value);
}

async function main() {
  const plan = buildJuniorContentPlan();
  const shells = plannedShellCount();
  writeJson(join(PACKAGE_ROOT, "calendar", "school-weeks.json"), plan.weeks);
  let scenarios = 0;
  let quizzes = 0;
  for (const course of Object.values(plan.courses)) {
    const mebName = course.file.course === "jr_06_ing_main" ? "ing" : course.file.course.replace("jr_06_", "");
    writeJson(join(PACKAGE_ROOT, "meb", "2026-2027", `${mebName}.json`), course.file);
    writeJson(join(PACKAGE_ROOT, "calendar", `${course.file.course}.json`), course.topics);
    for (const item of course.shells) {
      writeJson(join(PACKAGE_ROOT, "topics", `${item.key}.json`), {
        shell: true,
        key: item.key,
        title: item.title,
        teaser: item.teaser,
        outcomeCodes: item.outcomeCodes,
        band: "tymm",
      });
    }
  }
  for (const course of JUNIOR_SEALED_ROSTER) {
    for (const n of course.numbers) {
      const key = `${course.prefix}-${n}`;
      const content = (await import(`../lib/junior/content/${course.dir}/${n}.ts`)) as Record<string, unknown>;
      const scenario = Object.values(content).find(isScenario);
      if (!scenario || scenario.key !== key) {
        throw new Error(`${key} senaryosu okunamadı.`);
      }
      writeJson(join(PACKAGE_ROOT, "topics", `${key}.json`), canonicalScenario(scenario));
      scenarios += 1;
      const quizMod = (await import(`../lib/junior/quiz/${course.quizDir}/${n}.ts`)) as Record<string, unknown>;
      const quiz = Object.values(quizMod).find(isQuiz);
      if (!quiz || quiz.lessonKey !== key) {
        throw new Error(`${key} quiz paketi okunamadı.`);
      }
      writeJson(join(PACKAGE_ROOT, "quiz", `${key}.json`), quiz);
      quizzes += 1;
    }
  }
  console.log(
    `export:junior-content OK — ${scenarios} senaryo (kadros ${juniorSealedScenarioCount()}), ${quizzes} quiz, ${shells} kab, takvim ${plan.weeks.length} hafta.`,
  );
}

const invoked = process.argv[1]?.replaceAll("\\", "/").endsWith("scripts/export-junior-content.ts");
if (invoked) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
