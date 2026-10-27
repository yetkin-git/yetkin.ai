import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { juniorCalendarBundle } from "@yetkin/junior-content/calendar";
import type { JuniorCourseSlug } from "@yetkin/junior-content";
import {
  JUNIOR_ELECTIVE_LESSON_KEY_PATTERN,
  juniorQuizFileSchema,
  juniorScenarioSchema,
  juniorShellSchema,
} from "@yetkin/junior-content/schema/topic";
import type { JuniorContentSource } from "@/lib/junior/meb";
import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";
import { readLockedJuniorCueCassette } from "@/lib/junior/cue-cassette";
import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";
import { JUNIOR_VECTOR_SCENES, type JuniorLessonScript, type JuniorVectorScene } from "@/lib/junior/types";
import { juniorLessonHasBakedAudio } from "@/lib/junior/voice";

const PACKAGE_ROOT = join(process.cwd(), "packages", "junior-content");

type Loaded = {
  scenarios: Map<string, JuniorLessonScenario>;
  shells: Set<string>;
  quizzes: Map<string, JuniorLessonQuizPack>;
  scripts: Map<string, JuniorLessonScript>;
};

let loaded: Loaded | null = null;

function toLessonScenario(input: {
  key: string;
  title: string;
  teaser: string;
  welcome: string;
  concept: string;
  example: string;
  warning: string;
  heroQuestion?: string;
  heroFocus?: string;
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
}): JuniorLessonScenario {
  if (!(JUNIOR_VECTOR_SCENES as readonly string[]).includes(input.scene)) {
    throw new Error(`${input.key} sahne kimliği katalogda yok.`);
  }
  return { ...input, scene: input.scene as JuniorVectorScene };
}

function lessonNumber(lessonKey: string): number {
  const suffix = lessonKey.slice(lessonKey.lastIndexOf("-") + 1);
  const value = Number(suffix);
  if (!Number.isInteger(value)) {
    throw new Error(`${lessonKey} numarası okunamadı.`);
  }
  return value;
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function load(): Loaded {
  if (loaded) {
    return loaded;
  }
  const scenarios = new Map<string, JuniorLessonScenario>();
  const shells = new Set<string>();
  const quizzes = new Map<string, JuniorLessonQuizPack>();
  for (const name of readdirSync(join(PACKAGE_ROOT, "topics"))) {
    if (!name.endsWith(".json")) {
      continue;
    }
    const json = readJson(join(PACKAGE_ROOT, "topics", name));
    const shell = juniorShellSchema.safeParse(json);
    if (shell.success) {
      shells.add(shell.data.key);
      continue;
    }
    const scenario = juniorScenarioSchema.parse(json);
    scenarios.set(scenario.key, toLessonScenario(scenario));
  }
  for (const name of readdirSync(join(PACKAGE_ROOT, "quiz"))) {
    if (!name.endsWith(".json")) {
      continue;
    }
    const quiz = juniorQuizFileSchema.parse(readJson(join(PACKAGE_ROOT, "quiz", name)));
    quizzes.set(quiz.lessonKey, quiz);
  }
  loaded = { scenarios, shells, quizzes, scripts: new Map() };
  return loaded;
}

function authoredKeys(slug: JuniorCourseSlug): string[] {
  const prefix = `${slug}-`;
  return [...load().scenarios.keys()]
    .filter((key) => key.startsWith(prefix))
    .sort((left, right) => lessonNumber(left) - lessonNumber(right));
}

/** Vitrin ve hop. Yazarlık JSON'u daha geniş olabilir; sesi fırınlanmamış ders rafa girmez. */
function sealedKeys(slug: JuniorCourseSlug): string[] {
  return authoredKeys(slug).filter((key) => juniorLessonHasBakedAudio(key));
}

function scriptFor(lessonKey: string): JuniorLessonScript {
  const state = load();
  const cached = state.scripts.get(lessonKey);
  if (cached) {
    return cached;
  }
  const assembled = juniorLessonFromScenario(state.scenarios.get(lessonKey) ?? missingScenario(lessonKey));
  const spoken = readLockedJuniorCueCassette(lessonKey);
  const lesson = spoken ? { ...assembled, listenText: spoken } : assembled;
  state.scripts.set(lessonKey, lesson);
  return lesson;
}

function missingScenario(lessonKey: string): never {
  throw new Error(`${lessonKey} senaryosu paketinde yok.`);
}

export function juniorContentSource(): JuniorContentSource {
  return {
    course(slug) {
      const bundle = juniorCalendarBundle(slug);
      return { outcomes: bundle.outcomes, topics: bundle.topics, weeks: bundle.weeks };
    },
    scenario(lessonKey) {
      const state = load();
      if (state.shells.has(lessonKey)) {
        throw new Error(`${lessonKey} kab taslağıdır. Oynatıcıya verilmez.`);
      }
      const scenario = state.scenarios.get(lessonKey);
      if (!scenario) {
        missingScenario(lessonKey);
      }
      return scenario;
    },
    quiz(lessonKey) {
      const quiz = load().quizzes.get(lessonKey);
      if (!quiz) {
        throw new Error(`${lessonKey} quiz paketi yok.`);
      }
      return quiz;
    },
  };
}

/** Mühürlü senaryo. Kablar bu diziye girmez. Sıra dosya numarasıdır; matematik `jr_06_mat-1` ile açılır. */
export function juniorSealedCourseLessons(slug: JuniorCourseSlug): readonly JuniorLessonScript[] {
  return sealedKeys(slug).map((key) => scriptFor(key));
}

/** Fırın adayları: yazılmış, kab olmayan ve sesi henüz fırınlanmamış dersler. Yalnız ses fırını betiği okur; raf bunu kullanmaz. */
export function juniorBakeCandidateLessons(slug: JuniorCourseSlug): readonly JuniorLessonScript[] {
  return authoredKeys(slug)
    .filter((key) => !juniorLessonHasBakedAudio(key))
    .map((key) => scriptFor(key));
}

/**
 * Mühürlü derslerin soru paketleri. Kapı, quiz JSON'unu okur.
 * JSON, TypeScript yazar dosyasının tek yönlü ihracıdır; ikinci bir düzenleme evi değildir.
 */
export function juniorSealedQuizPacks(slug: JuniorCourseSlug): readonly JuniorLessonQuizPack[] {
  const source = juniorContentSource();
  return sealedKeys(slug).map((key) => source.quiz(key));
}

/**
 * Ses manifestine girmiş seçmeli derslerin soru paketleri.
 * Manifestte olmayan taslak, çalışma zamanı dizinine girmez.
 */
export function juniorElectiveQuizPacks(): readonly JuniorLessonQuizPack[] {
  const state = load();
  return [...state.quizzes.keys()]
    .filter((key) => JUNIOR_ELECTIVE_LESSON_KEY_PATTERN.test(key) && juniorLessonHasBakedAudio(key))
    .sort((left, right) => {
      const leftSlug = left.slice(0, left.lastIndexOf("-"));
      const rightSlug = right.slice(0, right.lastIndexOf("-"));
      if (leftSlug !== rightSlug) {
        return leftSlug < rightSlug ? -1 : 1;
      }
      return lessonNumber(left) - lessonNumber(right);
    })
    .map((key) => {
      const quiz = state.quizzes.get(key);
      if (!quiz) {
        throw new Error(`${key} quiz paketi yok.`);
      }
      return quiz;
    });
}

export function juniorTopicIsShell(lessonKey: string): boolean {
  return load().shells.has(lessonKey);
}

/** Kab (yer tutucu, ~235 bayt) konu anahtarları. Envanter sayımına girmez. */
export function juniorShellLessonKeys(): readonly string[] {
  return [...load().shells].sort();
}

/**
 * Envanter sayımı (Görev Paketi #02): yalnız mühürlü/senaryolu dersler sayılır.
 * `shell: true` yer tutucuları veliye "kaç ders var?" cevabına dahil edilmez;
 * katalog rafı da yalnız `juniorSealedCourseLessons` üzerinden kurulur.
 */
export function juniorSealedLessonInventoryCount(slug: JuniorCourseSlug): number {
  return sealedKeys(slug).length;
}

/** Mühürlü senaryo. Kab ve pakette olmayan seçmeli konuda yoktur. */
export function juniorScenarioIfPresent(lessonKey: string): JuniorLessonScenario | null {
  const state = load();
  if (state.shells.has(lessonKey)) {
    return null;
  }
  return state.scenarios.get(lessonKey) ?? null;
}
