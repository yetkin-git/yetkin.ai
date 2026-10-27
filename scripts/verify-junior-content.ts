/**
 * Junior içerik paketi kapısı.
 * JSON şemadan geçer, mühürlü senaryo TypeScript ile birebir kalır, anlatım bandı lib/junior içindedir.
 * Eksik çıktı listesi bilgi verir; derlemeyi kırmaz.
 *
 *   npm run verify:junior-content
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { JUNIOR_AUDIO_MANIFEST } from "@/lib/junior/audio-manifest.generated";
import { JUNIOR_NARRATION_MAX_MS, JUNIOR_NARRATION_MIN_MS } from "@/lib/junior/player-clock";
import { juniorLessonFromScenario, juniorNarrationDurationMs, type JuniorLessonScenario } from "@/lib/junior/scenario";
import { JUNIOR_VECTOR_SCENES, type JuniorVectorScene } from "@/lib/junior/types";
import { activeLessonKeys } from "../packages/junior-content/src/place";
import { buildJuniorContentPlan, plannedShellCount } from "../packages/junior-content/src/plan";
import { JUNIOR_ELECTIVE_QUIZ_ROSTER } from "../packages/junior-content/src/elective-roster";
import { JUNIOR_SEALED_ROSTER, juniorSealedScenarioCount } from "../packages/junior-content/src/sealed-roster";
import { mebCourseFileSchema } from "../packages/junior-content/schema/meb-outcome";
import {
  JUNIOR_ELECTIVE_LESSON_KEY_PATTERN,
  JUNIOR_LESSON_KEY_PATTERN,
  juniorQuizFileSchema,
  juniorScenarioActivitiesSchema,
  juniorScenarioSchema,
  juniorShellSchema,
  schoolWeekSchema,
  topicCalendarSchema,
} from "../packages/junior-content/schema/topic";
import { MAT_5_DRAFT_TIMELINE } from "@/lib/junior/pilot-engine/mat-1.choreography";
import { MAT_6_DRAFT_TIMELINE } from "@/lib/junior/pilot-engine/mat-6.choreography";
import { JR_06_MAT_5_TIMELINE, JR_06_MAT_6_TIMELINE } from "@/lib/junior/pilot-engine/mat-5-timeline-loader";
import {
  assertSealedMat6Timeline,
  assertSealedPilotTimeline,
  pilotTimelineUsesDraftClock,
} from "@/lib/junior/pilot-engine/timeline-seal";
import { collapseJuniorSpeech, readLockedJuniorCueCassette } from "@/lib/junior/cue-cassette";
import { juniorSealedCourseLessons } from "@/lib/junior/content-source";
import { canonicalScenario, exportedScenario } from "./export-junior-content";

const ROOT = join(import.meta.dirname, "..");
const PACKAGE_ROOT = join(ROOT, "packages", "junior-content");
const KEY = JUNIOR_LESSON_KEY_PATTERN;

const issues: string[] = [];

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function same(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function isScenario(value: unknown): value is Parameters<typeof canonicalScenario>[0] {
  return Boolean(value && typeof value === "object" && "welcome" in value && "conceptSeal" in value && "key" in value);
}

function isQuiz(value: unknown): value is {
  lessonKey: string;
  title: string;
  tellGuides: string[];
  questions: {
    id: string;
    level: "concept" | "apply" | "skill";
    question: string;
    options: [string, string, string, string];
    correctAnswerIndex: 0 | 1 | 2 | 3;
    hint: string;
    explanation: string;
  }[];
} {
  return Boolean(value && typeof value === "object" && "lessonKey" in value && "questions" in value);
}

function canonicalQuiz(quiz: {
  lessonKey: string;
  title: string;
  tellGuides: readonly string[];
  questions: readonly {
    id: string;
    level: "concept" | "apply" | "skill";
    question: string;
    options: readonly string[];
    correctAnswerIndex: 0 | 1 | 2 | 3;
    hint: string;
    explanation: string;
  }[];
}) {
  return {
    lessonKey: quiz.lessonKey,
    title: quiz.title,
    tellGuides: [...quiz.tellGuides],
    questions: quiz.questions.map((question) => ({
      id: question.id,
      level: question.level,
      question: question.question,
      options: [...question.options],
      correctAnswerIndex: question.correctAnswerIndex,
      hint: question.hint,
      explanation: question.explanation,
    })),
  };
}

async function main() {
  const plan = buildJuniorContentPlan();
  const weeks = schoolWeekSchema.array().parse(readJson(join(PACKAGE_ROOT, "calendar", "school-weeks.json")));
  if (!same(weeks, plan.weeks)) {
    issues.push("calendar/school-weeks.json planla aynı değil.");
  }
  const weekKind = new Map(weeks.map((week) => [week.week, week.kind]));
  const topicKeys = new Set<string>();
  const scenarioKeys = new Set<string>();
  let shells = 0;
  const coverage: string[] = [];

  for (const name of readdirSync(join(PACKAGE_ROOT, "topics"))) {
    if (!name.endsWith(".json")) {
      continue;
    }
    const key = name.slice(0, -".json".length);
    if (!KEY.test(key)) {
      issues.push(`konu anahtarı biçimi: ${key}`);
    }
    if (topicKeys.has(key)) {
      issues.push(`yinelenen konu: ${key}`);
    }
    topicKeys.add(key);
    const json = readJson(join(PACKAGE_ROOT, "topics", name));
    const shell = juniorShellSchema.safeParse(json);
    if (shell.success) {
      shells += 1;
      if (shell.data.key !== key) {
        issues.push(`${key} kab anahtarı dosya adıyla aynı değil.`);
      }
      continue;
    }
    const parsed = juniorScenarioSchema.safeParse(json);
    if (!parsed.success) {
      issues.push(`${key} senaryo şeması: ${parsed.error.issues[0]?.message ?? "bozuk"}`);
      continue;
    }
    if (parsed.data.key !== key) {
      issues.push(`${key} senaryo anahtarı dosya adıyla aynı değil.`);
    }
    scenarioKeys.add(key);
    try {
      if (!(JUNIOR_VECTOR_SCENES as readonly string[]).includes(parsed.data.scene)) {
        throw new Error(`${key} sahne kimliği katalogda yok.`);
      }
      const lesson = juniorLessonFromScenario({
        ...parsed.data,
        scene: parsed.data.scene as JuniorVectorScene,
      } satisfies JuniorLessonScenario);
      const durationMs = juniorNarrationDurationMs(lesson.mebNote, lesson.lifeUse);
      if (durationMs < JUNIOR_NARRATION_MIN_MS || durationMs > JUNIOR_NARRATION_MAX_MS) {
        issues.push(`${key} anlatımı bant dışında.`);
      }
    } catch (error) {
      issues.push(`${key} anlatım mührü: ${error instanceof Error ? error.message : "hata"}`);
    }
  }

  const expectedShells = plannedShellCount();
  if (shells !== expectedShells) {
    issues.push(`kab sayısı ${shells}, plan ${expectedShells}.`);
  }
  const expectedScenarios = juniorSealedScenarioCount();
  const coreScenarioCount = [...scenarioKeys].filter((key) => !JUNIOR_ELECTIVE_LESSON_KEY_PATTERN.test(key)).length;
  if (coreScenarioCount !== expectedScenarios) {
    issues.push(`senaryo sayısı ${coreScenarioCount}, ${expectedScenarios} beklenir.`);
  }

  for (const course of JUNIOR_SEALED_ROSTER) {
    const meb = mebCourseFileSchema.safeParse(readJson(join(PACKAGE_ROOT, "meb", "2026-2027", `${course.meb}.json`)));
    if (!meb.success) {
      issues.push(`${course.meb}.json şeması: ${meb.error.issues[0]?.message ?? "bozuk"}`);
      continue;
    }
    const planned = plan.courses[course.slug];
    if (!same(meb.data, planned.file)) {
      issues.push(`${course.meb}.json planla aynı değil.`);
    }
    const calendar = topicCalendarSchema.array().safeParse(readJson(join(PACKAGE_ROOT, "calendar", `${course.slug}.json`)));
    if (!calendar.success) {
      issues.push(`${course.slug} takvimi: ${calendar.error.issues[0]?.message ?? "bozuk"}`);
      continue;
    }
    if (!same(calendar.data, planned.topics)) {
      issues.push(`${course.slug} takvimi planla aynı değil.`);
    }
    const codes = new Set(meb.data.outcomes.map((outcome) => outcome.outcomeCode));
    const seen = new Set<string>();
    let hourSum = 0;
    for (const topic of calendar.data) {
      if (seen.has(topic.lessonKey)) {
        issues.push(`${course.slug} takviminde yinelenen ${topic.lessonKey}`);
      }
      seen.add(topic.lessonKey);
      if (!topicKeys.has(topic.lessonKey)) {
        issues.push(`${topic.lessonKey} takvimde var, JSON konusu yok.`);
      }
      if (topic.band === "legacy-2018" && topic.outcomeCodes.length > 0) {
        issues.push(`${topic.lessonKey} legacy bandında çıktı kodu var.`);
      }
      if (topic.band === "tymm" && topic.outcomeCodes.length === 0) {
        issues.push(`${topic.lessonKey} tymm bandında çıktı kodu yok.`);
      }
      for (const code of topic.outcomeCodes) {
        if (!codes.has(code)) {
          issues.push(`${topic.lessonKey} bilinmeyen çıktı ${code}`);
        }
      }
      if (topic.startWeek === 0 || topic.endWeek === 0) {
        if (topic.startWeek !== 0 || topic.endWeek !== 0) {
          issues.push(`${topic.lessonKey} hafta aralığı yarım.`);
        }
      } else if (weekKind.get(topic.startWeek) !== "teach" || weekKind.get(topic.endWeek) !== "teach") {
        issues.push(`${topic.lessonKey} uç haftası teach değil.`);
      }
      hourSum += topic.hours;
    }
    if (hourSum > meb.data.programHours) {
      issues.push(`${course.slug} saat toplamı ${hourSum}, tavan ${meb.data.programHours}.`);
    }
    for (const [week, kind] of weekKind) {
      if (kind === "teach") {
        continue;
      }
      const active = activeLessonKeys(calendar.data, week, kind);
      if (active.length > 0) {
        issues.push(`${course.slug} ${week}. hafta (${kind}) konu taşıyor: ${active.join(", ")}`);
      }
    }
    for (const outcome of meb.data.outcomes) {
      if (outcome.hours <= 0 || !outcome.processOpen) {
        continue;
      }
      coverage.push(`${outcome.outcomeCode} ${outcome.outcomeTitle}`);
    }
    for (const n of course.numbers) {
      const key = `${course.prefix}-${n}`;
      const content = (await import(`../lib/junior/content/${course.dir}/${n}.ts`)) as Record<string, unknown>;
      const scenario = Object.values(content).find(isScenario);
      const onDisk = scenarioKeys.has(key) ? juniorScenarioSchema.parse(readJson(join(PACKAGE_ROOT, "topics", `${key}.json`))) : null;
      const expected = scenario ? exportedScenario(scenario) : null;
      const actual = onDisk
        ? {
            ...canonicalScenario(onDisk),
            ...(onDisk.activities
              ? { activities: juniorScenarioActivitiesSchema.parse(onDisk.activities) }
              : {}),
          }
        : null;
      if (!scenario || !onDisk || !expected || !actual || !same(expected, actual)) {
        issues.push(`${key} senaryosu TypeScript ile aynı değil.`);
      }
      const quizMod = (await import(`../lib/junior/quiz/${course.quizDir}/${n}.ts`)) as Record<string, unknown>;
      const quiz = Object.values(quizMod).find(isQuiz);
      const quizPath = join(PACKAGE_ROOT, "quiz", `${key}.json`);
      const quizJson = juniorQuizFileSchema.safeParse(readJson(quizPath));
      if (!quizJson.success) {
        issues.push(`${key} quiz şeması: ${quizJson.error.issues[0]?.message ?? "bozuk"}`);
      } else if (quizJson.data.lessonKey !== key) {
        issues.push(`${key} quiz anahtarı konu anahtarıyla aynı değil.`);
      } else if (!quiz || !same(canonicalQuiz(quiz), canonicalQuiz(quizJson.data))) {
        issues.push(`${key} quiz TypeScript ile aynı değil.`);
      }
    }
  }

  const { juniorElectiveScenarios } = await import("../lib/junior/elective-catalog");
  const electiveScenarios = juniorElectiveScenarios();
  const electiveKeys = new Set(electiveScenarios.map((scenario) => scenario.key));
  const diskElective = [...scenarioKeys].filter((key) => JUNIOR_ELECTIVE_LESSON_KEY_PATTERN.test(key));
  if (diskElective.length !== electiveKeys.size || diskElective.some((key) => !electiveKeys.has(key))) {
    issues.push("seçmeli senaryo anahtarları katalogla aynı değil.");
  }
  for (const scenario of electiveScenarios) {
    const quizPath = join(PACKAGE_ROOT, "quiz", `${scenario.key}.json`);
    const topicPath = join(PACKAGE_ROOT, "topics", `${scenario.key}.json`);
    const onDisk = juniorScenarioSchema.safeParse(readJson(topicPath));
    if (!onDisk.success) {
      issues.push(`${scenario.key} seçmeli senaryo şeması: ${onDisk.error.issues[0]?.message ?? "bozuk"}`);
      continue;
    }
    if (!same(canonicalScenario(scenario), canonicalScenario(onDisk.data))) {
      issues.push(`${scenario.key} seçmeli senaryosu katalogla aynı değil.`);
    }
    const quizJson = juniorQuizFileSchema.safeParse(readJson(quizPath));
    if (!quizJson.success) {
      issues.push(`${scenario.key} seçmeli quiz şeması: ${quizJson.error.issues[0]?.message ?? "bozuk"}`);
    }
  }
  for (const course of JUNIOR_ELECTIVE_QUIZ_ROSTER) {
    for (const n of course.numbers) {
      const key = `${course.prefix}-${n}`;
      const quizMod = (await import(`../lib/junior/quiz/elective/${course.dir}/${n}.ts`)) as Record<string, unknown>;
      const quiz = Object.values(quizMod).find(isQuiz);
      const quizPath = join(PACKAGE_ROOT, "quiz", `${key}.json`);
      const quizJson = juniorQuizFileSchema.safeParse(readJson(quizPath));
      if (!quizJson.success) {
        issues.push(`${key} seçmeli quiz şeması: ${quizJson.error.issues[0]?.message ?? "bozuk"}`);
      } else if (!quiz || !same(canonicalQuiz(quiz), canonicalQuiz(quizJson.data))) {
        issues.push(`${key} seçmeli quiz TypeScript ile aynı değil.`);
      }
    }
  }

  for (const name of readdirSync(join(PACKAGE_ROOT, "quiz"))) {
    if (!name.endsWith(".json")) {
      continue;
    }
    const key = name.slice(0, -".json".length);
    if (!scenarioKeys.has(key)) {
      issues.push(`${key} quiz var, senaryo yok.`);
    }
  }

  for (const key of Object.keys(JUNIOR_AUDIO_MANIFEST)) {
    if (!topicKeys.has(key)) {
      issues.push(`ses manifesti ${key} JSON konusunda yok.`);
    }
  }

  try {
    assertSealedPilotTimeline(JR_06_MAT_5_TIMELINE);
  } catch (error) {
    issues.push(error instanceof Error ? error.message : "pilot zaman çizelgesi mühürlenemedi.");
  }
  if (pilotTimelineUsesDraftClock(JR_06_MAT_5_TIMELINE, MAT_5_DRAFT_TIMELINE)) {
    issues.push("jr_06_mat-1 zaman çizelgesi taslak saatte. Oynatıcı mühürlü PCM saatini okur.");
  }
  try {
    assertSealedMat6Timeline(JR_06_MAT_6_TIMELINE);
  } catch (error) {
    issues.push(error instanceof Error ? error.message : "jr_06_mat-2 zaman çizelgesi mühürlenemedi.");
  }
  if (pilotTimelineUsesDraftClock(JR_06_MAT_6_TIMELINE, MAT_6_DRAFT_TIMELINE)) {
    issues.push("jr_06_mat-2 zaman çizelgesi taslak saatte. Oynatıcı mühürlü PCM saatini okur.");
  }

  for (const course of JUNIOR_SEALED_ROSTER) {
    for (const lesson of juniorSealedCourseLessons(course.slug)) {
      const spoken = readLockedJuniorCueCassette(lesson.key);
      if (!spoken) {
        continue;
      }
      if (collapseJuniorSpeech(lesson.listenText) !== spoken) {
        issues.push(`${lesson.key} kaseti kilitli altyazı ile aynı değil.`);
      }
    }
  }

  if (issues.length > 0) {
    console.error("verify:junior-content BAŞARISIZ");
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }
  console.log(
    `verify:junior-content OK — ${juniorSealedScenarioCount()} senaryo eşit, ${expectedShells} kab, takvim planla aynı. Kapsama bilgisi ${coverage.length} açık çıktı (derlemeyi kırmaz).`,
  );
  for (const line of coverage) {
    console.log(`  açık: ${line}`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
