import { describe, expect, it } from "vitest";
import {
  gradeJuniorTopicEndQuiz,
  juniorIngQuizLessonKeys,
  juniorIngQuizQuestionCount,
  juniorQuizPack,
  juniorTellGuides,
  juniorTopicEndQuestions,
  publicJuniorTopicEndQuiz,
} from "@/lib/junior/quiz";
import { juniorSealedCourseLessons } from "@/lib/junior/content-source";
import { JUNIOR_ING_QUIZ_PACKS } from "@/lib/junior/quiz/ing";
import { publicJuniorPractice } from "@/lib/junior/practice";
import { juniorTellSystemPrompt } from "@/lib/junior/tell";

describe("Junior İngilizce konu sonu soru arşivi", () => {
  it("mühürlü İngilizce derslerinde üç çözümlü soru taşır", () => {
    const keys = juniorIngQuizLessonKeys();
    expect(JUNIOR_ING_QUIZ_PACKS).toHaveLength(keys.length);
    // 111 mühürlü katalogun İngilizce payı 14 derstir (JUNIOR_SEALED_ROSTER: ing). Soru arşivi tam olarak bunları kapsar.
    const sealed = juniorSealedCourseLessons("jr_06_ing_main").map((lesson) => lesson.key);
    expect(sealed).toHaveLength(14);
    expect([...keys].sort()).toEqual([...sealed].sort());
    expect(juniorIngQuizQuestionCount()).toBe(keys.length * 3);
    for (const key of keys) {
      const pack = juniorQuizPack(key);
      expect(pack).not.toBeNull();
      expect(pack?.questions).toHaveLength(3);
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
      expect(juniorTopicEndQuestions(key).map((row) => row.level)).toEqual([
        "concept",
        "apply",
        "skill",
      ]);
    }
  });

  it("istemciye doğru şık sızdırmaz", () => {
    const shown = publicJuniorTopicEndQuiz("jr_06_ing_main-1");
    expect(shown).toHaveLength(3);
    expect(JSON.stringify(shown)).not.toContain("correctAnswerIndex");
    expect(JSON.stringify(shown)).not.toContain("explanation");
    expect(shown.every((row) => row.hint.length > 0)).toBe(true);
  });

  it("pekiştirme İngilizce arşivinden kurulur", () => {
    for (const key of juniorIngQuizLessonKeys()) {
      const practice = publicJuniorPractice(key);
      expect(practice).toHaveLength(3);
      expect(practice.every((row) => row.kind === "choice")).toBe(true);
      expect(JSON.stringify(practice)).not.toContain("correctIndex");
      expect(JSON.stringify(practice)).not.toContain("correctAnswerIndex");
    }
  });

  it("konu sonu puanı açıklamayı döner", () => {
    const keys = juniorTopicEndQuestions("jr_06_ing_main-16");
    const graded = gradeJuniorTopicEndQuiz(
      "jr_06_ing_main-16",
      keys.map((row) => ({ id: row.id, choiceIndex: row.correctAnswerIndex })),
    );
    expect(graded).toEqual({
      score: 100,
      correct: 3,
      total: 3,
      notes: keys.map((row) => ({
        id: row.id,
        ok: true,
        explanation: row.explanation,
        hint: row.hint,
      })),
    });
  });

  it("Hazırım anlat kontrol soruları sistem istemine girer", () => {
    const guides = juniorTellGuides("jr_06_ing_main-1");
    expect(guides.length).toBeGreaterThanOrEqual(2);
    const prompt = juniorTellSystemPrompt({
      title: "Daily routines ve saati söylemek",
      outcomes: [
        "Daily routine, her gün tekrar eden iştir.",
        "Tam, yarım ve çeyrek saat ayrı kalıplarla söylenir.",
      ],
      birthYear: 2014,
      tellGuides: guides,
    });
    expect(prompt).toContain("Kontrol soruları");
    expect(prompt).toContain(guides[0]);
  });
});
