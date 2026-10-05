import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { juniorFreeLessonKeys } from "@/lib/junior/catalog";
import { JUNIOR_QUIZ_MIN_ITEMS } from "@/lib/junior/limits";
import {
  JUNIOR_OUTCOME_POOL_CAPACITY,
  JUNIOR_QUESTION_ARCHIVE,
  JUNIOR_QUESTION_TAG,
  JUNIOR_TAG_WEIGHT,
  assembleJuniorQuestionSet,
  juniorOutcomePoolSlot,
  juniorQuizBankLessonKeys,
  juniorQuizSeatPlan,
} from "@/lib/junior/question-bank";
import { isJuniorTopicQuizReady, publicJuniorTopicQuiz } from "@/lib/junior/topic-quiz";

const ROOT = join(process.cwd());

describe("Junior yerel soru arşivi", () => {
  it("yüz bin kazanım yuvası statik kalıba bağlıdır", () => {
    expect(JUNIOR_OUTCOME_POOL_CAPACITY).toBeGreaterThanOrEqual(100_000);
    expect(JUNIOR_QUESTION_ARCHIVE.length).toBeGreaterThanOrEqual(JUNIOR_QUIZ_MIN_ITEMS);
    const first = juniorOutcomePoolSlot(0);
    const again = juniorOutcomePoolSlot(JUNIOR_QUESTION_ARCHIVE.length);
    const last = juniorOutcomePoolSlot(JUNIOR_OUTCOME_POOL_CAPACITY - 1);
    expect(first?.patternId).toBe(JUNIOR_QUESTION_ARCHIVE[0]?.id);
    expect(first?.variant).toBe(0);
    expect(again?.patternId).toBe(first?.patternId);
    expect(again?.variant).toBe(1);
    expect(last?.outcomeCode.length).toBeGreaterThan(0);
    expect(juniorOutcomePoolSlot(JUNIOR_OUTCOME_POOL_CAPACITY)).toBeNull();
    expect(juniorOutcomePoolSlot(-1)).toBeNull();
  });

  it("on sorunun yedisi son dönem trendidir", () => {
    expect(juniorQuizSeatPlan()).toEqual({ trend: 7, parallel: 3 });
    expect(JUNIOR_TAG_WEIGHT[JUNIOR_QUESTION_TAG.TREND]).toBe(70);
    expect(JUNIOR_TAG_WEIGHT[JUNIOR_QUESTION_TAG.PARALLEL]).toBe(30);
    const banked = juniorQuizBankLessonKeys();
    expect(banked).toEqual(["jr_06_mat-1", "jr_06_fen-1", "jr_06_turkce-1"]);
    expect(juniorFreeLessonKeys().filter((key) => !banked.includes(key)).length).toBeGreaterThan(0);
    expect(isJuniorTopicQuizReady("jr_06_ing_main-1")).toBe(false);
    for (const lessonKey of banked) {
      const set = assembleJuniorQuestionSet(lessonKey);
      expect(set).toHaveLength(JUNIOR_QUIZ_MIN_ITEMS);
      const trend = set.filter((row) => row.tag === JUNIOR_QUESTION_TAG.TREND);
      const parallel = set.filter((row) => row.tag === JUNIOR_QUESTION_TAG.PARALLEL);
      expect(trend).toHaveLength(7);
      expect(parallel).toHaveLength(3);
      expect(trend.every((row) => row.weight === 70 && row.patternYear >= 2024)).toBe(true);
      expect(parallel.every((row) => row.weight === 30 && row.patternYear <= 2023)).toBe(true);
      const shown = publicJuniorTopicQuiz(lessonKey);
      expect(shown.map((row) => row.id)).toEqual(set.map((row) => row.itemId));
      expect(JSON.stringify(shown)).not.toContain("correctIndex");
      expect(JSON.stringify(shown)).not.toContain("weight");
    }
  });

  it("tablo aynı etiketi ve katsayıyı taşır", () => {
    const schema = readFileSync(join(ROOT, "prisma/schema/junior.prisma"), "utf8");
    const sql = readFileSync(
      join(ROOT, "prisma/migrations/20261005000300_junior_question_bank/migration.sql"),
      "utf8",
    );
    expect(schema).toContain('@@map("junior_question_bank")');
    expect(sql).toContain('CREATE TABLE "junior_question_bank"');
    expect(sql).toContain("Son Dönem MEB/LGS Trendi");
    expect(sql).toContain("Çıkmış Soru Paraleli");
    expect(sql).toContain('"weight" = 70');
    expect(sql).toContain('"weight" = 30');
    expect(sql).not.toMatch(/"user_id"/);
  });
});
