/**
 * 105 Junior dersinin metin kalitesi, MEB derinliği ve yardımcı kaynak katman raporu.
 *
 *   npm run verify:content-quality
 *   npm run verify:content-quality -- --strict
 *
 * Rapor: docs/ICERIK_KALITE_RAPORU.md
 * Mantık bulgusu varken varsayılan çıkış 0'dır. `--strict` çıkışı 1 yapar.
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { mebCourseFileSchema } from "../schema/meb-outcome";
import { juniorQuizFileSchema, juniorScenarioSchema, juniorShellSchema, topicCalendarSchema } from "../schema/topic";
import {
  JUNIOR_WRITTEN_LESSON_COUNT,
  collectCliches,
  collectDuplicates,
  collectOpenings,
  compareLessonKeys,
  renderContentQualityReport,
  scanLessonText,
  scoreDepthBand,
  scoreOutcomes,
  scoreWrittenLesson,
  type CourseId,
  type LessonField,
  type OutcomeRef,
  type ShellLesson,
  type QuizStem,
  type SkillProbe,
  type TextFinding,
  type WrittenLesson,
} from "./content-quality";

const PACKAGE_ROOT = join(import.meta.dirname, "..");
const REPO_ROOT = join(PACKAGE_ROOT, "..", "..");
const REPORT_PATH = join(REPO_ROOT, "docs", "ICERIK_KALITE_RAPORU.md");

const COURSES: readonly { id: CourseId; meb: string; calendar: string }[] = [
  { id: "mat", meb: "mat.json", calendar: "jr_06_mat.json" },
  { id: "fen", meb: "fen.json", calendar: "jr_06_fen.json" },
  { id: "turkce", meb: "turkce.json", calendar: "jr_06_turkce.json" },
  { id: "ing", meb: "ing.json", calendar: "jr_06_ing_main.json" },
  { id: "sosyal", meb: "sosyal.json", calendar: "jr_06_sosyal.json" },
];

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function courseOf(key: string): CourseId | null {
  if (key.startsWith("jr_06_mat-")) {
    return "mat";
  }
  if (key.startsWith("jr_06_fen-")) {
    return "fen";
  }
  if (key.startsWith("jr_06_turkce-")) {
    return "turkce";
  }
  if (key.startsWith("jr_06_ing_main-")) {
    return "ing";
  }
  if (key.startsWith("jr_06_sosyal-")) {
    return "sosyal";
  }
  return null;
}

function scenarioFields(data: {
  teaser: string;
  welcome: string;
  concept: string;
  example: string;
  warning: string;
  life: string;
  recap: readonly string[];
  conceptSeal: string;
  voiceSeal: string;
  echoPrompt?: string;
  outcomes: readonly string[];
  parentNote?: string;
}): LessonField[] {
  const fields: LessonField[] = [
    { name: "teaser", text: data.teaser },
    { name: "welcome", text: data.welcome },
    { name: "concept", text: data.concept },
    { name: "example", text: data.example },
    { name: "warning", text: data.warning },
    { name: "life", text: data.life },
    { name: "recap", text: data.recap.join(" ") },
    { name: "conceptSeal", text: data.conceptSeal },
    { name: "voiceSeal", text: data.voiceSeal },
    { name: "outcomes", text: data.outcomes.join(" ") },
  ];
  if (data.echoPrompt) {
    fields.push({ name: "echoPrompt", text: data.echoPrompt });
  }
  if (data.parentNote) {
    fields.push({ name: "parentNote", text: data.parentNote });
  }
  return fields;
}

function skillFromQuiz(path: string): { skill: SkillProbe | null; quizText: string; stems: QuizStem[] } {
  if (!existsSync(path)) {
    return { skill: null, quizText: "", stems: [] };
  }
  const parsed = juniorQuizFileSchema.parse(readJson(path));
  const skill = parsed.questions.find((question) => question.level === "skill");
  const apply = parsed.questions.find((question) => question.level === "apply");
  const quizText = parsed.questions.map((question) => `${question.question} ${question.hint} ${question.explanation}`).join("\n");
  const stems = parsed.questions.map((question) => ({ level: question.level, question: question.question }));
  if (!skill) {
    return { skill: null, quizText, stems };
  }
  return {
    skill: {
      question: skill.question,
      correctOption: skill.options[skill.correctAnswerIndex] ?? "",
      explanation: skill.explanation,
      applyCorrectOption: apply ? (apply.options[apply.correctAnswerIndex] ?? "") : "",
    },
    quizText,
    stems,
  };
}

function load(): { written: WrittenLesson[]; shells: ShellLesson[]; outcomes: OutcomeRef[]; findings: TextFinding[] } {
  const calendar = new Map<string, { band: "tymm" | "legacy-2018"; hours: number; outcomeCodes: string[] }>();
  const outcomes: OutcomeRef[] = [];
  for (const course of COURSES) {
    const meb = mebCourseFileSchema.parse(readJson(join(PACKAGE_ROOT, "meb", "2026-2027", course.meb)));
    for (const outcome of meb.outcomes) {
      outcomes.push({
        course: course.id,
        outcomeCode: outcome.outcomeCode,
        outcomeTitle: outcome.outcomeTitle,
        hours: outcome.hours,
        processOpen: outcome.processOpen,
      });
    }
    const rows = topicCalendarSchema.array().parse(readJson(join(PACKAGE_ROOT, "calendar", course.calendar)));
    for (const row of rows) {
      calendar.set(row.lessonKey, {
        band: row.band,
        hours: row.hours,
        outcomeCodes: [...row.outcomeCodes],
      });
    }
  }

  const written: WrittenLesson[] = [];
  const shells: ShellLesson[] = [];
  const findings: TextFinding[] = [];
  for (const name of readdirSync(join(PACKAGE_ROOT, "topics"))) {
    if (!name.endsWith(".json")) {
      continue;
    }
    const key = name.slice(0, -".json".length);
    const course = courseOf(key);
    if (!course) {
      continue;
    }
    const json = readJson(join(PACKAGE_ROOT, "topics", name));
    const placed = calendar.get(key);
    const shell = juniorShellSchema.safeParse(json);
    if (shell.success) {
      shells.push({
        key,
        title: shell.data.title,
        course,
        hours: placed?.hours ?? 0,
        outcomeCodes: placed?.outcomeCodes ?? shell.data.outcomeCodes,
      });
      continue;
    }
    const scenario = juniorScenarioSchema.parse(json);
    const fields = scenarioFields(scenario);
    const quiz = skillFromQuiz(join(PACKAGE_ROOT, "quiz", `${key}.json`));
    if (quiz.quizText) {
      fields.push({ name: "quiz", text: quiz.quizText });
    }
    const lesson: WrittenLesson = {
      key,
      title: scenario.title,
      course,
      band: placed?.band ?? null,
      hours: placed?.hours ?? 0,
      outcomeCodes: placed?.outcomeCodes ?? [],
      fields,
      concept: scenario.concept,
      example: scenario.example,
      warning: scenario.warning,
      recap: scenario.recap.join(" "),
      life: scenario.life,
      skill: quiz.skill,
      quizQuestions: quiz.stems,
    };
    written.push(lesson);
    findings.push(...scanLessonText(lesson));
  }

  written.sort((left, right) => compareLessonKeys(left.key, right.key));
  shells.sort((left, right) => compareLessonKeys(left.key, right.key));
  return { written, shells, outcomes, findings };
}

function runLabel(): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Istanbul",
  }).format(new Date());
}

function main(): void {
  const strict = process.argv.includes("--strict");
  const loaded = load();
  const lessons = loaded.written.map((lesson) => scoreWrittenLesson(lesson, loaded.outcomes));
  const depths = loaded.written.map((lesson) => scoreDepthBand(lesson));
  const markdown = renderContentQualityReport({
    runLabel: runLabel(),
    writtenCount: loaded.written.length,
    shellCount: loaded.shells.length,
    findings: loaded.findings,
    cliches: collectCliches(loaded.written),
    openings: collectOpenings(loaded.written),
    duplicates: collectDuplicates(loaded.written),
    lessons,
    outcomes: scoreOutcomes(loaded.outcomes, lessons, loaded.written, loaded.shells),
    depths,
  });
  writeFileSync(REPORT_PATH, markdown, "utf8");
  const logic = loaded.findings.filter((finding) => finding.code !== "benzetme-kalinti").length;
  const analogy = loaded.findings.length;
  const layerOne = depths.filter((depth) => depth.ceiling === "katman-1").length;
  const raise = depths.filter((depth) => depth.ceiling !== "katman-3").length;
  console.log(
    `verify:content-quality — ${loaded.written.length} senaryo, ${loaded.shells.length} kab, mantık ${logic}, benzetme ${analogy}, katman-1 ${layerOne}, yükseltilecek ${raise}. Rapor: docs/ICERIK_KALITE_RAPORU.md`,
  );
  if (loaded.written.length !== JUNIOR_WRITTEN_LESSON_COUNT) {
    console.error(`Yazılı senaryo ${loaded.written.length}. Beklenen ${JUNIOR_WRITTEN_LESSON_COUNT}.`);
    process.exit(2);
  }
  if (strict && loaded.findings.length > 0) {
    process.exit(1);
  }
}

const invoked = process.argv[1]?.replaceAll("\\", "/").endsWith("packages/junior-content/src/verify-content-quality.ts");
if (invoked) {
  main();
}
