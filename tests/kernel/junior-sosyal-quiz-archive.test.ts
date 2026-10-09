import { describe, expect, it } from "vitest";
import {
  gradeJuniorTopicEndQuiz,
  juniorQuizPack,
  juniorSosyalQuizLessonKeys,
  juniorSosyalQuizQuestionCount,
  juniorTellGuides,
  juniorTopicEndQuestions,
  publicJuniorTopicEndQuiz,
} from "@/lib/junior/quiz";
import { JUNIOR_SOSYAL_QUIZ_PACKS } from "@/lib/junior/quiz/sosyal";
import { publicJuniorPractice } from "@/lib/junior/practice";
import { juniorTellSystemPrompt } from "@/lib/junior/tell";

describe("Junior Sosyal Bilgiler konu sonu soru arşivi", () => {
  it("20 derste 60 çözümlü soru taşır", () => {
    expect(JUNIOR_SOSYAL_QUIZ_PACKS).toHaveLength(20);
    expect(juniorSosyalQuizLessonKeys()).toHaveLength(20);
    expect(juniorSosyalQuizQuestionCount()).toBe(60);
    for (let n = 1; n <= 20; n += 1) {
      const key = `jr_06_sosyal-${n}`;
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
    const shown = publicJuniorTopicEndQuiz("jr_06_sosyal-9");
    expect(shown).toHaveLength(3);
    expect(JSON.stringify(shown)).not.toContain("correctAnswerIndex");
    expect(JSON.stringify(shown)).not.toContain("explanation");
    expect(shown.every((row) => row.hint.length > 0)).toBe(true);
  });

  it("pekiştirme Sosyal arşivinden kurulur", () => {
    for (const key of juniorSosyalQuizLessonKeys()) {
      const practice = publicJuniorPractice(key);
      expect(practice).toHaveLength(3);
      expect(practice.every((row) => row.kind === "choice")).toBe(true);
      expect(JSON.stringify(practice)).not.toContain("correctIndex");
      expect(JSON.stringify(practice)).not.toContain("correctAnswerIndex");
    }
  });

  it("konu sonu puanı açıklamayı döner", () => {
    const keys = juniorTopicEndQuestions("jr_06_sosyal-9");
    const graded = gradeJuniorTopicEndQuiz(
      "jr_06_sosyal-9",
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
    const guides = juniorTellGuides("jr_06_sosyal-4");
    expect(guides.length).toBeGreaterThanOrEqual(2);
    const prompt = juniorTellSystemPrompt({
      title: "Hak, sorumluluk ve özgürlük",
      outcomes: [
        "Hak yetkidir.",
        "Sorumluluk görevdir.",
        "Özgürlük başkasının hakkıyla sınırlanır.",
      ],
      birthYear: 2014,
      tellGuides: guides,
    });
    expect(prompt).toContain("Kontrol soruları");
    expect(prompt).toContain(guides[0]);
  });
});
