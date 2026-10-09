import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { juniorCourseShelves } from "@/lib/junior/catalog";
import { JUNIOR_PILOT_SLUGS, JUNIOR_QUIZ_MIN_ITEMS } from "@/lib/junior/limits";
import { juniorQuizPack } from "@/lib/junior/quiz";
import { isJuniorTopicQuizReady, publicJuniorTopicQuiz } from "@/lib/junior/topic-quiz";

const ROOT = join(process.cwd());

describe("Junior soru evi", () => {
  it("çekirdek konular tek paketten kurulur; ikinci arşiv ve boş tablo durmaz", () => {
    expect(existsSync(join(ROOT, "lib/junior/question-bank.ts"))).toBe(false);
    const schema = readFileSync(join(ROOT, "prisma/schema/junior.prisma"), "utf8");
    const drop = readFileSync(
      join(ROOT, "prisma/migrations/20261008120000_drop_junior_question_bank/migration.sql"),
      "utf8",
    );
    expect(schema).not.toContain("JuniorQuestionBank");
    expect(schema).not.toContain('@@map("junior_question_bank")');
    expect(drop).toContain('DROP TABLE IF EXISTS "junior_question_bank"');

    const coreKeys = juniorCourseShelves()
      .filter((course) => (JUNIOR_PILOT_SLUGS as readonly string[]).includes(course.slug))
      .flatMap((course) => course.lessons.map((lesson) => lesson.key));
    expect(coreKeys.length).toBeGreaterThan(0);
    for (const lessonKey of coreKeys) {
      const pack = juniorQuizPack(lessonKey);
      expect(pack?.questions).toHaveLength(JUNIOR_QUIZ_MIN_ITEMS);
      expect(isJuniorTopicQuizReady(lessonKey)).toBe(true);
      const shown = publicJuniorTopicQuiz(lessonKey);
      expect(shown).toHaveLength(JUNIOR_QUIZ_MIN_ITEMS);
      expect(JSON.stringify(shown)).not.toContain("correctAnswerIndex");
      expect(JSON.stringify(shown)).not.toContain("correctIndex");
    }
    expect(isJuniorTopicQuizReady("jr_06_kod-1")).toBe(false);
  });
});
