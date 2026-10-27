import { describe, expect, it } from "vitest";
import {
  gradeJuniorTopicEndQuiz,
  juniorMatQuizLessonKeys,
  juniorMatQuizQuestionCount,
  juniorQuizPack,
  juniorTellGuides,
  juniorTopicEndQuestions,
  publicJuniorTopicEndQuiz,
} from "@/lib/junior/quiz";
import { JUNIOR_MAT_QUIZ_PACKS } from "@/lib/junior/quiz/mat";
import { gradeJuniorActivityRail, publicJuniorActivityRail } from "@/lib/junior/activity-rail";
import { juniorCatalogLessonKeys } from "@/lib/junior/catalog";
import { publicJuniorPractice } from "@/lib/junior/practice";
import { juniorTellSystemPrompt } from "@/lib/junior/tell";

describe("Junior matematik konu sonu soru arşivi", () => {
  it("mühürlü matematik derslerinde üç çözümlü soru taşır", () => {
    const keys = juniorMatQuizLessonKeys();
    expect(JUNIOR_MAT_QUIZ_PACKS).toHaveLength(keys.length);
    expect(keys).toHaveLength(26);
    const openerCount = juniorQuizPack("jr_06_mat-1")?.questions.length ?? 0;
    expect(openerCount).toBe(8);
    expect(juniorMatQuizQuestionCount()).toBe((keys.length - 1) * 3 + openerCount);
    for (const key of keys) {
      const pack = juniorQuizPack(key);
      expect(pack).not.toBeNull();
      expect(pack?.questions).toHaveLength(key === "jr_06_mat-1" ? 8 : 3);
      expect(pack?.tellGuides.length).toBeGreaterThanOrEqual(2);
      expect(pack?.tellGuides.length).toBeLessThanOrEqual(3);
      for (const question of pack?.questions ?? []) {
        expect(question.options).toHaveLength(4);
        expect(question.correctAnswerIndex).toBeGreaterThanOrEqual(0);
        expect(question.correctAnswerIndex).toBeLessThanOrEqual(3);
        expect(question.hint.length).toBeGreaterThan(8);
        expect(question.explanation.length).toBeGreaterThan(20);
        expect(["concept", "apply", "skill"]).toContain(question.level);
      }
      if (key !== "jr_06_mat-1") {
        expect(juniorTopicEndQuestions(key).map((row) => row.level)).toEqual([
          "concept",
          "apply",
          "skill",
        ]);
      }
    }
  });

  it("istemciye doğru şık sızdırmaz", () => {
    const shown = publicJuniorTopicEndQuiz("jr_06_mat-1");
    expect(shown).toHaveLength(8);
    expect(JSON.stringify(shown)).not.toContain("correctAnswerIndex");
    expect(JSON.stringify(shown)).not.toContain("explanation");
    expect(shown.every((row) => row.hint.length > 0)).toBe(true);
  });

  it("pilot etkinlik şeridi üç seçmeliyi bozmaz ve anahtarı sızdırmaz", () => {
    for (const key of juniorCatalogLessonKeys()) {
      const rail = publicJuniorActivityRail(key);
      expect(rail.map((row) => row.kind), key).toEqual(["match", "cloze", "order"]);
      const blob = JSON.stringify(rail);
      expect(blob, key).not.toContain("pairs");
      expect(blob, key).not.toContain("accepts");
      expect(blob, key).not.toContain("sequence");
      const order = rail.find((row) => row.kind === "order");
      const cloze = rail.find((row) => row.kind === "cloze");
      if (order?.kind !== "order" || cloze?.kind !== "cloze") {
        continue;
      }
      const graded = gradeJuniorActivityRail(key, [
        { id: order.id, order: order.tiles.map((tile) => tile.id) },
        { id: cloze.id, cloze: "yokboylekelime" },
      ]);
      const orderNote = graded?.notes.find((note) => note.id === order.id);
      const clozeNote = graded?.notes.find((note) => note.id === cloze.id);
      expect(orderNote?.ok, key).toBe(false);
      expect(orderNote?.cards.every((card) => card.answer === undefined), key).toBe(true);
      expect(clozeNote?.ok, key).toBe(false);
      expect(clozeNote?.cards[0]?.ok, key).toBe(false);
      expect((clozeNote?.cards[0]?.answer ?? "").length, key).toBeGreaterThan(0);
    }
    expect(publicJuniorPractice("jr_06_mat-1")).toHaveLength(8);
  });

  it("pekiştirme matematik arşivinden kurulur", () => {
    for (const key of juniorMatQuizLessonKeys()) {
      const practice = publicJuniorPractice(key);
      expect(practice).toHaveLength(key === "jr_06_mat-1" ? 8 : 3);
      expect(practice.every((row) => row.kind === "choice")).toBe(true);
      expect(JSON.stringify(practice)).not.toContain("correctIndex");
      expect(JSON.stringify(practice)).not.toContain("correctAnswerIndex");
    }
  });

  it("konu sonu puanı açıklamayı döner", () => {
    const keys = juniorTopicEndQuestions("jr_06_mat-1");
    const graded = gradeJuniorTopicEndQuiz(
      "jr_06_mat-1",
      keys.map((row) => ({ id: row.id, choiceIndex: row.correctAnswerIndex })),
    );
    expect(graded).toEqual({
      score: 100,
      correct: keys.length,
      total: keys.length,
      notes: keys.map((row) => ({
        id: row.id,
        ok: true,
        explanation: row.explanation,
        hint: row.hint,
      })),
    });
  });

  it("Hazırım anlat kontrol soruları sistem istemine girer", () => {
    const guides = juniorTellGuides("jr_06_mat-1");
    expect(guides.length).toBeGreaterThanOrEqual(2);
    const prompt = juniorTellSystemPrompt({
      title: "Üslü ifadede taban ve üs",
      outcomes: ["Taban alttadır.", "Üs çarpım sayısını söyler."],
      birthYear: 2014,
      tellGuides: guides,
    });
    expect(prompt).toContain("Kontrol soruları");
    expect(prompt).toContain(guides[0]);
  });
});
