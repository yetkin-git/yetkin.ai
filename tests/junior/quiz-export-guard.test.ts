import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { JUNIOR_SEALED_ROSTER } from "../../packages/junior-content/src/sealed-roster";

const QUIZ_LOADERS = import.meta.glob("../../lib/junior/quiz/*/*.ts") as Record<
  string,
  () => Promise<Record<string, unknown>>
>;

function isQuiz(value: unknown): value is { lessonKey: string; questions: unknown[] } {
  return Boolean(value && typeof value === "object" && "lessonKey" in value && "questions" in value);
}

function loaderFor(dir: string, n: number): (() => Promise<Record<string, unknown>>) | null {
  const suffix = `/lib/junior/quiz/${dir}/${n}.ts`;
  const key = Object.keys(QUIZ_LOADERS).find((item) => item.replaceAll("\\", "/").endsWith(suffix));
  return key ? QUIZ_LOADERS[key] ?? null : null;
}

describe("junior quiz tek ev", () => {
  it("JSON, TypeScript yazar dosyasıyla birebir aynıdır", async () => {
    const root = process.cwd();
    for (const course of JUNIOR_SEALED_ROSTER) {
      for (const n of course.numbers) {
        const key = `${course.prefix}-${n}`;
        const load = loaderFor(course.quizDir, n);
        expect(load, key).toBeTruthy();
        if (!load) {
          continue;
        }
        const quizMod = await load();
        const quiz = Object.values(quizMod).find(isQuiz);
        const disk = JSON.parse(
          readFileSync(join(root, "packages", "junior-content", "quiz", `${key}.json`), "utf8"),
        ) as unknown;
        expect(quiz, key).toBeTruthy();
        expect(disk, key).toEqual(quiz);
      }
    }
  });
});
