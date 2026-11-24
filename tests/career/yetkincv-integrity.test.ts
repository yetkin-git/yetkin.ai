import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  YETKINCV_BANK_MIN,
  YETKINCV_MAX_ATTEMPTS,
  YETKINCV_SESSION_SIZE,
  gradeYetkinCvExam,
  yetkinCvBuildChoiceOrder,
  yetkinCvCorrectIndexDistribution,
  yetkinCvPickSessionQuestions,
  yetkinCvPublicQuestions,
  yetkinCvQuestions,
  yetkinCvRemapAnswers,
  yetkinCvRemapDisplayedChoice,
} from "@/lib/career/yetkincv";
import { YETKINCV_VERTICALS } from "@/lib/career/yetkincv-options";

describe("YetkinCV bütünlük (K1, Y3, O5)", () => {
  it("her dikeyde en az 12 soru vardır ve doğru şık dağılımı %40'ı geçmez", () => {
    for (const vertical of YETKINCV_VERTICALS) {
      const bank = yetkinCvQuestions(vertical.id) ?? [];
      expect(bank.length).toBeGreaterThanOrEqual(YETKINCV_BANK_MIN);
      const { maxShare, counts } = yetkinCvCorrectIndexDistribution(bank);
      expect(maxShare).toBeLessThanOrEqual(0.4);
      expect(counts.reduce((a, b) => a + b, 0)).toBe(bank.length);
    }
  });

  it("oturum 8 soru seçer ve şık sırasını karıştırır; remap orijinale döner", () => {
    const bank = yetkinCvQuestions("ecommerce") ?? [];
    const picked = yetkinCvPickSessionQuestions(bank, YETKINCV_SESSION_SIZE, "seed-a");
    expect(picked).toHaveLength(YETKINCV_SESSION_SIZE);
    const order = yetkinCvBuildChoiceOrder(picked, "sitting-seed");
    const pub = yetkinCvPublicQuestions(picked, order);
    expect(JSON.stringify(pub)).not.toContain("correctIndex");
    for (const question of picked) {
      const perm = order[question.id] ?? [];
      expect(perm).toHaveLength(question.choices.length);
      const displayedCorrect = perm.indexOf(question.correctIndex);
      expect(yetkinCvRemapDisplayedChoice(displayedCorrect, perm)).toBe(question.correctIndex);
    }
    const answers = picked.map((question) => {
      const perm = order[question.id] ?? [];
      return { questionId: question.id, choiceIndex: perm.indexOf(question.correctIndex) };
    });
    const remapped = yetkinCvRemapAnswers(answers, order);
    expect(remapped).not.toBeNull();
    const graded = gradeYetkinCvExam(picked, remapped!);
    expect(graded.correctCount).toBe(picked.length);
    expect(graded.score).toBe(100);
  });

  it("aynı şık indeksini her soruda seçmek %100 vermez", () => {
    const bank = yetkinCvQuestions("software") ?? [];
    const picked = yetkinCvPickSessionQuestions(bank, YETKINCV_SESSION_SIZE, "seed-b");
    const allOne = picked.map((question) => ({ questionId: question.id, choiceIndex: 1 }));
    const graded = gradeYetkinCvExam(picked, allOne);
    expect(graded.score).toBeLessThan(100);
  });

  it("deneme limiti sabiti 3'tür; store P2002'de idempotent mühür döner", () => {
    expect(YETKINCV_MAX_ATTEMPTS).toBe(3);
    const store = readFileSync(join(process.cwd(), "lib/career/yetkincv-store.ts"), "utf8");
    expect(store).toContain("YETKINCV_MAX_ATTEMPTS");
    expect(store).toContain("isUniqueConflict");
    expect(store).toContain("choiceOrder");
    expect(store).toContain("yetkinCvPickSessionQuestions");
  });
});
